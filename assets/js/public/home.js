// public/home.js — render featured rentals

import { store } from '../store.js';
import { formatCurrency, escapeHtml } from '../ui.js';

function renderFeatured() {
  const container = document.getElementById('featured-rentals');
  if (!container) return;

  const rentals = store.list('rentals')
    .filter(r => r.status === 'available')
    .slice(0, 3);
  // If fewer than 3 available, pad with the rest
  if (rentals.length < 3) {
    const rest = store.list('rentals').filter(r => r.status !== 'available').slice(0, 3 - rentals.length);
    rentals.push(...rest);
  }

  container.innerHTML = rentals.map(r => `
    <a href="rent-detail.html?id=${encodeURIComponent(r.id)}" class="rental-card">
      <div class="rental-card__media">
        <img src="${escapeHtml(r.images?.[0] || 'assets/img/rentals/01.jpg')}" alt="${escapeHtml(r.title)}" onerror="this.src='assets/img/rentals/01.jpg'" />
        ${r.status === 'available'
          ? '<span class="rental-card__badge badge badge--success"><span class="badge__dot"></span>Available</span>'
          : '<span class="rental-card__badge badge badge--muted"><span class="badge__dot"></span>Occupied</span>'}
      </div>
      <div class="rental-card__body">
        <div class="rental-card__title">${escapeHtml(r.title)}</div>
        <div class="rental-card__location">${escapeHtml(r.location)}</div>
        <div class="rental-card__price">${formatCurrency(r.pricePerMonth)} <small>/month</small></div>
        <div class="rental-card__specs">
          <span><i data-lucide="bed"></i>${r.bedrooms}</span>
          <span><i data-lucide="bath"></i>${r.bathrooms}</span>
          <span><i data-lucide="square"></i>${r.sqft} sqft</span>
        </div>
        <span class="rental-card__cta">View <i data-lucide="arrow-right"></i></span>
      </div>
    </a>
  `).join('');

  if (window.lucide) window.lucide.createIcons();
}

window.addEventListener('partials:ready', renderFeatured, { once: true });
if (document.readyState !== 'loading') renderFeatured();
