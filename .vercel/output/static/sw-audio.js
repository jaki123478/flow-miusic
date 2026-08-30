self.addEventListener("install", (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);
  if (url.pathname !== "/api/stream") return;
  event.respondWith(
    (async () => {
      const cache = await caches.open("flow-audio-v1");
      try {
        const res = await fetch(event.request);
        if (res.status === 200 && event.request.method === "GET" && !event.request.headers.get("range")) {
          void cache.put(event.request, res.clone());
        }
        return res;
      } catch (err) {
        const hit = await cache.match(event.request);
        if (hit) return hit;
        throw err;
      }
    })(),
  );
});
