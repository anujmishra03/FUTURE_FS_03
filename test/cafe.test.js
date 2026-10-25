const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');
const http = require('http');
const { createApp } = require('../src/app');

let server, base, mockCrmServer, mockCrmBase;
const crmLeadsReceived = [];
const tempStore = fs.mkdtempSync(path.join(os.tmpdir(), 'cafe-test-'));

const request = async (url, opts = {}) => {
  const headers = { 'Content-Type': 'application/json', ...(opts.headers || {}) };
  const res = await fetch(`${base}${url}`, {
    method: opts.method || 'GET',
    headers,
    body: opts.body ? JSON.stringify(opts.body) : undefined
  });
  const text = await res.text();
  let json = null;
  try { json = JSON.parse(text); } catch (e) { json = text; }
  return { status: res.status, data: json, raw: text };
};

before(async () => {
  // 1. Setup mock CRM server to test live integration
  mockCrmServer = http.createServer((req, res) => {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      crmLeadsReceived.push(JSON.parse(body || '{}'));
      res.writeHead(201, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ok: true, leadId: 999 }));
    });
  });
  await new Promise(r => mockCrmServer.listen(0, r));
  mockCrmBase = `http://127.0.0.1:${mockCrmServer.address().port}`;

  // 2. Setup Cafe server with mock CRM URL
  const app = createApp({ storeDir: tempStore, crmUrl: mockCrmBase });
  await new Promise(r => {
    server = app.listen(0, r);
  });
  base = `http://127.0.0.1:${server.address().port}`;
});

after(() => {
  if (server) server.close();
  if (mockCrmServer) mockCrmServer.close();
  try { fs.rmSync(tempStore, { recursive: true, force: true }); } catch (e) {}
});

test('GET / serves homepage with restaurant meta & schema', async () => {
  const res = await request('/');
  assert.equal(res.status, 200);
  assert.match(res.raw, /The Copper Kettle/);
  assert.match(res.raw, /Restaurant/);
});

test('GET /api/status returns live open/closed hours status', async () => {
  const res = await request('/api/status');
  assert.equal(res.status, 200);
  assert.equal(res.data.ok, true);
  assert.ok(typeof res.data.status.isOpen === 'boolean');
  assert.ok(Array.isArray(res.data.status.schedule));
});

test('GET /api/menu returns full digital menu list', async () => {
  const res = await request('/api/menu');
  assert.equal(res.status, 200);
  assert.equal(res.data.ok, true);
  assert.ok(res.data.items.length >= 10);
});

test('GET /api/menu?category=coffee filters menu by category', async () => {
  const res = await request('/api/menu?category=coffee');
  assert.equal(res.status, 200);
  assert.ok(res.data.items.every(i => i.category === 'coffee'));
});

test('POST /api/reservations validates fields and returns 422 on invalid data', async () => {
  const res = await request('/api/reservations', {
    method: 'POST',
    body: { name: '', email: 'not-an-email', partySize: 50 }
  });
  assert.equal(res.status, 422);
  assert.ok(res.data.fields.name);
  assert.ok(res.data.fields.email);
  assert.ok(res.data.fields.partySize);
});

test('POST /api/reservations accepts booking and forwards to CRM', async () => {
  const res = await request('/api/reservations', {
    method: 'POST',
    body: {
      name: 'Oliver Vance',
      email: 'oliver@vancegroup.com',
      phone: '+1 555-8822',
      date: '2026-11-05',
      time: '19:30',
      partySize: 4,
      seating: 'Garden Patio',
      occasion: 'Anniversary',
      specialRequests: 'Corner table please.'
    }
  });

  assert.equal(res.status, 201);
  assert.equal(res.data.ok, true);
  assert.match(res.data.confirmationCode, /^CK-\d{4}$/);
  assert.equal(res.data.crmSynced, true);

  // Check CRM received the lead
  assert.ok(crmLeadsReceived.length > 0);
  const lastLead = crmLeadsReceived[crmLeadsReceived.length - 1];
  assert.equal(lastLead.name, 'Oliver Vance');
  assert.equal(lastLead.source, 'Café website');
  assert.match(lastLead.message, /Garden Patio/);
});

test('POST /api/contact saves inquiry and forwards to CRM', async () => {
  const res = await request('/api/contact', {
    method: 'POST',
    body: {
      name: 'Emma Watson',
      email: 'emma@watsonstudio.design',
      phone: '+1 555-9933',
      eventType: 'Corporate Catering',
      message: 'Looking for artisanal coffee & morning pastry catering for a 35-person design sprint next month.'
    }
  });

  assert.equal(res.status, 201);
  assert.equal(res.data.ok, true);
});
