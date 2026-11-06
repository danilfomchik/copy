// Hand-written service worker. The build replaces the VERSION and PRECACHE
// placeholders with a hash of the file list and the real list (see vite.config.ts).
const VERSION = '__VERSION__';
const PRECACHE = /*__PRECACHE__*/ [];
const CACHE = `orbit-pass-${VERSION}`;

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.addAll(PRECACHE))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;
  event.respondWith(
    caches.match(req, { ignoreSearch: true, ignoreVary: true }).then((hit) => {
      if (hit) return hit;
      // navigations fall back to the cached app shell
      if (req.mode === 'navigate') return caches.match(new URL('./', self.location.href).href);
      return fetch(req);
    }),
  );
});
