/** Off-Vercel catalog audio. Same host must resolve InnerTube and proxy googlevideo. */
export const STREAM_PROXY_ORIGIN = "https://boulder-grad-travis-vary.trycloudflare.com";

/** Bump when Vercel serves a stale client bundle without the tunnel host. */
export const STREAM_PROXY_BUILD = "20260918b";

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
