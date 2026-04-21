// admin/settings.js — company settings + reset

import { store } from '../store.js';
import { requireRole } from '../auth.js';
import { toast, confirmDialog, fileToDataUrl, escapeHtml } from '../ui.js';

if (!requireRole('admin')) throw new Error('unauthorized');

let logoData = '';

function load() {
  const s = store.get('settings') || {};
  document.getElementById('s-name').value = s.companyName || '';
  document.getElementById('s-currency').value = s.currency || 'RM';
  logoData = s.logoUrl || '';
  document.getElementById('s-logo-preview').innerHTML = logoData ? `<img src="${escapeHtml(logoData)}" />` : '';
}

function wire() {
  load();

  document.getElementById('s-logo').addEventListener('change', async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    logoData = await fileToDataUrl(file);
    document.getElementById('s-logo-preview').innerHTML = `<img src="${escapeHtml(logoData)}" />`;
  });

  document.getElementById('company-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const s = store.get('settings') || {};
    const next = {
      ...s,
      companyName: document.getElementById('s-name').value.trim(),
      currency: document.getElementById('s-currency').value,
      logoUrl: logoData,
    };
    store.set('settings', next);
    toast({ variant:'success', title:'Settings saved' });
  });

  document.getElementById('reset-btn').addEventListener('click', async () => {
    const ok = await confirmDialog({
      title: 'Reset demo data?',
      body: 'This wipes ALL admin edits, registrations, and payments and restores the initial seed.',
      confirmText: 'Reset everything',
      variant: 'danger',
    });
    if (!ok) return;
    store.resetAll();
    toast({ variant:'success', title:'Demo reset complete', body:'Reloading...' });
    setTimeout(() => window.location.reload(), 800);
  });

  if (window.lucide) window.lucide.createIcons();
}

window.addEventListener('partials:ready', wire, { once: true });
if (document.readyState !== 'loading') wire();
