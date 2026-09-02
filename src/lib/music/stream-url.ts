/** Off-Vercel catalog audio host. googlevideo is IP-locked to this resolver. */
const DEFAULT_PROXY = "https://lightbox-elderly-sku-pension.trycloudflare.com";

function envProxy(): string {
  try {
    const v = (import.meta as { env?: { VITE_STREAM_PROXY?: string } }).env?.VITE_STREAM_PROXY;
    if (v && /^https?:\/\//.test(v)) return v.replace(/\/$/, "");
  } catch {
    /* no import.meta in some tests */
  }
  return DEFAULT_PROXY;
}

export const STREAM_PROXY_ORIGIN = envProxy();

export function catalogStreamUrl(videoId: string): string {
  const id = videoId.trim();
  if (!/^[\w-]{11}$/.test(id)) return "";
  return `${STREAM_PROXY_ORIGIN}/api/stream?id=${encodeURIComponent(id)}`;
}
