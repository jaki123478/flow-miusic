import { withBackoff } from "@/lib/net/backoff";

const cache = new Map<string, string>();
const inflight = new Map<string, Promise<string>>();

function trimCache() {
  while (cache.size > 8) {
    const id = cache.keys().next().value;
    if (!id) break;
    const url = cache.get(id);
    if (url) URL.revokeObjectURL(url);
    cache.delete(id);
  }
}

export function cachedAudioUrl(id: string): string | undefined {
  return cache.get(id);
}

export function prefetchAudio(id: string) {
  if (!id || cache.has(id) || inflight.has(id)) return;
  void loadLocalAudio(id).catch(() => {});
}

export async function loadLocalAudio(id: string): Promise<string> {
  const hit = cache.get(id);
  if (hit) return hit;
  const pending = inflight.get(id);
  if (pending) return pending;
  const job = withBackoff(
    async () => {
      const res = await fetch(`/api/stream?v=${id}`, {
        cache: "no-store",
        headers: { Accept: "audio/*,*/*" },
      });
      if (!res.ok && res.status !== 206) throw new Error(`stream ${res.status}`);
      const blob = await res.blob();
      if (!blob.size) throw new Error("empty");
      const url = URL.createObjectURL(blob);
      cache.set(id, url);
      trimCache();
      return url;
    },
    { baseMs: 400, maxMs: 6000, maxAttempts: 5, factor: 2, jitter: 0.2 },
  );
  inflight.set(id, job);
  try {
    return await job;
  } finally {
    inflight.delete(id);
  }
}
