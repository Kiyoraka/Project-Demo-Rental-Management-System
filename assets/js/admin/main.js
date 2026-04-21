// admin/main.js — stat cards, revenue chart, recent payments, notifications

import { store } from '../store.js';
import { requireRole } from '../auth.js';
import { listFor } from '../notifications.js';
import { formatCurrency, formatDate, escapeHtml, relativeTime } from '../ui.js';

if (!requireRole('admin')) throw new Error('unauthorized');

function renderStats() {
  const rentals = store.list('rentals');
  const tenants = store.list('tenants').filter(t => t.status === 'active');
  const payments = store.list('payments');

  const monthStart = new Date();
  monthStart.setDate(1); monthStart.setHours(0,0,0,0);
  const monthRevenue = payments
    .filter(p => new Date(p.date) >= monthStart && p.status === 'paid')
    .reduce((s, p) => s + p.amount, 0);

  const occupied = rentals.filter(r => r.status === 'occupied').length;
  const occPct = rentals.length ? Math.round((occupied / rentals.length) * 100) : 0;

  const grid = document.getElementById('stat-grid');
  grid.innerHTML = `
    ${statCard('Rentals', rentals.length, 'total', 'building-2')}
    ${statCard('Tenants', tenants.length, 'active', 'users')}
    ${statCard('Revenue', formatCurrency(monthRevenue), 'this month', 'wallet')}
    ${statCard('Occupancy', occPct + '%', `${occupied} of ${rentals.length}`, 'trending-up')}
  `;
}

function statCard(label, value, meta, icon) {
  return `
    <div class="stat-card">
      <div class="row row--between">
        <span class="stat-card__label">${label}</span>
        <span style="color:var(--accent);"><i data-lucide="${icon}"></i></span>
      </div>
      <div class="stat-card__value">${value}</div>
      <div class="stat-card__meta">${meta}</div>
    </div>`;
}

function renderChart() {
  const ctx = document.getElementById('revenue-chart')?.getContext('2d');
  if (!ctx || !window.Chart) return;

  const now = new Date();
  const months = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({ date: d, label: d.toLocaleString('en-GB', { month: 'short' }), total: 0 });
  }

  const payments = store.list('payments').filter(p => p.status === 'paid');
  payments.forEach(p => {
    const d = new Date(p.date);
    const slot = months.find(m => m.date.getFullYear() === d.getFullYear() && m.date.getMonth() === d.getMonth());
    if (slot) slot.total += p.amount;
  });

  new window.Chart(ctx, {
    type: 'line',
    data: {
      labels: months.map(m => m.label),
      datasets: [{
        label: 'Revenue (RM)',
        data: months.map(m => m.total),
        borderColor: '#4f46e5',
        backgroundColor: 'rgba(79, 70, 229, 0.1)',
        borderWidth: 2.5,
        fill: true,
        tension: 0.35,
        pointBackgroundColor: '#4f46e5',
        pointRadius: 4,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        y: { beginAtZero: true, ticks: { callback: v => 'RM ' + (v/1000).toFixed(0) + 'k' } },
        x: { grid: { display: false } },
      },
    },
  });
}

function renderRecentPayments() {
  const payments = store.list('payments')
    .sort((a,b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5);
  const root = document.getElementById('recent-payments');
  if (payments.length === 0) {
    root.innerHTML = `<div class="empty-state"><div class="empty-state__title">No payments yet</div></div>`;
    return;
  }
  root.innerHTML = `
    <div class="table-wrap" style="border:none;">
      <table class="table">
        <thead><tr><th>Receipt</th><th>Tenant</th><th>Rental</th><th>Amount</th><th>Date</th></tr></thead>
        <tbody>
          ${payments.map(p => {
            const tenant = store.get('tenants', p.tenantId);
            const rental = store.get('rentals', p.rentalId);
            const user = tenant ? store.get('users', tenant.userId) : null;
            return `
              <tr>
                <td>${escapeHtml(p.receiptNo)}</td>
                <td>${escapeHtml(user?.name || tenant?.name || '—')}</td>
                <td>${escapeHtml(rental?.title || '—')}</td>
                <td>${formatCurrency(p.amount)}</td>
                <td>${formatDate(p.date)}</td>
              </tr>`;
          }).join('')}
        </tbody>
      </table>
    </div>`;
}

function renderNotifList() {
  const root = document.getElementById('notif-list-main');
  const items = listFor('admin').slice(0, 6);
  if (items.length === 0) {
    root.innerHTML = `<div class="empty-state"><div class="empty-state__title">All caught up</div></div>`;
    return;
  }
  root.innerHTML = `
    <div class="notif-list">
      ${items.map(n => `
        <div class="notif-list__item ${n.read ? '' : 'is-unread'}">
          <div class="notif-dropdown__dot" style="flex-shrink:0;"></div>
          <div style="flex:1;">
            <div style="font-weight:500;">${escapeHtml(n.title)}</div>
            <div class="text-muted text-sm">${escapeHtml(n.message)}</div>
            <div class="text-subtle text-sm">${relativeTime(n.createdAt)}</div>
          </div>
        </div>`).join('')}
    </div>`;
}

function wire() {
  renderStats();
  renderChart();
  renderRecentPayments();
  renderNotifList();
  if (window.lucide) window.lucide.createIcons();
}

window.addEventListener('partials:ready', wire, { once: true });
if (document.readyState !== 'loading') wire();
