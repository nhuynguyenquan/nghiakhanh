const CACHE_NAME = "banhang-cache-v3";

const urlsToCache = [
  "./banhang.html",
  "./manifest.json",
  "./icons/icon-192.png",
  "./icons/icon-512.png"
];

// ✅ Install - cache file tĩnh
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache =>
      Promise.allSettled(
        urlsToCache.map(url => cache.add(url))
      )
    )
  );
  self.skipWaiting();
});

// ✅ Activate - xoá cache cũ
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      )
    )
  );
  self.clients.claim();
});

// ✅ Fetch
self.addEventListener("fetch", event => {
  const req = event.request;

  // 🔴 API GAS → luôn lấy mới (không cache)
  if (req.url.includes("script.google.com")) {
    event.respondWith(
      fetch(req, { cache: "no-store" }).catch(() => {
        return new Response(JSON.stringify({ error: "offline" }), {
          headers: { "Content-Type": "application/json" }
        });
      })
    );
    return;
  }

  // 🟢 File tĩnh → cache-first
  event.respondWith(
    caches.match(req).then(cached => {
      return (
        cached ||
        fetch(req).then(res => {
          return caches.open(CACHE_NAME).then(cache => {
            cache.put(req, res.clone());
            return res;
          });
        })
      );
    })
  );
});