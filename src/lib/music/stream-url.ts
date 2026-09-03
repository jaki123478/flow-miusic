/** Off-Vercel catalog audio. Same host must resolve InnerTube and proxy googlevideo. */
export const STREAM_PROXY_ORIGIN = "https://springer-pregnancy-shanghai-raleigh.trycloudflare.com";

export function catalogStreamUrl(videoId: string): string {
  const id = String(videoId || "").trim();
  if (id.length !== 11) return "";
  return STREAM_PROXY_ORIGIN + "/api/stream?id=" + encodeURIComponent(id);
}
