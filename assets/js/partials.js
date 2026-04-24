// partials.js — fetch and inject shared HTML fragments + init

async function loadPartial(el) {
  const name = el.dataset.partial;
  if (!name) return;
  try {
    const res = await fetch(`partials/${name}.html`);
    if (!res.ok) throw new Error(`Partial ${name} failed: ${res.status}`);
    const html = await res.text();
    const wrapper = document.createElement('div');
    wrapper.innerHTML = html.trim();

    // Collect any scripts before DOM insertion — scripts parsed via innerHTML
    // are flagged "already started" and will not execute. We clone them into
    // fresh script nodes after their sibling DOM is in place.
    const pendingScripts = Array.from(wrapper.querySelectorAll('script'));
    pendingScripts.forEach(s => s.remove());

    // Move remaining nodes into the live DOM in the placeholder's slot.
    const anchor = el;
    while (wrapper.firstChild) anchor.parentNode.insertBefore(wrapper.firstChild, anchor);
    anchor.remove();

    // Revive each script so its code actually runs.
    pendingScripts.forEach(old => {
      const s = document.createElement('script');
      for (const attr of old.attributes) s.setAttribute(attr.name, attr.value);
      if (!old.src) s.textContent = old.textContent;
      document.body.appendChild(s);
    });
  } catch (err) {
    console.error(err);
    el.innerHTML = `<div style="padding:12px; color:#b00;">Failed to load ${name}</div>`;
  }
}

function highlightActiveLink() {
  // Resolve current page's href via the document base, then compare link targets
  const current = new URL(window.location.href);
  const currentPath = current.pathname.replace(/\/index\.html$/, '/');
  document.querySelectorAll('[data-nav-link]').forEach(a => {
    try {
      const linkUrl = new URL(a.getAttribute('href'), document.baseURI);
      const linkPath = linkUrl.pathname.replace(/\/index\.html$/, '/');
      if (linkPath === currentPath) {
        a.classList.add('is-active');
      }
    } catch {}
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
