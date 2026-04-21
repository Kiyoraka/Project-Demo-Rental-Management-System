// public/register.js — register + auto-login

import { store } from '../store.js';
import { registerTenant } from '../auth.js';
import { push } from '../notifications.js';
import { toast, formatCurrency, getQuery, escapeHtml } from '../ui.js';

function renderTarget() {
  const rentalId = getQuery('rentalId');
  const wrap = document.getElementById('target-rental');
  if (!rentalId || !wrap) return;
  const rental = store.get('rentals', rentalId);
  if (!rental) return;
  wrap.innerHTML = `
    Registering for:
    <strong>${escapeHtml(rental.title)}</strong> — ${formatCurrency(rental.pricePerMonth)}/mo
    <a href="rent.html" class="btn btn--link btn--sm">change</a>`;
}

document.getElementById('register-form')?.addEventListener('submit', (e) => {
  e.preventDefault();

  const name     = document.getElementById('r-name').value.trim();
  const email    = document.getElementById('r-email').value.trim();
  const phone    = document.getElementById('r-phone').value.trim();
  const pwd      = document.getElementById('r-password').value;
  const pwd2     = document.getElementById('r-password2').value;
  const moveIn   = document.getElementById('r-move').value;
  const terms    = document.getElementById('r-terms').checked;
  const rentalId = getQuery('rentalId');

  if (!name || !email || !phone || !pwd || !moveIn) { toast({ variant:'error', title: 'Please fill all fields' }); return; }
  if (pwd !== pwd2) { toast({ variant:'error', title: 'Passwords do not match' }); return; }
  if (pwd.length < 6) { toast({ variant:'error', title: 'Password must be at least 6 characters' }); return; }
  if (!terms) { toast({ variant:'error', title: 'Please accept the terms' }); return; }
  if (!rentalId) { toast({ variant:'error', title: 'No rental selected' }); return; }

  try {
    const { user, tenant } = registerTenant({
      name, email, phone, password: pwd, rentalId, moveInDate: new Date(moveIn).toISOString()
    });
    const rental = store.get('rentals', rentalId);
    push({
      type: 'registration',
      title: 'New tenant registered',
      message: `${name} registered for ${rental?.title || 'a rental'}.`,
      targetRole: 'admin',
    });
    push({
      type: 'system',
      title: 'Welcome to RentHub',
      message: `Your account is ready. Next rent: ${formatCurrency(rental?.pricePerMonth || 0)}.`,
      targetRole: 'tenant',
    });
    toast({ variant:'success', title:'Account created!', body:'Redirecting to your dashboard...' });
    setTimeout(() => { window.location.href = 'tenant/payment.html'; }, 600);
  } catch (err) {
    toast({ variant:'error', title: err.message || 'Registration failed' });
  }
});

window.addEventListener('partials:ready', renderTarget, { once: true });
if (document.readyState !== 'loading') renderTarget();
