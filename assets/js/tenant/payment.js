// tenant/payment.js — mock card form + receipt modal

import { store } from '../store.js';
import { currentUser, requireRole } from '../auth.js';
import { push } from '../notifications.js';
import { toast, modal, formatCurrency, formatDateTime, escapeHtml } from '../ui.js';

if (!requireRole('tenant')) throw new Error('unauthorized');

function render() {
  const user = currentUser();
  const tenant = store.list('tenants').find(t => t.userId === user.id);
  const root = document.getElementById('pay-root');
  if (!tenant) {
    root.innerHTML = `<div class="empty-state"><div class="empty-state__title">No active rental</div><a href="rent.html" class="btn btn--primary">Browse rentals</a></div>`;
    return;
  }
  const rental = store.get('rentals', tenant.rentalId);
  const amount = rental?.pricePerMonth || 0;

  const nextMonth = new Date();
  nextMonth.setMonth(nextMonth.getMonth() + 1);
  nextMonth.setDate(1);
  const monthLabel = nextMonth.toLocaleString('en-GB', { month: 'long', year: 'numeric' });

  root.innerHTML = `
    <div class="grid grid--2 mb-6">
      <div class="pay-due-card" style="align-self:start;">
        <div class="text-sm" style="opacity:0.85;">Balance due</div>
        <div class="pay-due-card__amount">${formatCurrency(amount)}</div>
        <div class="pay-due-card__meta">${escapeHtml(rental?.title || '')} &middot; ${monthLabel}</div>
      </div>

      <form class="card" id="pay-form" novalidate>
        <h3 class="card__title">Pay now</h3>
        <div class="stack">
          <div class="field">
            <label class="field__label" for="card-num">Card number</label>
            <input class="input" id="card-num" inputmode="numeric" placeholder="4242 4242 4242 4242" required />
          </div>
          <div class="form-grid">
            <div class="field">
              <label class="field__label" for="card-exp">Expiry</label>
              <input class="input" id="card-exp" placeholder="MM/YY" required />
            </div>
            <div class="field">
              <label class="field__label" for="card-cvv">CVV</label>
              <input class="input" id="card-cvv" inputmode="numeric" placeholder="123" required />
            </div>
          </div>
          <div class="field">
            <label class="field__label" for="card-name">Name on card</label>
            <input class="input" id="card-name" value="${escapeHtml(user.name || '')}" required />
          </div>
          <button class="btn btn--primary btn--block" type="submit" id="pay-btn">
            Pay ${formatCurrency(amount)}
          </button>
        </div>
      </form>
    </div>
  `;

  document.getElementById('pay-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const num = document.getElementById('card-num').value.replace(/\s+/g, '');
    const exp = document.getElementById('card-exp').value.trim();
    const cvv = document.getElementById('card-cvv').value.trim();

    if (num.length < 12 || num.length > 19) { toast({ variant:'error', title:'Invalid card number' }); return; }
    if (!/^\d{2}\/\d{2}$/.test(exp))         { toast({ variant:'error', title:'Invalid expiry (MM/YY)' }); return; }
    if (cvv.length < 3 || cvv.length > 4)    { toast({ variant:'error', title:'Invalid CVV' }); return; }

    const btn = document.getElementById('pay-btn');
    btn.disabled = true;
    btn.textContent = 'Processing...';

    setTimeout(() => {
      const last4 = num.slice(-4);
      const method = `Card ••${last4}`;
      const payment = store.insert('payments', {
        tenantId: tenant.id,
        rentalId: tenant.rentalId,
        amount,
        method,
        date: new Date().toISOString(),
        status: 'paid',
        receiptNo: store.nextReceiptNo(),
      });

      push({
        type: 'payment',
        title: `Payment received ${formatCurrency(amount)}`,
        message: `${user.name} paid for ${rental?.title || 'rental'} (${payment.receiptNo}).`,
        targetRole: 'admin',
      });

      toast({ variant:'success', title:'Payment successful', body:`Receipt ${payment.receiptNo} issued.` });

      modal({
        title: 'Payment successful',
        bodyHtml: `
          <dl class="receipt">
            <dt>Receipt no</dt>  <dd>${payment.receiptNo}</dd>
            <dt>Amount</dt>      <dd>${formatCurrency(payment.amount)}</dd>
            <dt>Method</dt>      <dd>${escapeHtml(payment.method)}</dd>
            <dt>Date</dt>        <dd>${formatDateTime(payment.date)}</dd>
            <dt>Rental</dt>      <dd>${escapeHtml(rental?.title || '')}</dd>
          </dl>`,
        footerHtml: `
          <button class="btn btn--ghost" data-act="close">Close</button>
          <a href="tenant/reports.html" class="btn btn--primary">View reports</a>`,
        onOpen: (root) => {
          root.querySelector('[data-act="close"]').addEventListener('click', () => root.querySelector('.modal__close').click());
        },
      });

      setTimeout(render, 100);
    }, 1500);
  });
}

window.addEventListener('partials:ready', render, { once: true });
if (document.readyState !== 'loading') render();
