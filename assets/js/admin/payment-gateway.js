// admin/payment-gateway.js — mock gateway config

import { store } from '../store.js';
import { requireRole } from '../auth.js';
import { toast } from '../ui.js';

if (!requireRole('admin')) throw new Error('unauthorized');

function load() {
  const s = store.get('settings') || {};
  const g = s.paymentGateway || {};
  document.getElementById('g-provider').value = g.provider || 'Stripe';
  document.getElementById('g-pk').value       = g.publicKey || '';
  document.getElementById('g-sk').value       = g.secretKey || '';
  document.getElementById('g-webhook').value  = g.webhookUrl || '';
  document.getElementById('g-enabled').checked = !!g.enabled;
  document.getElementById('g-test').checked    = !!g.testMode;
}

function wire() {
  load();
  document.getElementById('gw-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const s = store.get('settings') || {};
    const next = {
      ...s,
      paymentGateway: {
        provider:   document.getElementById('g-provider').value,
        publicKey:  document.getElementById('g-pk').value,
        secretKey:  document.getElementById('g-sk').value,
        webhookUrl: document.getElementById('g-webhook').value,
        enabled:    document.getElementById('g-enabled').checked,
        testMode:   document.getElementById('g-test').checked,
      },
    };
    store.set('settings', next);
    toast({ variant:'success', title:'Gateway saved' });
  });
  if (window.lucide) window.lucide.createIcons();
}

window.addEventListener('partials:ready', wire, { once: true });
if (document.readyState !== 'loading') wire();
