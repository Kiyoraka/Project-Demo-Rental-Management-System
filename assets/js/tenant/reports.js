// tenant/reports.js — personal payment history with filters + CSV

import { store } from '../store.js';
import { currentUser, requireRole } from '../auth.js';
import { formatCurrency, formatDate, escapeHtml } from '../ui.js';

if (!requireRole('tenant')) throw new Error('unauthorized');

let tenant = null;

function yearsAvailable() {
  const years = new Set(store.list('payments')
    .filter(p => p.tenantId === tenant?.id)
    .map(p => new Date(p.date).getFullYear()));
  const now = new Date().getFullYear();
  years.add(now);
  return Array.from(years).sort((a,b) => b - a);
}

function currentFilters() {
  const year = Number(document.getElementById('f-year')?.value);
  const monthVal = document.getElementById('f-month')?.value;
  const month = monthVal === '' ? null : Number(monthVal);
  return { year, month };
}

function getFiltered() {
  const { year, month } = currentFilters();
  return store.list('payments')
    .filter(p => p.tenantId === tenant.id)
    .filter(p => {
      const d = new Date(p.date);
      if (year && d.getFullYear() !== year) return false;
      if (month !== null && d.getMonth() !== month) return false;
      return true;
    })
    .sort((a,b) => new Date(b.date) - new Date(a.date));
}

function render() {
  const list = getFiltered();
  const wrap = document.getElementById('reports-table-wrap');
  const summary = document.getElementById('reports-summary');
  const total = list.reduce((s,p) => s + p.amount, 0);
  summary.textContent = `${list.length} payment${list.length === 1 ? '' : 's'} — total ${formatCurrency(total)}`;

  if (list.length === 0) {
    wrap.innerHTML = `<div class="empty-state"><div class="empty-state__title">No payments for this filter</div></div>`;
    return;
  }

  wrap.innerHTML = `
    <table class="table">
      <thead>
        <tr><th>Receipt</th><th>Date</th><th>Rental</th><th>Amount</th><th>Method</th><th>Status</th></tr>
      </thead>
      <tbody>
        ${list.map(p => {
          const rental = store.get('rentals', p.rentalId);
          return `
            <tr>
              <td data-label="Receipt">${escapeHtml(p.receiptNo)}</td>
              <td data-label="Date">${formatDate(p.date)}</td>
              <td data-label="Rental">${escapeHtml(rental?.title || '—')}</td>
              <td data-label="Amount">${formatCurrency(p.amount)}</td>
              <td data-label="Method">${escapeHtml(p.method)}</td>
              <td data-label="Status"><span class="badge badge--success"><span class="badge__dot"></span>${p.status}</span></td>
            </tr>`;
        }).join('')}
      </tbody>
    </table>`;
}

function exportCsv() {
  const list = getFiltered();
  const rows = [['Receipt','Date','Rental','Amount','Method','Status']];
  list.forEach(p => {
    const rental = store.get('rentals', p.rentalId);
    rows.push([p.receiptNo, new Date(p.date).toISOString(), rental?.title || '', p.amount, p.method, p.status]);
  });
  const csv = rows.map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = `my-payments-${Date.now()}.csv`;
  document.body.appendChild(a); a.click(); a.remove();
  URL.revokeObjectURL(url);
}

function wire() {
  const user = currentUser();
  tenant = store.list('tenants').find(t => t.userId === user.id);
  if (!tenant) {
    document.getElementById('reports-table-wrap').innerHTML = `<div class="empty-state"><div class="empty-state__title">No active rental</div></div>`;
    return;
  }

  const yearSelect = document.getElementById('f-year');
  const years = yearsAvailable();
  yearSelect.innerHTML = years.map(y => `<option value="${y}">${y}</option>`).join('');
  yearSelect.value = String(new Date().getFullYear());

  ['f-year','f-month'].forEach(id => document.getElementById(id).addEventListener('change', render));
  document.getElementById('export-csv').addEventListener('click', exportCsv);

  render();
  if (window.lucide) window.lucide.createIcons();
}

window.addEventListener('partials:ready', wire, { once: true });
if (document.readyState !== 'loading') wire();
