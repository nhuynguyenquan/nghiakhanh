const CACHE_NAME = "banhang-cache-v1";

const urlsToCache = [
  "./banhang.html",
  "./manifest.json",
  "./service-worker.js",
  "./icons/icon-192.png",
  "./icons/icon-512.png"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache =>
      Promise.allSettled(
        urlsToCache.map(url => cache.add(url))
      ).then(results => {
        results.forEach((result, i) => {
          if (result.status === "rejected") {
            console.warn("❌ Failed to cache:", urlsToCache[i]);
          }
        });
      })
    )
  );
  self.skipWaiting();
});
