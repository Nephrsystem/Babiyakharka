// 🟢 CACHE VERSION: जब जब नयाँ अपडेट हाल्नुहुन्छ, यो भर्सन (v4 -> v5 -> v6) बढाउनुहोस्
const CACHE_NAME = 'nephr-cache-v4'; 

const FILES_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  './icon.png'
];

// 1. Install Event: नयाँ भर्सन आउनासाथ तुरुन्तै इन्स्टल गर्ने
self.addEventListener('install', (e) => {
  self.skipWaiting(); // 🟢 पुराना वर्करलाई नकुरी नयाँ वर्कर तुरुन्तै लागू गर्ने
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(FILES_TO_CACHE))
  );
});

// 2. Activate Event: पुराना सबै क्यास (v1, v2, v3...) मेट्ने
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(keyList.map((key) => {
        if (key !== CACHE_NAME) {
          console.log('[PWA-AUTO-UPDATE] Deleting old cache:', key);
          return caches.delete(key); // पुरानो क्यास फाल्ने
        }
      }));
    })
  );
  return self.clients.claim(); // 🟢 सबै खोलिएका PWA एपहरूमा नयाँ भर्सन तुरुन्तै लागू गर्ने
});

// 3. Fetch Event: GAS लाई क्यास नगर्ने र नयाँ कोड तान्ने
self.addEventListener('fetch', (e) => {
  if (e.request.url.includes('script.google.com') || e.request.url.includes('script.googleusercontent.com')) {
    return; // GAS API Calls हरूलाई सधैं Live चलाउने
  }

  // Network First Strategy (नयाँ कोड खोज्ने, नभए मात्र क्यास चलाउने)
  e.respondWith(
    fetch(e.request)
      .then((response) => {
        if (response.status === 200) {
          const resClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(e.request, resClone));
        }
        return response;
      })
      .catch(() => caches.match(e.request))
  );
});
