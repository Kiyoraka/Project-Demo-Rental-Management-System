// public/rent-detail.js — single rental view

import { store } from '../store.js';
import { formatCurrency, escapeHtml, getQuery } from '../ui.js';

function render() {
  const id = getQuery('id');
  const root = document.getElementById('detail-root');
  if (!id) { root.innerHTML = notFound(); return; }

  const r = store.get('rentals', id);
  if (!r) { root.innerHTML = notFound(); return; }

  const mainImg = r.images?.[0] || '/assets/img/rentals/01.jpg';
  const thumbs = (r.images && r.images.length > 1)
    ? r.images
    : ['/assets/img/rentals/01.jpg', '/assets/img/rentals/02.jpg', '/assets/img/rentals/03.jpg', '/assets/img/rentals/04.jpg'];

  const registerHref = r.status === 'available'
    ? `/register.html?rentalId=${encodeURIComponent(r.id)}`
    : '#';

  const ctaDisabled = r.status !== 'available' ? 'disabled' : '';

  root.innerHTML = `
    <div class="rental-detail">
      <div class="rental-detail__gallery">
        <div class="rental-detail__main">
          <img id="main-img" src="${escapeHtml(mainImg)}" alt="${escapeHtml(r.title)}" onerror="this.src='/assets/img/rentals/01.jpg'" />
        </div>
        <div class="rental-detail__thumbs">
          ${thumbs.slice(0, 4).map((t, i) => `
            <img src="${escapeHtml(t)}" alt="thumb" class="${i === 0 ? 'is-active' : ''}" data-thumb onerror="this.src='/assets/img/rentals/01.jpg'" />
          `).join('')}
        </div>

        <section class="mt-6">
          <h3>Description</h3>
          <p class="text-muted">${escapeHtml(r.description)}</p>
        </section>

        <section class="mt-6">
          <h3>Amenities</h3>
          <div class="amenities">
            ${(r.amenities || []).map(a => `<span class="chip">${escapeHtml(a)}</span>`).join('')}
          </div>
        </section>
      </div>

      <aside class="rental-detail__info">
        <h1 style="margin-bottom:0;">${escapeHtml(r.title)}</h1>
        <div class="text-muted text-sm"><i data-lucide="map-pin"></i> ${escapeHtml(r.location)}</div>
        <div class="rental-detail__price">${formatCurrency(r.pricePerMonth)} <small>/month</small></div>
        <div class="rental-detail__specs">
          <span><strong>${r.bedrooms}</strong>Bedrooms</span>
          <span><strong>${r.bathrooms}</strong>Bathrooms</span>
          <span><strong>${r.sqft}</strong>sqft</span>
        </div>
        <a href="${registerHref}" class="btn btn--primary btn--block ${ctaDisabled ? 'is-disabled' : ''}" ${ctaDisabled ? 'aria-disabled="true" tabindex="-1"' : ''}>
          ${r.status === 'available' ? 'Register to Rent' : 'Currently Unavailable'}
        </a>
        <div class="text-sm text-muted">
          Status:
          ${r.status === 'available'
            ? '<span class="badge badge--success"><span class="badge__dot"></span>Available</span>'
            : '<span class="badge badge--muted"><span class="badge__dot"></span>Occupied</span>'}
        </div>
      </aside>
    </div>
  `;

  root.querySelectorAll('[data-thumb]').forEach(t => {
    t.addEventListener('click', () => {
      root.querySelectorAll('[data-thumb]').forEach(x => x.classList.remove('is-active'));
      t.classList.add('is-active');
      document.getElementById('main-img').src = t.src;
    });
  });

  if (window.lucide) window.lucide.createIcons();
}

function notFound() {
  return `
    <div class="empty-state">
      <div class="empty-state__icon"><i data-lucide="home"></i></div>
      <div class="empty-state__title">Rental not found</div>
      <div class="empty-state__body">The rental you are looking for does not exist.</div>
      <a href="/rent.html" class="btn btn--primary">Browse rentals</a>
    </div>`;
}

window.addEventListener('partials:ready', render, { once: true });
if (document.readyState !== 'loading') render();
