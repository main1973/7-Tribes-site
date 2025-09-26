/* 7Tribes Service Worker — offline + speed
   Scope: this repo’s root (GitHub Pages project site) */

const VERSION = 'v1';
const STATIC_CACHE = `static-${VERSION}`;
const RUNTIME_CACHE = `runtime-${VERSION}`;

const STATIC_ASSETS = [
  './',
  './index.html',
  './dashboard.html',
  './merchants.html',
  './propose.html',
  './style.css',
  './wallet.js',
  './images/logo.png',
  './images/banner.png',
  './manifest.json'
];

// Install: pre-cache shell
self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(STATIC_CACHE).then((c) => c.addAll(STATIC_ASSETS)));
  self.skipWaiting();
});

// Activate: clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.map((k) => (k.startsWith('static-') || k.startsWith('runtime-')) && k !== STATIC_CACHE && k !== RUNTIME_CACHE ? caches.delete(k) : null))
    )
  );
  self.clients.claim();
});

// Fetch: 
// - JSON under /data → network-first (fresh numbers), fallback to cache
// - everything else → stale-while-revalidate (snappy)
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // only handle same-origin
  if (url.origin !== location.origin) return;

  // Data JSON: network-first
  if (url.pathname.startsWith('/7-Tribes-site/data/')) {
    event.respondWith((async () => {
      try {
        const net = await fetch(request, { cache: 'no-store' });
        const cache = await caches.open(RUNTIME_CACHE);
        cache.put(request, net.clone());
        return net;
      } catch (_) {
        const match = await caches.match(request);
        return match || new Response(JSON.stringify({ error: 'offline' }), { headers: { 'Content-Type': 'application/json' }, status: 503 });
      }
    })());
    return;
  }

  // Static + pages: stale-while-revalidate
  event.respondWith((async () => {
    const cached = await caches.match(request);
    const fetchPromise = fetch(request).then((net) => {
      caches.open(RUNTIME_CACHE).then((c) => c.put(request, net.clone()));
      return net;
    }).catch(() => cached);
    return cached || fetchPromise;
  })());
});
