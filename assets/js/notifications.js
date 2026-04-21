// notifications.js — push, mark read, unread count filtered by role

import { store } from './store.js';

export function push({ type = 'system', title, message, targetRole = 'admin' }) {
  return store.insert('notifications', {
    type, title, message, targetRole, read: false,
  });
}

export function listFor(role) {
  return store
    .list('notifications')
    .filter(n => n.targetRole === role)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

export function unreadCount(role) {
  return listFor(role).filter(n => !n.read).length;
}

export function markRead(id) {
  return store.update('notifications', id, { read: true });
}

export function markAllRead(role) {
  const all = store.list('notifications');
  const updated = all.map(n =>
    n.targetRole === role ? { ...n, read: true } : n
  );
  store.set('notifications', updated);
}
