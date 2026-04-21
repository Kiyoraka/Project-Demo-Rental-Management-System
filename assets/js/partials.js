// partials.js — fetch and inject shared HTML fragments + init

async function loadPartial(el) {
  const name = el.dataset.partial;
  if (!name) return;
  try {
    const res = await fetch(`/partials/${name}.html`);
    if (!res.ok) throw new Error(`Partial ${name} failed: ${res.status}`);
    const html = await res.text();
    const wrapper = document.createElement('div');
    wrapper.innerHTML = html.trim();
    // Replace the placeholder with the rendered content (keep first root element)
    while (wrapper.firstChild) el.parentNode.insertBefore(wrapper.firstChild, el);
    el.remove();
  } catch (err) {
    console.error(err);
    el.innerHTML = `<div style="padding:12px; color:#b00;">Failed to load ${name}</div>`;
  }
}

function highlightActiveLink() {
  const path = window.location.pathname.replace(/\/index\.html$/, '/');
  document.querySelectorAll('[data-nav-link]').forEach(a => {
    const href = a.getAttribute('href').replace(/\/index\.html$/, '/');
    if (href === path || (href !== '/' && path.startsWith(href))) {
      a.classList.add('is-active');
    }
  });
}

function initIcons() {
  if (window.lucide && typeof window.lucide.createIcons === 'function') {
    window.lucide.createIcons();
  }
}

export async function loadPartials() {
  const slots = Array.from(document.querySelectorAll('[data-partial]'));
  await Promise.all(slots.map(loadPartial));
  initIcons();
  highlightActiveLink();
  window.dispatchEvent(new CustomEvent('partials:ready'));
}

// Auto-run on DOMContentLoaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', loadPartials);
} else {
  loadPartials();
}
