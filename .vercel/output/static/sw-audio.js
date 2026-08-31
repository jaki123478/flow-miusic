self.addEventListener("install", (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);
  if (url.pathname !== "/api/stream") return;

  // Never hijack the media element. Chrome Android aborts SW-backed Range
  // streams when the screen locks or the PWA is backgrounded.
  const dest = event.request.destination;
  if (dest === "audio" || dest === "video" || dest === "media") return;
  if (event.request.headers.get("range")) return;

  event.respondWith(
    (async () => {
      const cache = await caches.open("flow-audio-v1");
      try {
        const res = await fetch(event.request);
        if (res.status === 200 && event.request.method === "GET") {
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
