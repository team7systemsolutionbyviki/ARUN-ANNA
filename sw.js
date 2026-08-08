/* ==========================================================================
   TEAM 7 SYSTEM SOLUTION - SERVICE WORKER
   ========================================================================== */

const CACHE_NAME = 'team7-print-v1';
const ASSETS = [
  './',
  './index.html',
  './css/main.css',
  './css/components.css',
  './css/public.css',
  './css/dashboard.css',
  './js/app.js',
  './manifest.json'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
