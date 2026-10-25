// The Copper Kettle Café & Bistro - Client Controller
(function () {
  'use strict';

  let menuItems = [];
  let currentCategory = 'all';

  // DOM Elements
  const liveStatusText = document.getElementById('liveStatusText');
  const heroLiveStatus = document.getElementById('heroLiveStatus');
  const scheduleTable = document.getElementById('scheduleTable');
  const menuFilters = document.getElementById('menuFilters');
  const menuGrid = document.getElementById('menuGrid');
  const reservationForm = document.getElementById('reservationForm');
  const resDateInput = document.getElementById('resDate');
  const confirmModal = document.getElementById('confirmModal');
  const btnCloseModal = document.getElementById('btnCloseModal');
  const modalName = document.getElementById('modalName');
  const modalCode = document.getElementById('modalCode');
  const modalDate = document.getElementById('modalDate');
  const modalTime = document.getElementById('modalTime');
  const modalParty = document.getElementById('modalParty');
  const modalSeating = document.getElementById('modalSeating');
  const modalCrmNotice = document.getElementById('modalCrmNotice');

  // Catering Modal
  const enquiryModal = document.getElementById('enquiryModal');
  const btnOpenEnquiry = document.getElementById('btnOpenEnquiry');
  const btnCloseEnquiry = document.getElementById('btnCloseEnquiry');
  const enquiryForm = document.getElementById('enquiryForm');

  // Set min reservation date to today
  if (resDateInput) {
    const today = new Date().toISOString().split('T')[0];
    resDateInput.min = today;
    resDateInput.value = today;
  }

  // --- Fetch Store Status & Operating Hours ---
  async function loadStatus() {
    try {
      const res = await fetch('/api/status');
      const data = await res.json();
      if (!data.ok) return;

      const { isOpen, message, today, schedule } = data.status;
      liveStatusText.textContent = message;

      if (!isOpen) {
        heroLiveStatus.style.background = '#fef2f2';
        heroLiveStatus.style.borderColor = '#fecaca';
        const dot = heroLiveStatus.querySelector('.live-dot');
        if (dot) {
          dot.style.background = '#dc2626';
          dot.style.boxShadow = '0 0 0 3px rgba(220, 38, 38, 0.25)';
        }
      }

      // Populate schedule table
      scheduleTable.innerHTML = schedule.map(item => `
        <tr class="${item.day === today ? 'today' : ''}">
          <td>${item.day} ${item.day === today ? '<span style="font-size:0.75rem; text-transform:uppercase;">(Today)</span>' : ''}</td>
          <td style="text-align: right;">${item.label}</td>
        </tr>
      `).join('');
    } catch (err) {
      console.error('Status load failed:', err);
      liveStatusText.textContent = 'Open Daily · 7:00 AM – 9:00 PM';
    }
  }

  // --- Fetch and Render Digital Menu ---
  async function loadMenu() {
    try {
      const res = await fetch('/api/menu');
      const data = await res.json();
      if (!data.ok) return;
      menuItems = data.items;
      renderMenu();
    } catch (err) {
      console.error('Menu load failed:', err);
    }
  }

  function renderMenu() {
    let filtered = menuItems;
    if (currentCategory !== 'all') {
      filtered = menuItems.filter(item => item.category === currentCategory);
    }

    if (filtered.length === 0) {
      menuGrid.innerHTML = '<p style="text-align:center; grid-column: 1/-1; color: var(--text-muted);">No items found in this section.</p>';
      return;
    }

    menuGrid.innerHTML = filtered.map(item => `
      <div class="menu-item-card">
        <div>
          ${item.badge ? `<span class="menu-badge">${esc(item.badge)}</span>` : ''}
          <div class="menu-item-header">
            <h3 class="menu-item-name">${esc(item.name)}</h3>
            <span class="menu-item-price">$${item.price.toFixed(2)}</span>
          </div>
          <p class="menu-item-desc">${esc(item.description)}</p>
        </div>
        <div class="menu-tags">
          ${item.tags.map(t => `<span class="menu-tag">${esc(t)}</span>`).join('')}
        </div>
      </div>
    `).join('');
  }

  menuFilters.addEventListener('click', (e) => {
    if (!e.target.classList.contains('menu-filter-btn')) return;
    menuFilters.querySelectorAll('.menu-filter-btn').forEach(btn => btn.classList.remove('active'));
    e.target.classList.add('active');
    currentCategory = e.target.dataset.category;
    renderMenu();
  });

  // --- Handle Reservation Form Submission ---
  reservationForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = document.getElementById('btnSubmitReservation');
    btn.disabled = true;
    btn.textContent = 'Securing Table...';

    const payload = {
      name: document.getElementById('resName').value.trim(),
      email: document.getElementById('resEmail').value.trim(),
      phone: document.getElementById('resPhone').value.trim(),
      partySize: document.getElementById('resParty').value,
      date: document.getElementById('resDate').value,
      time: document.getElementById('resTime').value,
      seating: document.getElementById('resSeating').value,
      occasion: document.getElementById('resOccasion').value,
      specialRequests: document.getElementById('resRequests').value.trim()
    };

    try {
      const res = await fetch('/api/reservations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Reservation could not be completed.');
      }

      // Populate confirmation modal
      modalName.textContent = payload.name;
      modalCode.textContent = data.confirmationCode;
      modalDate.textContent = payload.date;
      modalTime.textContent = payload.time;
      modalParty.textContent = payload.partySize;
      modalSeating.textContent = payload.seating;

      if (data.crmSynced) {
        modalCrmNotice.textContent = '✓ Booking enquiry synced directly to Task 2 LeadDesk CRM.';
      } else {
        modalCrmNotice.textContent = '✓ Saved locally in reservations registry.';
      }

      confirmModal.classList.remove('hidden');
      reservationForm.reset();
      if (resDateInput) resDateInput.value = new Date().toISOString().split('T')[0];
    } catch (err) {
      alert('Reservation Error: ' + err.message);
    } finally {
      btn.disabled = false;
      btn.textContent = 'Confirm Reservation';
    }
  });

  btnCloseModal.addEventListener('click', () => {
    confirmModal.classList.add('hidden');
  });

  // --- Catering / Private Events Modal Handlers ---
  btnOpenEnquiry.addEventListener('click', () => enquiryModal.classList.remove('hidden'));
  btnCloseEnquiry.addEventListener('click', () => enquiryModal.classList.add('hidden'));

  enquiryForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const payload = {
      name: document.getElementById('enqName').value.trim(),
      email: document.getElementById('enqEmail').value.trim(),
      phone: document.getElementById('enqPhone').value.trim(),
      eventType: document.getElementById('enqType').value,
      message: document.getElementById('enqMessage').value.trim()
    };

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to submit inquiry.');
      enquiryModal.classList.add('hidden');
      enquiryForm.reset();
      alert('Thank you! Your private event inquiry has been received and forwarded to our events manager.');
    } catch (err) {
      alert('Error: ' + err.message);
    }
  });

  // Helper escape function
  function esc(s) {
    if (!s) return '';
    return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }

  // Init
  loadStatus();
  loadMenu();
})();
