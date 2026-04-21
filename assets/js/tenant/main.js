// tenant/main.js — tenant dashboard overview

import { store } from '../store.js';
import { currentUser, requireRole } from '../auth.js';
import { formatCurrency, formatDate, escapeHtml } from '../ui.js';

if (!requireRole('tenant')) throw new Error('unauthorized');

function render() {
  const user = currentUser();
  if (!user) return;

  document.getElementById('welcome-title').textContent = `Welcome back, ${user.name.split(' ')[0]}`;

  const tenant = store.list('tenants').find(t => t.userId === user.id);
  if (!tenant) {
    document.getElementById('tenant-main-root').innerHTML = `
      <div class="empty-state">
        <div class="empty-state__icon"><i data-lucide="home"></i></div>
        <div class="empty-state__title">No active rental</div>
        <div class="empty-state__body">You don't have an active tenancy yet.</div>
        <a href="rent.html" class="btn btn--primary">Browse rentals</a>
      </div>`;
    if (window.lucide) window.lucide.createIcons();
    return;
  }

  const rental = store.get('rentals', tenant.rentalId);
  const payments = store.list('payments')
    .filter(p => p.tenantId === tenant.id)
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  const thisMonth = new Date();
  const mStart = new Date(thisMonth.getFullYear(), thisMonth.getMonth(), 1);
  const monthPaid = payments.filter(p => new Date(p.date) >= mStart && p.status === 'paid');

  const nextDue = (() => {
    const d = new Date(thisMonth.getFullYear(), thisMonth.getMonth() + 1, 1);
    return d;
  })();

  const root = document.getElementById('tenant-main-root');
  root.innerHTML = `
    <section class="card mb-6">
      <h3 class="card__title">Current rental</h3>
      <div class="rental-summary">
        <img class="rental-summary__img" src="${escapeHtml(rental?.images?.[0] || 'assets/img/rentals/01.jpg')}" alt="${escapeHtml(rental?.title || '')}" onerror="this.src='assets/img/rentals/01.jpg'" />
        <div>
          <h4 class="rental-summary__title">${escapeHtml(rental?.title || '—')}</h4>
          <div class="rental-summary__meta">
            <span><i data-lucide="map-pin"></i>${escapeHtml(rental?.location || '')}</span>
            <span><i data-lucide="bed"></i>${rental?.bedrooms || '—'}</span>
            <span><i data-lucide="bath"></i>${rental?.bathrooms || '—'}</span>
            <span><i data-lucide="square"></i>${rental?.sqft || '—'} sqft</span>
          </div>
          <div class="text-muted text-sm mt-2">Moved in: ${formatDate(tenant.moveInDate)}</div>
        </div>
      </div>
    </section>

    <div class="grid grid--2 mb-6">
      <div class="pay-due-card">
        <div class="text-sm" style="opacity:0.85;">Next payment</div>
        <div class="pay-due-card__amount">${formatCurrency(rental?.pricePerMonth || 0)}</div>
        <div class="pay-due-card__meta">Due on ${formatDate(nextDue)}</div>
        <a href="tenant/payment.html" class="btn">Pay Now</a>
      </div>
      <div class="card">
        <h3 class="card__title">This month</h3>
        <div class="stack stack--sm">
          <div class="row row--between"><span class="text-muted">Paid</span><strong>${monthPaid.length}</strong></div>
          <div class="row row--between"><span class="text-muted">Total paid</span><strong>${formatCurrency(monthPaid.reduce((s,p) => s + p.amount, 0))}</strong></div>
          <div class="row row--between"><span class="text-muted">On-time rate</span><strong>100%</strong></div>
        </div>
      </div>
    </div>

    <section class="panel">
      <header class="panel__header">
        <h3 class="panel__title">Recent payments</h3>
        <a href="tenant/reports.html" class="btn btn--link">View all</a>
      </header>
      <div class="panel__body">
        ${payments.length === 0 ? `
          <div class="empty-state">
            <div class="empty-state__title">No payments yet</div>
          </div>` : `
          <div class="mini-list">
            ${payments.slice(0, 5).map(p => `
              <div class="mini-list__item">
                <span>${formatDate(p.date)}</span>
                <span>${formatCurrency(p.amount)}</span>
                <span class="badge badge--success"><span class="badge__dot"></span>${p.status}</span>
                <span class="text-muted text-sm">${escapeHtml(p.receiptNo)}</span>
              </div>`).join('')}
          </div>`}
      </div>
    </section>
  `;

  if (window.lucide) window.lucide.createIcons();
}

window.addEventListener('partials:ready', render, { once: true });
if (document.readyState !== 'loading') render();
