const CACHE_NAME = 'nephr-cache-v3';
const FILES_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  './icon.png'
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(FILES_TO_CACHE)));
});

self.addEventListener('fetch', (e) => {
  if (e.request.url.includes('script.google.com')) return; // GAS लाई क्यास नगर्ने
  e.respondWith(caches.match(e.request).then((res) => res || fetch(e.request)));
});
