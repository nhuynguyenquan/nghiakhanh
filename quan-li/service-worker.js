const CACHE_NAME = 'quan-li-cache-v1';
const urlsToCache = [
  '../quan-li-thu-chi/',
  '../quan-li-thu-chi/index.html',
  '../quan-li-kho/',
  '../quan-li-kho/index.html',
  '../quan-li-menu/',
  '../quan-li-menu/index.html',
  '../quan-li-nv/',
  '../quan-li-nv/index.html',
  '../quan-li-sx/',
  '../quan-li-sx/index.html',
  '../quan-li-chi-nhanh/',
  '../quan-li-chi-nhanh/index.html',
  '../icons/icon-192.png',
  '../icons/icon-512.png',
  // Thêm css/js dùng chung nếu có
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) return caches.delete(key);
        })
      )
    )
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => response || fetch(event.request))
  );
});
