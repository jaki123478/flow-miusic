/** Off-Vercel catalog audio. Same host must resolve InnerTube and proxy googlevideo. */
export const STREAM_PROXY_ORIGIN = "https://hose-enrolled-hindu-label.trycloudflare.com";

/** Bump when Vercel serves a stale client bundle without the tunnel host. */
/** rebuild-kick: force production client to embed trycloudflare host */
export const STREAM_PROXY_BUILD = "20260918f";

export function catalogStreamUrl(videoId: string): string {
  const id = String(videoId || "").trim();
  if (id.length !== 11) return "";
  return (
    STREAM_PROXY_ORIGIN +
    "/api/stream?id=" +
    encodeURIComponent(id) +
    "&_b=" +
    STREAM_PROXY_BUILD
  );
}

/** Keep literal host in client bundles (avoid tree-shake / stale deploys). */
export const STREAM_PROXY_BANNER = `flow-stream-proxy:${STREAM_PROXY_ORIGIN}:${STREAM_PROXY_BUILD}`;
