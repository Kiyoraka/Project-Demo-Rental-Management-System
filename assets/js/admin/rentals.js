// admin/rentals.js — rental CRUD + add/edit modal

import { store } from '../store.js';
import { requireRole } from '../auth.js';
import { toast, modal, confirmDialog, formatCurrency, escapeHtml, fileToDataUrl } from '../ui.js';

if (!requireRole('admin')) throw new Error('unauthorized');

function getFiltered() {
  const q = (document.getElementById('rental-search')?.value || '').toLowerCase().trim();
  const status = document.getElementById('rental-status-filter')?.value || '';
  return store.list('rentals').filter(r => {
    if (q && !(r.title.toLowerCase().includes(q) || (r.location || '').toLowerCase().includes(q))) return false;
    if (status && r.status !== status) return false;
    return true;
  });
}

function render() {
  const list = getFiltered();
  const wrap = document.getElementById('rental-table-wrap');
  if (list.length === 0) {
    wrap.innerHTML = `
      <div class="empty-state">
        <div class="empty-state__title">No rentals yet</div>
        <div class="empty-state__body">Add your first rental to get started.</div>
        <button class="btn btn--primary" id="empty-add">Add Rental</button>
      </div>`;
    document.getElementById('empty-add')?.addEventListener('click', () => openForm());
    return;
  }

  wrap.innerHTML = `
    <table class="table">
      <thead>
        <tr><th></th><th>Title</th><th>Location</th><th>Price</th><th>Beds</th><th>Baths</th><th>Status</th><th class="text-right">Actions</th></tr>
      </thead>
      <tbody>
        ${list.map(r => `
          <tr>
            <td data-label="Image"><img src="${escapeHtml(r.images?.[0] || 'assets/img/rentals/01.jpg')}" alt="" style="width:56px;height:40px;object-fit:cover;border-radius:6px;" onerror="this.src='assets/img/rentals/01.jpg'" /></td>
            <td data-label="Title">${escapeHtml(r.title)}</td>
            <td data-label="Location">${escapeHtml(r.location || '—')}</td>
            <td data-label="Price">${formatCurrency(r.pricePerMonth)}</td>
            <td data-label="Beds">${r.bedrooms}</td>
            <td data-label="Baths">${r.bathrooms}</td>
            <td data-label="Status"><span class="badge badge--${r.status === 'available' ? 'success' : 'muted'}"><span class="badge__dot"></span>${r.status}</span></td>
            <td data-label="Actions" class="table__actions">
              <a class="btn btn--ghost btn--sm" href="rent-detail.html?id=${encodeURIComponent(r.id)}" target="_blank" title="View"><i data-lucide="eye"></i></a>
              <button class="btn btn--ghost btn--sm" data-act="edit" data-id="${r.id}" title="Edit"><i data-lucide="edit-2"></i></button>
              <button class="btn btn--ghost btn--sm" data-act="delete" data-id="${r.id}" title="Delete"><i data-lucide="trash-2"></i></button>
            </td>
          </tr>`).join('')}
      </tbody>
    </table>`;

  wrap.querySelectorAll('[data-act="edit"]').forEach(btn => {
    btn.addEventListener('click', () => openForm(store.get('rentals', btn.dataset.id)));
  });
  wrap.querySelectorAll('[data-act="delete"]').forEach(btn => {
    btn.addEventListener('click', async () => {
      const r = store.get('rentals', btn.dataset.id);
      const ok = await confirmDialog({ title: 'Delete rental?', body: `This removes "${r.title}" from the catalog.`, confirmText: 'Delete', variant: 'danger' });
      if (!ok) return;
      store.remove('rentals', r.id);
      toast({ variant:'success', title:'Rental deleted' });
      render();
    });
  });

  if (window.lucide) window.lucide.createIcons();
}

function formHtml(r = {}) {
  return `
    <div class="stack">
      <div class="field">
        <label class="field__label" for="f-title">Title</label>
        <input class="input" id="f-title" value="${escapeHtml(r.title || '')}" required />
      </div>
      <div class="field">
        <label class="field__label" for="f-location">Location</label>
        <input class="input" id="f-location" value="${escapeHtml(r.location || '')}" />
      </div>
      <div class="field">
        <label class="field__label" for="f-desc">Description</label>
        <textarea class="textarea" id="f-desc" rows="3">${escapeHtml(r.description || '')}</textarea>
      </div>
      <div class="form-grid">
        <div class="field">
          <label class="field__label" for="f-price">Price / month (RM)</label>
          <input class="input" id="f-price" type="number" min="0" value="${r.pricePerMonth || 0}" />
        </div>
        <div class="field">
          <label class="field__label" for="f-sqft">Sqft</label>
          <input class="input" id="f-sqft" type="number" min="0" value="${r.sqft || 0}" />
        </div>
      </div>
      <div class="form-grid">
        <div class="field">
          <label class="field__label" for="f-beds">Bedrooms</label>
          <input class="input" id="f-beds" type="number" min="0" value="${r.bedrooms || 1}" />
        </div>
        <div class="field">
          <label class="field__label" for="f-baths">Bathrooms</label>
          <input class="input" id="f-baths" type="number" min="0" value="${r.bathrooms || 1}" />
        </div>
      </div>
      <div class="field">
        <label class="field__label" for="f-amen">Amenities (comma-separated)</label>
        <input class="input" id="f-amen" value="${escapeHtml((r.amenities || []).join(', '))}" />
      </div>
      <div class="field">
        <label class="field__label">Image</label>
        <div class="row row--center">
          <label class="btn btn--ghost btn--sm"><i data-lucide="upload"></i>Upload<input type="file" id="f-image" accept="image/*" hidden></label>
          <span class="img-preview" id="f-img-preview">${r.images?.[0] ? `<img src="${escapeHtml(r.images[0])}" alt="" />` : ''}</span>
        </div>
      </div>
      <div class="field">
        <label class="field__label">Status</label>
        <div class="row">
          <label class="radio"><input type="radio" name="f-status" value="available" ${r.status === 'available' || !r.status ? 'checked' : ''}><span>Available</span></label>
          <label class="radio"><input type="radio" name="f-status" value="occupied" ${r.status === 'occupied' ? 'checked' : ''}><span>Occupied</span></label>
        </div>
      </div>
    </div>`;
}

function openForm(existing) {
  const isEdit = !!existing;
  const m = modal({
    title: isEdit ? 'Edit Rental' : 'Add Rental',
    bodyHtml: formHtml(existing || {}),
    footerHtml: `
      <button class="btn btn--ghost" data-act="cancel">Cancel</button>
      <button class="btn btn--primary" data-act="save">${isEdit ? 'Save changes' : 'Save'}</button>`,
    onOpen: (root) => {
      let imageData = existing?.images?.[0] || '';
      const fileInput = root.querySelector('#f-image');
      fileInput.addEventListener('change', async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        imageData = await fileToDataUrl(file);
        const prev = root.querySelector('#f-img-preview');
        if (prev) prev.innerHTML = `<img src="${imageData}" alt="" />`;
      });

      root.querySelector('[data-act="cancel"]').addEventListener('click', () => m.close());
      root.querySelector('[data-act="save"]').addEventListener('click', () => {
        const title = root.querySelector('#f-title').value.trim();
        if (!title) { toast({ variant:'error', title:'Title is required' }); return; }
        const statusRadio = root.querySelector('input[name="f-status"]:checked');
        const payload = {
          title,
          location: root.querySelector('#f-location').value.trim(),
          description: root.querySelector('#f-desc').value.trim(),
          pricePerMonth: Number(root.querySelector('#f-price').value) || 0,
          sqft: Number(root.querySelector('#f-sqft').value) || 0,
          bedrooms: Number(root.querySelector('#f-beds').value) || 0,
          bathrooms: Number(root.querySelector('#f-baths').value) || 0,
          amenities: root.querySelector('#f-amen').value.split(',').map(s => s.trim()).filter(Boolean),
          images: imageData ? [imageData] : (existing?.images || []),
          status: statusRadio?.value || 'available',
        };

        if (isEdit) {
          store.update('rentals', existing.id, payload);
          toast({ variant:'success', title:'Rental updated' });
        } else {
          store.insert('rentals', payload);
          toast({ variant:'success', title:'Rental added' });
        }
        m.close();
        render();
      });

      if (window.lucide) window.lucide.createIcons();
    },
  });
}

function wire() {
  document.getElementById('add-rental')?.addEventListener('click', () => openForm());
  document.getElementById('rental-search')?.addEventListener('input', render);
  document.getElementById('rental-status-filter')?.addEventListener('change', render);
  render();
}

window.addEventListener('partials:ready', wire, { once: true });
if (document.readyState !== 'loading') wire();
