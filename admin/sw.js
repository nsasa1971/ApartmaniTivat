// Service worker za /admin: offline ljuska aplikacije.
// Podaci (rezervacije) se čuvaju u Firestore offline kešu (IndexedDB), a ne ovdje.
const VERSION = 'v1';
const SHELL = `tgh-admin-shell-${VERSION}`;
const RUNTIME = `tgh-admin-runtime-${VERSION}`;

const SHELL_FILES = [
  './',
  'index.html',
  'manifest.webmanifest',
  'icons/icon-192.png',
  'icons/icon-512.png',
  'js/app.js',
  'js/apartments.js',
  'js/ui.js',
  'js/store.js',
  'js/calendar.js',
  'js/booking-form.js',
  'js/lists.js',
  'js/backup.js',
  '../assets/css/style.css',
  '../assets/js/availability.js',
  '../assets/js/firebase-client.js',
  '../assets/js/firebase-config.js',
  '../assets/img/logo.png',
  '../assets/fonts/spinnaker-400-latin.woff2',
  '../assets/fonts/spinnaker-400-latin-ext.woff2',
  '../assets/fonts/lato-400-latin.woff2',
  '../assets/fonts/lato-400-latin-ext.woff2',
  '../assets/fonts/lato-700-latin.woff2',
  '../assets/fonts/lato-700-latin-ext.woff2',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(SHELL).then((cache) => Promise.all(SHELL_FILES.map((f) => cache.add(f).catch(() => null)))).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => ![SHELL, RUNTIME].includes(k)).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  // Firestore / Auth saobraćaj ide direktno (offline obrađuje Firestore SDK)
  if (/(googleapis|firebaseio)\.com$/.test(url.hostname)) return;

  // Firebase SDK sa CDN-a: keš prvo (verzija je zakucana u URL-u)
  if (url.hostname === 'www.gstatic.com') {
    event.respondWith(
      caches.match(req).then(
        (hit) =>
          hit ||
          fetch(req).then((res) => {
            if (res.ok) caches.open(RUNTIME).then((c) => c.put(req, res.clone()));
            return res;
          })
      )
    );
    return;
  }

  if (url.origin !== location.origin) return;

  // Stranica: mreža prvo, offline iz keša
  if (req.mode === 'navigate') {
    event.respondWith(fetch(req).catch(() => caches.match('index.html').then((r) => r || caches.match('./'))));
    return;
  }

  // Ostalo: keš odmah, osvježi u pozadini
  event.respondWith(
    caches.match(req).then((hit) => {
      const net = fetch(req)
        .then((res) => {
          if (res.ok) caches.open(SHELL).then((c) => c.put(req, res.clone()));
          return res;
        })
        .catch(() => hit);
      return hit || net;
    })
  );
});
