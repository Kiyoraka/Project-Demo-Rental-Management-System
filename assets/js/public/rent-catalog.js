// public/rent-catalog.js — filterable rental grid

import { store } from '../store.js';
import { formatCurrency, escapeHtml } from '../ui.js';

const grid = () => document.getElementById('rental-grid');
const count = () => document.getElementById('result-count');

function currentFilters() {
  return {
    maxPrice: Number(document.getElementById('f-max')?.value) || null,
    minBed:   Number(document.getElementById('f-bed')?.value) || null,
    status:   document.getElementById('f-status')?.value || null,
  };
}

function apply(rentals, f) {
  return rentals.filter(r => {
    if (f.maxPrice && r.pricePerMonth > f.maxPrice) return false;
    if (f.minBed && r.bedrooms < f.minBed) return false;
    if (f.status && r.status !== f.status) return false;
    return true;
  });
}

function render() {
  const all = store.list('rentals');
  const list = apply(all, currentFilters());
  if (count()) count().textContent = `Showing ${list.length} rental${list.length === 1 ? '' : 's'}`;

  if (list.length === 0) {
    grid().innerHTML = `
      <div class="empty-state" style="grid-column: 1 / -1;">
        <div class="empty-state__icon"><i data-lucide="search-x"></i></div>
        <div class="empty-state__title">No rentals match</div>
        <div class="empty-state__body">Try adjusting your filters.</div>
      </div>`;
    if (window.lucide) window.lucide.createIcons();
    return;
  }

  grid().innerHTML = list.map(r => `
    <a href="/rent-detail.html?id=${encodeURIComponent(r.id)}" class="rental-card">
      <div class="rental-card__media">
        <img src="${escapeHtml(r.images?.[0] || '/assets/img/rentals/01.jpg')}" alt="${escapeHtml(r.title)}" onerror="this.src='/assets/img/rentals/01.jpg'" />
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

function wire() {
  ['f-max', 'f-bed', 'f-status'].forEach(id => {
    document.getElementById(id)?.addEventListener('change', render);
  });
  document.getElementById('filter-reset')?.addEventListener('click', () => {
    ['f-max','f-bed','f-status'].forEach(id => { const el = document.getElementById(id); if (el) el.value = ''; });
    render();
  });
  render();
}

window.addEventListener('partials:ready', wire, { once: true });
if (document.readyState !== 'loading') wire();
