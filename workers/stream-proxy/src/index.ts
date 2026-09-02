/**
 * Flow Music Cloudflare Worker: InnerTube IOS resolve + googlevideo Range/206 proxy.
 * googlevideo URLs are IP-locked to the resolver — never 302 them to the client.
 *
 * GET /stream?id=VIDEO_ID
 * GET /api/stream?id=VIDEO_ID  (also accepts ?v=)
 * GET /health → ok
 */

const IOS_UA =
  "com.google.ios.youtube/20.11.6 (iPhone16,2; U; CPU iOS 17_5_1 like Mac OS X)";
const UPSTREAM_UA =
  "Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1";
const PLAYER_URL = "https://youtubei.googleapis.com/youtubei/v1/player?prettyPrint=false";
const IOS_CLIENT = {
  clientName: "IOS",
  clientVersion: "20.11.6",
  deviceMake: "Apple",
  deviceModel: "iPhone16,2",
  osName: "iOS",
  osVersion: "17.5.1.21F90",
  platform: "MOBILE",
  hl: "en",
  gl: "US",
};

const ALLOWED_ORIGINS = new Set([
  "https://flow-music-web.vercel.app",
  "https://flow-music-app-two.vercel.app",
]);

type Cached = { url: string; mime: string; exp: number };
const urlCache = new Map<string, Cached>();

function corsHeaders(request: Request): HeadersInit {
  const origin = request.headers.get("Origin") || "";
  const allow =
    origin &&
    (ALLOWED_ORIGINS.has(origin) || origin.endsWith(".vercel.app") || origin.endsWith(".trycloudflare.com"))
      ? origin
      : "*";
  return {
    "Access-Control-Allow-Origin": allow,
    "Access-Control-Allow-Methods": "GET, HEAD, OPTIONS",
    "Access-Control-Allow-Headers": "Range, Accept, Content-Type, Origin",
    "Access-Control-Expose-Headers": "Content-Length, Content-Range, Accept-Ranges, Content-Type",
    "Access-Control-Max-Age": "86400",
    Vary: "Origin",
  };
}

function json(status: number, obj: unknown, request: Request): Response {
  return new Response(JSON.stringify(obj), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
      ...corsHeaders(request),
    },
  });
}

function isHttp(u: unknown): u is string {
  return typeof u === "string" && /^https?:\/\//.test(u);
}

function isAudioFormat(f: { mimeType?: string; mime_type?: string; audioQuality?: string; audio_quality?: string }): boolean {
  const mime = String(f?.mimeType || f?.mime_type || "");
  return mime.startsWith("audio/") || !!f?.audioQuality || !!f?.audio_quality;
}

function pickAudio(data: Record<string, unknown>): { url: string; mimeType?: string; mime_type?: string; bitrate?: number } | null {
  const sd = (data?.streamingData || {}) as {
    adaptiveFormats?: Array<Record<string, unknown>>;
    formats?: Array<Record<string, unknown>>;
  };
  const formats = [...(sd.adaptiveFormats || []), ...(sd.formats || [])] as Array<{
    url?: string;
    mimeType?: string;
    mime_type?: string;
    audioQuality?: string;
    audio_quality?: string;
    bitrate?: number;
  }>;
  const audio = formats.filter((f) => isAudioFormat(f) && isHttp(f.url));
  audio.sort((a, b) => (b.bitrate || 0) - (a.bitrate || 0));
  const mp4 = audio.find((f) => String(f.mimeType || "").includes("mp4"));
  const chosen = mp4 || audio[0] || formats.find((f) => isHttp(f.url));
  if (!chosen?.url) return null;
  return chosen as { url: string; mimeType?: string; mime_type?: string; bitrate?: number };
}

async function resolveStream(id: string): Promise<Cached> {
  const hit = urlCache.get(id);
  if (hit && hit.exp > Date.now()) return hit;
  const body = {
    videoId: id,
    context: { client: { ...IOS_CLIENT } },
    contentCheckOk: true,
    racyCheckOk: true,
  };
  const res = await fetch(PLAYER_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "User-Agent": IOS_UA,
      "X-YouTube-Client-Name": "5",
      "X-YouTube-Client-Version": IOS_CLIENT.clientVersion,
    },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(10_000),
  });
  if (!res.ok) throw new Error(`innertube ${res.status}`);
  const data = (await res.json()) as Record<string, unknown> & {
    playabilityStatus?: { status?: string; reason?: string };
  };
  const status = data?.playabilityStatus?.status || "?";
  const reason = data?.playabilityStatus?.reason || "";
  const fmt = pickAudio(data);
  if (!fmt?.url) {
    throw new Error(`no stream (${status}${reason ? ": " + String(reason).slice(0, 80) : ""})`);
  }
  const entry: Cached = {
    url: fmt.url,
    mime: String(fmt.mimeType || fmt.mime_type || "audio/mp4").split(";")[0].trim() || "audio/mp4",
    exp: Date.now() + 12 * 60_000,
  };
  urlCache.set(id, entry);
  return entry;
}

async function proxyBytes(target: string, range: string | null): Promise<Response> {
  const headers: Record<string, string> = { "User-Agent": UPSTREAM_UA, Accept: "*/*" };
  if (range) headers.Range = range;
  return fetch(target, { headers, signal: AbortSignal.timeout(55_000), redirect: "follow" });
}

function proxyAudio(upstream: Response, mime: string, request: Request): Response {
  const headers = new Headers(corsHeaders(request));
  headers.set("Content-Type", upstream.headers.get("content-type") || mime || "audio/mp4");
  headers.set("Accept-Ranges", "bytes");
  headers.set("Cache-Control", "public, max-age=3600");
  const contentRange = upstream.headers.get("content-range");
  if (contentRange) headers.set("Content-Range", contentRange);
  const contentLength = upstream.headers.get("content-length");
  if (contentLength) headers.set("Content-Length", contentLength);
  return new Response(request.method === "HEAD" ? null : upstream.body, {
    status: upstream.status,
    headers,
  });
}

async function handleStream(request: Request, id: string): Promise<Response> {
  let resolved: Cached;
  try {
    resolved = await resolveStream(id);
  } catch (err) {
    return json(404, { error: err instanceof Error ? err.message : "No stream" }, request);
  }
  const range = request.headers.get("range");
  const tryOnce = async (url: string) => {
    const upstream = await proxyBytes(url, range);
    if (upstream.ok || upstream.status === 206) return proxyAudio(upstream, resolved.mime, request);
    try {
      await upstream.body?.cancel();
    } catch {
      /* ignore */
    }
    return null;
  };
  try {
    let proxied = await tryOnce(resolved.url);
    if (!proxied) {
      urlCache.delete(id);
      resolved = await resolveStream(id);
      proxied = await tryOnce(resolved.url);
    }
    if (proxied) return proxied;
  } catch (err) {
    return json(502, { error: err instanceof Error ? err.message : "Upstream fetch failed" }, request);
  }
  return json(502, { error: "Upstream fetch failed" }, request);
}

export default {
  async fetch(request: Request): Promise<Response> {
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders(request) });
    }
    const url = new URL(request.url);
    const path = url.pathname.replace(/\/+$/, "") || "/";
    if (path === "/health") {
      return new Response("ok", {
        status: 200,
        headers: { "Content-Type": "text/plain; charset=utf-8", ...corsHeaders(request) },
      });
    }
    if (path === "/stream" || path === "/api/stream") {
      if (request.method !== "GET" && request.method !== "HEAD") {
        return json(405, { error: "Method not allowed" }, request);
      }
      const id = (url.searchParams.get("id") || url.searchParams.get("v") || "").trim();
      if (!/^[\w-]{11}$/.test(id)) return json(400, { error: "Bad request" }, request);
      return handleStream(request, id);
    }
    return new Response("Not found", { status: 404, headers: corsHeaders(request) });
  },
};
