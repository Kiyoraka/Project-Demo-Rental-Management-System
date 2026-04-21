// store.js — thin localStorage wrapper with auto-seed + CRUD

import { cloneSeed } from './seed.js';

const PREFIX = 'renthub:';
const SEEDED_FLAG = `${PREFIX}seeded`;
const COLLECTIONS = ['users', 'rentals', 'tenants', 'payments', 'notifications'];
const SINGLETONS   = ['settings', 'session'];

function key(name) { return PREFIX + name; }

function read(name) {
  try {
    const raw = localStorage.getItem(key(name));
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function write(name, value) {
  localStorage.setItem(key(name), JSON.stringify(value));
}

function uid(prefix = 'id') {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

export const store = {
  seedIfEmpty() {
    if (localStorage.getItem(SEEDED_FLAG)) return;
    const seed = cloneSeed();
    COLLECTIONS.forEach(c => write(c, seed[c] || []));
    write('settings', seed.settings);
    write('session',  seed.session);
    localStorage.setItem(SEEDED_FLAG, String(Date.now()));
  },

  resetAll() {
    COLLECTIONS.forEach(c => localStorage.removeItem(key(c)));
    SINGLETONS.forEach(s   => localStorage.removeItem(key(s)));
    localStorage.removeItem(SEEDED_FLAG);
    this.seedIfEmpty();
  },

  list(collection) {
    return read(collection) || [];
  },

  get(collection, id) {
    if (SINGLETONS.includes(collection)) return read(collection);
    return this.list(collection).find(x => x.id === id);
  },

  set(collection, value) {
    write(collection, value);
  },

  insert(collection, obj) {
    const list = this.list(collection);
    const record = { id: obj.id || uid(collection.slice(0, -1)), createdAt: obj.createdAt || new Date().toISOString(), ...obj };
    list.unshift(record);
    write(collection, list);
    return record;
  },

  update(collection, id, patch) {
    const list = this.list(collection);
    const idx = list.findIndex(x => x.id === id);
    if (idx === -1) return null;
    list[idx] = { ...list[idx], ...patch };
    write(collection, list);
    return list[idx];
  },

  remove(collection, id) {
    const list = this.list(collection).filter(x => x.id !== id);
    write(collection, list);
  },

  // Convenience — returns receipt number like R001, R002, ...
  nextReceiptNo() {
    const payments = this.list('payments');
    const max = payments
      .map(p => parseInt((p.receiptNo || '').replace(/^R/i, ''), 10))
      .filter(n => !Number.isNaN(n))
      .reduce((a, b) => Math.max(a, b), 0);
    return 'R' + String(max + 1).padStart(3, '0');
  },
};

// Auto-seed on module load
store.seedIfEmpty();
