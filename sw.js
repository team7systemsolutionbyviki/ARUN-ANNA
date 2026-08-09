/* ==========================================================================
   TEAM 7 SYSTEM SOLUTION - SERVICE WORKER
   ========================================================================== */

const CACHE_NAME = 'team7-print-v3';

// URLs that must NEVER be intercepted by the Service Worker (causes CORS failures)
const BYPASS_ORIGINS = [
  'firebasestorage.googleapis.com',
  'firestore.googleapis.com',
  'firebase.googleapis.com',
  'identitytoolkit.googleapis.com',
  'securetoken.googleapis.com',
  'googleapis.com',
  'gstatic.com',
  'firebaseio.com',
  'firebase.com',
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Let Firebase/external requests pass through completely — never cache or intercept
  const isBypass = BYPASS_ORIGINS.some(origin => url.hostname.includes(origin));
  if (isBypass || event.request.method !== 'GET') {
    // Do NOT call event.respondWith() — browser handles it natively without CORS issues
    return;
  }

  // For local app assets: network first, cache fallback
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});
