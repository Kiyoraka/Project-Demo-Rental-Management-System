// tenant/profile.js — tenant account view + edit

import { store } from '../store.js';
import { currentUser, requireRole, logout } from '../auth.js';
import { formatDate, toast } from '../ui.js';

if (!requireRole('tenant')) throw new Error('unauthorized');

function render() {
  const user = currentUser();
  if (!user) return;

  const tenant = store.list('tenants').find(t => t.userId === user.id);
  const rental = tenant ? store.get('rentals', tenant.rentalId) : null;

  document.getElementById('f-name').value = user.name || '';
  document.getElementById('f-phone').value = tenant?.phone || '';
  document.getElementById('p-email').textContent = user.email || '—';

  document.getElementById('p-unit').textContent = rental
    ? `${rental.title || rental.address || 'Unit'}${rental.unitNo ? ' — ' + rental.unitNo : ''}`
    : 'No active rental';
  document.getElementById('p-movein').textContent = tenant?.moveInDate ? formatDate(tenant.moveInDate) : '—';
  document.getElementById('p-status').textContent = tenant?.status
    ? tenant.status.charAt(0).toUpperCase() + tenant.status.slice(1)
    : '—';

  document.getElementById('profile-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('f-name').value.trim();
    const phone = document.getElementById('f-phone').value.trim();
    if (!name) {
      toast({ title: 'Name is required', variant: 'danger' });
      return;
    }
    store.update('users', user.id, { name });
    if (tenant) store.update('tenants', tenant.id, { name, phone });
    toast({ title: 'Profile updated', variant: 'success' });
    const nameEl = document.getElementById('user-menu-name');
    if (nameEl) nameEl.textContent = name;
    const av = document.querySelector('.user-menu .avatar');
    if (av) av.textContent = name.charAt(0).toUpperCase();
  });

  document.getElementById('profile-logout-btn')?.addEventListener('click', () => logout());

  if (window.lucide) window.lucide.createIcons();
}

window.addEventListener('partials:ready', render, { once: true });
if (document.querySelector('#profile-form')) render();
