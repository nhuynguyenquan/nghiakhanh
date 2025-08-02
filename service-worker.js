const CACHE_NAME = "nghiakhanh-cache-v1";
const urlsToCache = [
  "/nghiakhanh/",
  "/nghiakhanh/index.html",
  "/nghiakhanh/banhang.html",
  "/nghiakhanh/manifest.json",
  "/nghiakhanh/service-worker.js",
  "/nghiakhanh/icons/icon-192.png",
  "/nghiakhanh/icons/icon-512.png",

  // Các trang quản lý
  "/nghiakhanh/quan-li-thu-chi/",
  "/nghiakhanh/quan-li-thu-chi/index.html",
  "/nghiakhanh/quan-li-thu-chi/thu-chi-gia-dinh.html",

  "/nghiakhanh/quan-li-kho/",
  "/nghiakhanh/quan-li-kho/index.html",

  "/nghiakhanh/quan-li-nv/",
  "/nghiakhanh/quan-li-nv/index.html",

  "/nghiakhanh/quan-li-menu/",
  "/nghiakhanh/quan-li-menu/index.html",

  "/nghiakhanh/quan-li-chi-nhanh/",
  "/nghiakhanh/quan-li-chi-nhanh/index.html",
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener("activate", event => {
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

self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(response =>
      response || fetch(event.request)
    )
  );
});
