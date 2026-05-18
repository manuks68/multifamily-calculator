const CACHE_NAME = 'anuks-deal-mobile-v2026-05-18-fix-v1';
const STATIC_ASSETS = [
  './manifest.webmanifest',
  './apple-touch-icon.png',
  './icon-192.png',
  './icon-512.png'
];

self.addEventListener('install', event => {
  console.log('Service Worker: Installing with cache:', CACHE_NAME);
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(STATIC_ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  console.log('Service Worker: Activating and clearing old caches');
  event.waitUntil(
    caches.keys().then(keys => {
      console.log('Service Worker: Found caches:', keys);
      return Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => {
        console.log('Service Worker: Deleting old cache:', k);
        return caches.delete(k);
      }));
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // Always fetch HTML files fresh, never cache them
  if (url.pathname.endsWith('/') || url.pathname.endsWith('/index.html') || url.pathname.endsWith('.html')) {
    event.respondWith(
      fetch(event.request, {cache: 'no-store', headers: {'Cache-Control': 'no-cache, no-store, must-revalidate'}})
        .catch(() => caches.match('./index.html'))
    );
    return;
  }

  // For other assets, use cache-first strategy
  event.respondWith(
    caches.match(event.request).then(cached => cached || fetch(event.request))
  );
});