// admin/tenants.js — tenant management table

import { store } from '../store.js';
import { requireRole } from '../auth.js';
import { toast, confirmDialog, formatDate, escapeHtml } from '../ui.js';

if (!requireRole('admin')) throw new Error('unauthorized');

function getFiltered() {
  const q = (document.getElementById('tenant-search')?.value || '').toLowerCase().trim();
  const status = document.getElementById('tenant-status')?.value || '';
  return store.list('tenants').filter(t => {
    const user = store.get('users', t.userId);
    const email = user?.email || '';
    if (q && !(t.name.toLowerCase().includes(q) || email.toLowerCase().includes(q))) return false;
    if (status && t.status !== status) return false;
    return true;
  });
}

function render() {
  const list = getFiltered();
  const wrap = document.getElementById('tenant-table-wrap');
  if (list.length === 0) {
    wrap.innerHTML = `<div class="empty-state"><div class="empty-state__title">No tenants match</div></div>`;
    return;
  }
  wrap.innerHTML = `
    <table class="table">
      <thead>
        <tr><th>Name</th><th>Email</th><th>Phone</th><th>Rental</th><th>Move-in</th><th>Status</th><th class="text-right">Actions</th></tr>
      </thead>
      <tbody>
        ${list.map(t => {
          const user = store.get('users', t.userId);
          const rental = store.get('rentals', t.rentalId);
          const statusClass = t.status === 'active' ? 'success' : (t.status === 'ended' ? 'muted' : 'warning');
          return `
            <tr>
              <td data-label="Name"><span class="avatar" style="margin-right:8px;">${(t.name || '?').charAt(0).toUpperCase()}</span>${escapeHtml(t.name)}</td>
              <td data-label="Email">${escapeHtml(user?.email || '—')}</td>
              <td data-label="Phone">${escapeHtml(t.phone || '—')}</td>
              <td data-label="Rental">${escapeHtml(rental?.title || '—')}</td>
              <td data-label="Move-in">${formatDate(t.moveInDate)}</td>
              <td data-label="Status"><span class="badge badge--${statusClass}"><span class="badge__dot"></span>${t.status}</span></td>
              <td data-label="Actions" class="table__actions">
                <button class="btn btn--ghost btn--sm" data-act="toggle" data-id="${t.id}" title="${t.status === 'active' ? 'End tenancy' : 'Reactivate'}">
                  <i data-lucide="${t.status === 'active' ? 'user-x' : 'user-check'}"></i>
                </button>
                <button class="btn btn--ghost btn--sm" data-act="delete" data-id="${t.id}" title="Delete"><i data-lucide="trash-2"></i></button>
              </td>
            </tr>`;
        }).join('')}
      </tbody>
    </table>`;

  wrap.querySelectorAll('[data-act="toggle"]').forEach(btn => {
    btn.addEventListener('click', () => {
      const t = store.get('tenants', btn.dataset.id);
      const next = t.status === 'active' ? 'ended' : 'active';
      store.update('tenants', t.id, { status: next });
      toast({ variant:'success', title:`Tenant ${next === 'ended' ? 'ended' : 'reactivated'}` });
      render();
    });
  });

  wrap.querySelectorAll('[data-act="delete"]').forEach(btn => {
    btn.addEventListener('click', async () => {
      const t = store.get('tenants', btn.dataset.id);
      const ok = await confirmDialog({ title: 'Delete tenant?', body: `This removes ${t.name} from the records.`, confirmText: 'Delete', variant: 'danger' });
      if (!ok) return;
      store.remove('tenants', t.id);
      toast({ variant:'success', title:'Tenant deleted' });
      render();
    });
  });

  if (window.lucide) window.lucide.createIcons();
}

function wire() {
  document.getElementById('tenant-search')?.addEventListener('input', render);
  document.getElementById('tenant-status')?.addEventListener('change', render);
  render();
}

window.addEventListener('partials:ready', wire, { once: true });
if (document.readyState !== 'loading') wire();
