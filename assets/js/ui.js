// ui.js — toasts, modals, confirm, formatters

// ===== Toast =====
let toastRoot;
function ensureToastRoot() {
  if (toastRoot) return toastRoot;
  toastRoot = document.querySelector('.toast-container');
  if (!toastRoot) {
    toastRoot = document.createElement('div');
    toastRoot.className = 'toast-container';
    document.body.appendChild(toastRoot);
  }
  return toastRoot;
}

export function toast({ title = '', body = '', variant = 'info', duration = 3000 } = {}) {
  const root = ensureToastRoot();
  const el = document.createElement('div');
  el.className = `toast toast--${variant}`;
  el.innerHTML = `
    <div style="flex:1;">
      ${title ? `<div class="toast__title">${escapeHtml(title)}</div>` : ''}
      ${body  ? `<div class="toast__body">${escapeHtml(body)}</div>`  : ''}
    </div>`;
  root.appendChild(el);
  setTimeout(() => {
    el.style.transition = 'opacity .2s ease, transform .2s ease';
    el.style.opacity = '0';
    el.style.transform = 'translateX(20px)';
    setTimeout(() => el.remove(), 220);
  }, duration);
}

// ===== Modal =====
export function modal({ title = '', bodyHtml = '', footerHtml = '', onOpen, onClose } = {}) {
  const backdrop = document.createElement('div');
  backdrop.className = 'modal-backdrop';
  backdrop.innerHTML = `
    <div class="modal" role="dialog" aria-modal="true">
      <header class="modal__header">
        <h3 class="modal__title">${escapeHtml(title)}</h3>
        <button class="modal__close" aria-label="Close">&times;</button>
      </header>
      <div class="modal__body">${bodyHtml}</div>
      ${footerHtml ? `<footer class="modal__footer">${footerHtml}</footer>` : ''}
    </div>`;
  document.body.appendChild(backdrop);
  requestAnimationFrame(() => backdrop.classList.add('is-open'));

  const close = () => {
    backdrop.classList.remove('is-open');
    setTimeout(() => {
      backdrop.remove();
      if (onClose) onClose();
    }, 180);
  };

  backdrop.querySelector('.modal__close').addEventListener('click', close);
  backdrop.addEventListener('click', (e) => { if (e.target === backdrop) close(); });
  document.addEventListener('keydown', function escClose(ev) {
    if (ev.key === 'Escape') { close(); document.removeEventListener('keydown', escClose); }
  });

  if (onOpen) onOpen(backdrop);

  return { root: backdrop, close };
}

export function confirmDialog({ title = 'Are you sure?', body = '', confirmText = 'Confirm', cancelText = 'Cancel', variant = 'primary' } = {}) {
  return new Promise((resolve) => {
    const m = modal({
      title,
      bodyHtml: `<p>${escapeHtml(body)}</p>`,
      footerHtml: `
        <button class="btn btn--ghost" data-act="cancel">${escapeHtml(cancelText)}</button>
        <button class="btn btn--${variant}" data-act="confirm">${escapeHtml(confirmText)}</button>`,
      onOpen: (root) => {
        root.querySelector('[data-act="cancel"]').addEventListener('click', () => { m.close(); resolve(false); });
        root.querySelector('[data-act="confirm"]').addEventListener('click', () => { m.close(); resolve(true); });
      },
    });
  });
}

// ===== Formatters =====
export function formatCurrency(amount, currency = 'RM') {
  const n = Number(amount || 0);
  return `${currency} ${n.toLocaleString('en-MY', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}

export function formatDate(input, opts = { day: '2-digit', month: 'short', year: 'numeric' }) {
  try {
    const d = input instanceof Date ? input : new Date(input);
    return d.toLocaleDateString('en-GB', opts);
  } catch { return '—'; }
}

export function formatDateTime(input) {
  try {
    const d = input instanceof Date ? input : new Date(input);
    return d.toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  } catch { return '—'; }
}

export function relativeTime(input) {
  const d = input instanceof Date ? input : new Date(input);
  const diff = (Date.now() - d.getTime()) / 1000;
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} h ago`;
  if (diff < 2592000) return `${Math.floor(diff / 86400)} d ago`;
  return formatDate(d);
}

export function escapeHtml(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// File -> base64 helper (used for rental image uploads)
export function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload  = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

// URL query helpers
export function getQuery(name) {
  return new URLSearchParams(window.location.search).get(name);
}
