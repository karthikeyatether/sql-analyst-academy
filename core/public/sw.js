// Service Worker: Self-purging and Network-First for instant update reflection
self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.map((key) => caches.delete(key))))
      .then(() => self.registration.unregister())
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  // Always serve fresh from network to guarantee immediate reflection of updates
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});
