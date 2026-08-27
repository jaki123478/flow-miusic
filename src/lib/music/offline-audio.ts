const cache = new Map<string, string>();
const inflight = new Map<string, Promise<string>>();
const CHUNK = 256 * 1024;

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
  const job = (async () => {
    const first = await fetch(`/api/stream?v=${id}`, { headers: { Range: "bytes=0-262143" } });
    if (!first.ok && first.status !== 206) throw new Error("stream");
    const range = first.headers.get("content-range");
    const total = Number((range || "").split("/")[1] || first.headers.get("content-length") || 0);
    const parts: Blob[] = [await first.blob()];
    if (total > parts[0].size) {
      const reqs: Promise<Blob>[] = [];
      for (let start = parts[0].size; start < total; start += CHUNK) {
        const end = Math.min(start + CHUNK - 1, total - 1);
        reqs.push(
          fetch(`/api/stream?v=${id}`, { headers: { Range: `bytes=${start}-${end}` } }).then((r) => {
            if (!r.ok && r.status !== 206) throw new Error("chunk");
            return r.blob();
          }),
        );
      }
      const rest = await Promise.all(reqs.slice(0, 8));
      parts.push(...rest);
      if (reqs.length > 8) {
        const more = await Promise.all(reqs.slice(8));
        parts.push(...more);
      }
    }
    const blob = new Blob(parts, { type: first.headers.get("content-type") || "audio/mp4" });
    if (!blob.size) throw new Error("empty");
    const url = URL.createObjectURL(blob);
    cache.set(id, url);
    trimCache();
    return url;
  })();
  inflight.set(id, job);
  try {
    return await job;
  } finally {
    inflight.delete(id);
  }
}
