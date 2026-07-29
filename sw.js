const CACHE_NAME = 'nephr-cache-v4'; // 🟢 Updated to v4 for cache invalidation
const FILES_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  './icon.png'
];

// Install Event: Cache essential wrapper files
self.addEventListener('install', (e) => {
  self.skipWaiting(); // Force new Service Worker to activate instantly
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(FILES_TO_CACHE))
  );
});

// Activate Event: Clear older caches (v1, v2, v3, etc.)
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(keyList.map((key) => {
        if (key !== CACHE_NAME) {
          console.log('[SW] Deleting old cache:', key);
          return caches.delete(key);
        }
      }));
    })
  );
  return self.clients.claim();
});

// Fetch Event: Network-First strategy for index.html & bypass GAS completely
self.addEventListener('fetch', (e) => {
  // Never cache Google Apps Script URLs
  if (e.request.url.includes('script.google.com') || e.request.url.includes('script.googleusercontent.com')) {
    return;
  }

  // Network-first strategy for wrapper page to ensure latest updates
  e.respondWith(
    fetch(e.request)
      .then((response) => {
        // Update cache with fresh version
        if (response.status === 200) {
          const resClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(e.request, resClone));
        }
        return response;
      })
      .catch(() => caches.match(e.request)) // Fallback to cache if offline
  );
});
