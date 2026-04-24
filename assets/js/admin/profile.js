// admin/profile.js — read-only admin account view

import { currentSession, currentUser, requireRole, logout } from '../auth.js';
import { formatDateTime, escapeHtml } from '../ui.js';

if (!requireRole('admin')) throw new Error('unauthorized');

function render() {
  const session = currentSession();
  const user = currentUser();

  const name = user?.name || 'Administrator';
  const email = user?.email || 'admin@gmail.com';
  const role = session?.role ? session.role.charAt(0).toUpperCase() + session.role.slice(1) : 'Admin';

  document.getElementById('p-name').textContent = name;
  document.getElementById('p-email').textContent = email;
  document.getElementById('p-role').textContent = role;
  document.getElementById('p-session').textContent = session?.loggedInAt
    ? formatDateTime(session.loggedInAt)
    : '—';

  document.getElementById('profile-logout-btn')?.addEventListener('click', () => logout());

  if (window.lucide) window.lucide.createIcons();
}

window.addEventListener('partials:ready', render, { once: true });
if (document.querySelector('#p-email')) render();
