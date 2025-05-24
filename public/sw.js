
const CACHE_NAME = 'lure-crm-v1';
const urlsToCache = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/lovable-uploads/f622dbc7-013d-433a-8651-327791e3fa2d.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // 如果在緩存中找到，返回緩存版本
        if (response) {
          return response;
        }
        return fetch(event.request);
      }
    )
  );
});
