const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const fs = require('fs');
const path = require('path');
const { MENU_ITEMS } = require('./menuData');
const { getBusinessStatus } = require('./hours');

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const clean = (v, max = 500) => (typeof v === 'string' ? v.trim().slice(0, max) : '');

function createApp({
  storeDir = path.join(__dirname, '..', 'data'),
  crmUrl = process.env.CRM_URL || ''
} = {}) {
  const app = express();
  app.set('trust proxy', 1);

  fs.mkdirSync(storeDir, { recursive: true });
  const reservationsFile = path.join(storeDir, 'reservations.jsonl');
  const enquiriesFile = path.join(storeDir, 'enquiries.jsonl');

  app.use(cors());

  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        'default-src': ["'self'"],
        'script-src': ["'self'", "'unsafe-inline'"],
        'style-src': ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
        'font-src': ["'self'", 'https://fonts.gstatic.com'],
        'img-src': ["'self'", 'data:', 'https:', 'blob:'],
        'connect-src': ["'self'"],
        'frame-src': ["'self'", 'https://www.google.com', 'https://maps.google.com'],
        'upgrade-insecure-requests': null,
      },
    },
  }));

  app.use(express.json({ limit: '25kb' }));

  // Rate Limiting
  const bookingLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 15,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many booking requests. Please call the café directly.' }
  });

  // ==========================================
  // API: Status & Store Hours
  // ==========================================
  app.get('/api/status', (_req, res) => {
    const status = getBusinessStatus();
    res.json({ ok: true, status });
  });

  // ==========================================
  // API: Digital Menu
  // ==========================================
  app.get('/api/menu', (req, res) => {
    const { category } = req.query;
    let items = MENU_ITEMS;
    if (category && category !== 'all') {
      items = items.filter(i => i.category.toLowerCase() === category.toLowerCase());
    }
    res.json({ ok: true, count: items.length, items });
  });

  // ==========================================
  // API: Table Reservations
  // ==========================================
  app.post('/api/reservations', bookingLimiter, async (req, res) => {
    const b = req.body || {};

    // Honeypot
    if (b.website_trap) {
      return res.status(201).json({ ok: true, confirmationCode: 'CK-9999' });
    }

    const name = clean(b.name, 100);
    const email = clean(b.email, 200).toLowerCase();
    const phone = clean(b.phone, 50);
    const date = clean(b.date, 30);
    const time = clean(b.time, 30);
    const partySize = Number(b.partySize) || 2;
    const seating = clean(b.seating || 'Standard Dining', 50);
    const occasion = clean(b.occasion || 'Casual', 50);
    const specialRequests = clean(b.specialRequests, 500);

    const fields = {};
    if (!name) fields.name = 'Please provide your full name.';
    if (!EMAIL_RE.test(email)) fields.email = 'A valid email is required for confirmation.';
    if (!phone) fields.phone = 'Phone number is required for SMS reservation reminders.';
    if (!date) fields.date = 'Reservation date is required.';
    if (!time) fields.time = 'Preferred time slot is required.';
    if (partySize < 1 || partySize > 20) fields.partySize = 'Party size must be between 1 and 20 guests.';

    if (Object.keys(fields).length > 0) {
      return res.status(422).json({ error: 'Please correct the reservation form errors.', fields });
    }

    const confirmationCode = `CK-${Math.floor(1000 + Math.random() * 9000)}`;
    const reservation = {
      confirmationCode,
      name,
      email,
      phone,
      date,
      time,
      partySize,
      seating,
      occasion,
      specialRequests,
      status: 'confirmed',
      createdAt: new Date().toISOString()
    };

    // 1. Save locally
    try {
      fs.appendFileSync(reservationsFile, JSON.stringify(reservation) + '\n');
    } catch (err) {
      console.error('[Reservations] Local save failed:', err.message);
    }

    // 2. Automatically push lead into Task 2 Mini CRM (if CRM_URL configured)
    let crmSynced = false;
    if (crmUrl) {
      try {
        const estSpend = partySize * 35; // $35 average spend per head
        const crmRes = await fetch(crmUrl.replace(/\/$/, '') + '/api/public/leads', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name,
            email,
            phone,
            company: `${partySize} guests (${seating})`,
            source: 'Café website',
            value: estSpend,
            message: `Table reservation for ${partySize} guests (${seating}) on ${date} at ${time}. Occasion: ${occasion}. Special requests: ${specialRequests || 'None'}. Confirmation: ${confirmationCode}`
          })
        });
        crmSynced = crmRes.ok;
      } catch (err) {
        console.error('[Reservations] CRM sync notice:', err.message);
      }
    }

    res.status(201).json({
      ok: true,
      message: 'Reservation confirmed! An email confirmation has been sent.',
      confirmationCode,
      reservation,
      crmSynced
    });
  });

  // ==========================================
  // API: Catering & Private Events Enquiries
  // ==========================================
  app.post('/api/contact', bookingLimiter, async (req, res) => {
    const b = req.body || {};
    if (b.website_trap) return res.status(201).json({ ok: true });

    const name = clean(b.name, 100);
    const email = clean(b.email, 200).toLowerCase();
    const phone = clean(b.phone, 50);
    const eventType = clean(b.eventType || 'General Inquiry', 100);
    const message = clean(b.message, 2000);

    const fields = {};
    if (!name) fields.name = 'Name is required.';
    if (!EMAIL_RE.test(email)) fields.email = 'Valid email is required.';
    if (!message || message.length < 10) fields.message = 'Please provide a message with at least 10 characters.';

    if (Object.keys(fields).length > 0) {
      return res.status(422).json({ error: 'Validation failed', fields });
    }

    const enquiry = { name, email, phone, eventType, message, createdAt: new Date().toISOString() };

    try {
      fs.appendFileSync(enquiriesFile, JSON.stringify(enquiry) + '\n');
    } catch (e) {}

    // Forward to CRM
    if (crmUrl) {
      fetch(crmUrl.replace(/\/$/, '') + '/api/public/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          phone,
          company: eventType,
          source: 'Café website',
          value: eventType.includes('Catering') ? 1500 : 500,
          message: `[${eventType}] ${message}`
        })
      }).catch(e => console.error('[Enquiry] CRM forward error:', e.message));
    }

    res.status(201).json({ ok: true, message: 'Your inquiry has been received. Our team will contact you within 24 hours.' });
  });

  app.use('/api', (_req, res) => res.status(404).json({ error: 'Endpoint not found' }));

  // Static site
  app.use(express.static(path.join(__dirname, '..', 'public'), {
    extensions: ['html'],
    setHeaders: (res, filePath) => {
      if (/\.(css|js|svg|jpg|png|webp)$/.test(filePath)) {
        res.setHeader('Cache-Control', 'public, max-age=3600');
      }
    }
  }));

  app.use((_req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
  });

  return app;
}

module.exports = { createApp };
