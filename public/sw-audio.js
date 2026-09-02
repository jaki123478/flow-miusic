self.addEventListener("install", (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      await self.clients.claim();
      const keys = await caches.keys();
      for (const k of keys) await caches.delete(k);
    })(),
  );
});

// Never intercept media. Cached/SW Range streams die on iPhone lock.
self.addEventListener("fetch", () => {});
