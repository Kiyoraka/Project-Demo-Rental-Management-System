# RentHub — Rental Management System (Demo)

A hardcoded, client-side demo of a rental management platform showing a public landing page, tenant registration, mock payment flow, tenant dashboard, and a full admin console with analytics, CRUD, and notifications.

No backend. No build step. No npm install. Just vanilla HTML + CSS + JavaScript + localStorage.

---

## Run it

Because the pages use `fetch()` to load shared navbar/sidebar/footer partials, you need a tiny HTTP server (not `file://`).

**Option A — VS Code Live Server:**
1. Open the project folder in VS Code.
2. Install the "Live Server" extension (ritwickdey.LiveServer) if needed.
3. Right-click `index.html` → **Open with Live Server**.
4. Browser opens at `http://127.0.0.1:5500/index.html`.

**Option B — npx http-server:**
```
npx http-server .
```
Then visit `http://127.0.0.1:8080`.

---

## Demo credentials

| Role   | Email               | Password  |
|--------|---------------------|-----------|
| Admin  | admin@gmail.com     | admin123  |
| Tenant | tenant@gmail.com    | admin123  |

Both roles are pre-seeded. You can also register a new tenant from the public `/rent.html` flow.

---

## End-to-end demo flow

1. Land on `/index.html` — featured rentals + hero.
2. Click **Browse Rentals** → `/rent.html`, filter by price, bedrooms, status.
3. Click any available rental → `/rent-detail.html?id=...`, see gallery, specs, amenities.
4. Click **Register to Rent** → `/register.html?rentalId=...`, fill form (any values).
5. Form submit creates User + Tenant + 2 Notifications, auto-logs in, redirects to `/tenant/payment.html`.
6. Click **Pay** on the tenant payment page → mock card form (4242 4242 4242 4242, any MM/YY, any CVV). 1.5s spinner → success toast + receipt modal.
7. Click the user menu → **Logout**.
8. Log in as admin → `/admin/index.html`.
9. Notification bell shows unread badge (registration + payment).
10. Navigate Tenants / Rentals / Reports — edit, delete, add via modals.
11. Settings → **Reset demo data** to wipe localStorage back to seed.

---

## What's in the box

- 7 public pages (Home, About, Rent catalog, Rent detail, Contact, Login, Register)
- 3 tenant pages (Main, Payment, Reports)
- 6 admin pages (Main/Analytics, Tenants, Rentals, Reports, Settings, Payment Gateway)
- 6 shared HTML partials (public navbar/footer + admin/tenant sidebar/topbar)
- 6 CSS layers (tokens, base, components, layout-public, layout-dashboard, responsive)
- 6 core JS modules (seed, store, auth, ui, notifications, partials)
- Chart.js revenue trend (6 months) on admin dashboard
- Responsive at 1024 / 768 / 480 breakpoints — mobile drawer sidebars, stacked tables

---

## Data model (all in localStorage, key prefix `renthub:`)

- `users` — admin + seeded tenants + new registrations
- `rentals` — 8 apartments in KL/Selangor, mix of available/occupied
- `tenants` — active tenant records
- `payments` — mock gateway records with receipt numbers
- `notifications` — role-filtered feed (admin vs tenant bell)
- `settings` — company profile + payment gateway config
- `session` — current logged-in user

Data survives refresh. Reset via **Admin → Settings → Reset demo data** or `localStorage.clear()` in DevTools.

---

## Stack

Plain HTML + CSS + vanilla JS (ES modules, no bundler). Chart.js + Lucide icons + Inter font via CDN.

---

## Demo caveats

- Rental images in `/assets/img/rentals/01.jpg … 08.jpg` are placeholders — drop in your own photos (same filenames) to restyle the catalog.
- Payment gateway is mock: card form accepts any input that passes format validation. No real payments are processed.
- All "receipts" / "CSV exports" / "notifications" are client-generated. None of them email or integrate with third parties.
