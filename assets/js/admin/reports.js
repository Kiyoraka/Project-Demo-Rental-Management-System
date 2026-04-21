// admin/reports.js — all payments filterable + CSV export

import { store } from '../store.js';
import { requireRole } from '../auth.js';
import { formatCurrency, formatDate, escapeHtml } from '../ui.js';

if (!requireRole('admin')) throw new Error('unauthorized');

function yearsAvailable() {
  const years = new Set(store.list('payments').map(p => new Date(p.date).getFullYear()));
  years.add(new Date().getFullYear());
  return Array.from(years).sort((a,b) => b - a);
}

function currentFilters() {
  const year = Number(document.getElementById('r-year')?.value);
  const monthVal = document.getElementById('r-month')?.value;
  const month = monthVal === '' ? null : Number(monthVal);
  const status = document.getElementById('r-status')?.value || null;
  return { year, month, status };
}

function getFiltered() {
  const { year, month, status } = currentFilters();
  return store.list('payments').filter(p => {
    const d = new Date(p.date);
    if (year && d.getFullYear() !== year) return false;
    if (month !== null && d.getMonth() !== month) return false;
    if (status && p.status !== status) return false;
    return true;
  }).sort((a,b) => new Date(b.date) - new Date(a.date));
}

function render() {
  const list = getFiltered();
  const totalPaid = list.filter(p => p.status === 'paid').reduce((s,p) => s + p.amount, 0);
  const summary = document.getElementById('r-summary');
  summary.textContent = `${list.length} payment${list.length === 1 ? '' : 's'} — paid total ${formatCurrency(totalPaid)}`;

  const wrap = document.getElementById('r-table-wrap');
  if (list.length === 0) {
    wrap.innerHTML = `<div class="empty-state"><div class="empty-state__title">No payments match</div></div>`;
    return;
  }
  wrap.innerHTML = `
    <table class="table">
      <thead><tr><th>Receipt</th><th>Date</th><th>Tenant</th><th>Rental</th><th>Amount</th><th>Method</th><th>Status</th></tr></thead>
      <tbody>
        ${list.map(p => {
          const tenant = store.get('tenants', p.tenantId);
          const user = tenant ? store.get('users', tenant.userId) : null;
          const rental = store.get('rentals', p.rentalId);
          const statusClass = p.status === 'paid' ? 'success' : (p.status === 'pending' ? 'warning' : 'danger');
          return `
            <tr>
              <td data-label="Receipt">${escapeHtml(p.receiptNo)}</td>
              <td data-label="Date">${formatDate(p.date)}</td>
              <td data-label="Tenant">${escapeHtml(user?.name || tenant?.name || '—')}</td>
              <td data-label="Rental">${escapeHtml(rental?.title || '—')}</td>
              <td data-label="Amount">${formatCurrency(p.amount)}</td>
              <td data-label="Method">${escapeHtml(p.method)}</td>
              <td data-label="Status"><span class="badge badge--${statusClass}"><span class="badge__dot"></span>${p.status}</span></td>
            </tr>`;
        }).join('')}
      </tbody>
    </table>`;
}

function exportCsv() {
  const list = getFiltered();
  const rows = [['Receipt','Date','Tenant','Rental','Amount','Method','Status']];
  list.forEach(p => {
    const tenant = store.get('tenants', p.tenantId);
    const user = tenant ? store.get('users', tenant.userId) : null;
    const rental = store.get('rentals', p.rentalId);
    rows.push([p.receiptNo, new Date(p.date).toISOString(), user?.name || tenant?.name || '', rental?.title || '', p.amount, p.method, p.status]);
  });
  const csv = rows.map(r => r.map(v => `"${String(v).replace(/"/g,'""')}"`).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = `payments-${Date.now()}.csv`;
  document.body.appendChild(a); a.click(); a.remove();
  URL.revokeObjectURL(url);
}

function wire() {
  const yearSelect = document.getElementById('r-year');
  yearSelect.innerHTML = yearsAvailable().map(y => `<option value="${y}">${y}</option>`).join('');
  yearSelect.value = String(new Date().getFullYear());
  ['r-year','r-month','r-status'].forEach(id => document.getElementById(id).addEventListener('change', render));
  document.getElementById('export-csv').addEventListener('click', exportCsv);
  render();
  if (window.lucide) window.lucide.createIcons();
}

window.addEventListener('partials:ready', wire, { once: true });
if (document.readyState !== 'loading') wire();
