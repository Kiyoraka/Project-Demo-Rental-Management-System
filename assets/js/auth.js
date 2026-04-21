// auth.js — hardcoded login matching + session management

import { store } from './store.js';

const ADMIN_EMAIL = 'admin@gmail.com';
const ADMIN_PASSWORD = 'admin123';

export function login(email, password) {
  email = (email || '').trim().toLowerCase();

  // Hardcoded admin — defensive double check
  if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
    store.set('session', { userId: 'admin-1', role: 'admin', loggedInAt: Date.now() });
    return '/admin/index.html';
  }

  const user = store.list('users').find(
    u => u.email.toLowerCase() === email && u.password === password
  );

  if (!user) throw new Error('Invalid email or password');

  store.set('session', { userId: user.id, role: user.role, loggedInAt: Date.now() });
  return user.role === 'admin' ? '/admin/index.html' : '/tenant/index.html';
}

export function logout(redirect = '/index.html') {
  store.set('session', null);
  window.location.href = redirect;
}

export function currentSession() {
  return store.get('session');
}

export function currentUser() {
  const s = currentSession();
  if (!s) return null;
  return store.list('users').find(u => u.id === s.userId) || null;
}

export function requireRole(role, redirect = '/login.html') {
  const s = currentSession();
  if (!s || s.role !== role) {
    window.location.href = redirect;
    return false;
  }
  return true;
}

export function redirectIfAuthed() {
  const s = currentSession();
  if (!s) return;
  window.location.href = s.role === 'admin' ? '/admin/index.html' : '/tenant/index.html';
}

// Register new tenant — used by public register page
export function registerTenant({ name, email, phone, password, rentalId, moveInDate }) {
  email = (email || '').trim().toLowerCase();
  const users = store.list('users');
  if (users.some(u => u.email.toLowerCase() === email)) {
    throw new Error('This email is already registered');
  }

  const user = store.insert('users', {
    email, password, role: 'tenant', name, avatarUrl: '',
  });

  const tenant = store.insert('tenants', {
    userId: user.id, rentalId, name, phone,
    moveInDate: moveInDate || new Date().toISOString(),
    status: 'active',
  });

  // Mark chosen rental as occupied
  if (rentalId) store.update('rentals', rentalId, { status: 'occupied' });

  // Auto-login
  store.set('session', { userId: user.id, role: 'tenant', loggedInAt: Date.now() });

  return { user, tenant };
}
