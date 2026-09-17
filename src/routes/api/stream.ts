import { createFileRoute } from "@tanstack/react-router";
import { getAudioUrl } from "@/lib/music/ytmusic.server";

const cache = new Map<string, { url: string; exp: number }>();
let lastError = "";

async function resolveUrl(id: string, force = false): Promise<string | null> {
  const hit = cache.get(id);
  if (!force && hit && hit.exp > Date.now()) return hit.url;
  try {
    const url = await getAudioUrl(id);
    if (url) {
      cache.set(id, { url, exp: Date.now() + 8 * 60_000 });
      return url;
    }
  } catch (err: any) {
    lastError = err?.message || String(err);
    console.error("[resolveUrl error]", id, err);
  }
  cache.delete(id);
  return null;
}

function makeCorsHeaders(): Headers {
  const h = new Headers();
  h.set("Access-Control-Allow-Origin", "*");
  h.set("Access-Control-Allow-Methods", "GET, HEAD, OPTIONS");
  h.set("Access-Control-Allow-Headers", "Range, Content-Type, Accept, Origin, User-Agent, X-Requested-With");
  h.set("Access-Control-Expose-Headers", "Content-Range, Content-Length, Accept-Ranges, Content-Type");
  return h;
}

function getUpstreamHeaders(target: string, range: string | null): Record<string, string> {
  const headers: Record<string, string> = {
    Accept: "*/*",
  };

  let client = "";
  try {
    const parsed = new URL(target);
    client = (parsed.searchParams.get("c") || "").toUpperCase();
  } catch {}

  if (client === "IOS") {
    headers["User-Agent"] = "com.google.ios.youtube/19.29.1 (iPhone16,2; U; CPU iOS 17_5_1 like Mac OS X;)";
  } else if (client === "ANDROID_VR") {
    headers["User-Agent"] = "com.google.android.apps.youtube.vr.oculus/1.37 (Linux; U; Android 12; en_US; Quest 3; Build/SQ3A.220605.009.A1; Cronet/107.0.5284.2)";
  } else if (client.includes("TV")) {
    headers["Origin"] = "https://www.youtube.com";
    headers["Referer"] = "https://www.youtube.com/tv";
    headers["User-Agent"] =
      "Mozilla/5.0(SMART-TV; Linux; Tizen 4.0.0.2) AppleWebkit/605.1.15 (KHTML, like Gecko) SamsungBrowser/9.2 TV Safari/605.1.15";
  } else {
    headers["Origin"] = "https://music.youtube.com";
    headers["Referer"] = "https://music.youtube.com/";
    headers["User-Agent"] =
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36";
  }

  if (range) {
    headers["Range"] = range;
  }

  return headers;
}

function normalizeUpstreamRange(range: string | null, clen: number): string {
  const CHUNK_SIZE = 512 * 1024; // 512 KB
  if (!range) {
    const end = clen > 0 ? Math.min(CHUNK_SIZE - 1, clen - 1) : CHUNK_SIZE - 1;
    return `bytes=0-${end}`;
  }
  const raw = range.replace(/^bytes=/, "").trim();
  const [sStr, eStr] = raw.split("-");
  const start = parseInt(sStr, 10) || 0;
  let end = eStr ? parseInt(eStr, 10) : start + CHUNK_SIZE - 1;
  // Cap chunk size at 1MB to prevent GoogleVideo 403 Forbidden
  if (end - start + 1 > 1048576) {
    end = start + 1048576 - 1;
  }
  if (clen > 0 && end >= clen) {
    end = clen - 1;
  }
  return `bytes=${start}-${end}`;
}

async function fetchUpstream(target: string, range: string): Promise<Response> {
  const headers = getUpstreamHeaders(target, range);
  return fetch(target, {
    headers,
    signal: AbortSignal.timeout(20000),
  });
}

async function handleStream(request: Request): Promise<Response> {
  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: makeCorsHeaders() });
  }

  const parsed = new URL(request.url);
  const id = parsed.searchParams.get("v") || parsed.searchParams.get("id") || "";
  if (!/^[\w-]{11}$/.test(id)) {
    const h = makeCorsHeaders();
    return new Response("Bad request", { status: 400, headers: h });
  }

  const wantSrc =
    parsed.searchParams.has("src") ||
    (request.headers.get("accept") || "").includes("application/json");

  let target = await resolveUrl(id, false);
  if (!target) target = await resolveUrl(id, true);

  if (wantSrc) {
    if (!target) {
      const h = makeCorsHeaders();
      h.set("Content-Type", "application/json; charset=utf-8");
      h.set("Cache-Control", "no-store");
      h.set("Vary", "Accept");
      return Response.json(
        { url: null, error: lastError || "Stream resolution failed" },
        { status: 404, headers: h },
      );
    }
    const h = makeCorsHeaders();
    h.set("Content-Type", "application/json; charset=utf-8");
    h.set("Cache-Control", "public, max-age=3600");
    h.set("Vary", "Accept");
    return Response.json({ url: target }, { headers: h });
  }

  const clientRange = request.headers.get("range");

  if (target) {
    let clen = 0;
    let dur = 0;
    try {
      const parsedTarget = new URL(target);
      clen = parseInt(parsedTarget.searchParams.get("clen") || "0", 10);
      dur = parseFloat(parsedTarget.searchParams.get("dur") || "0");
    } catch {}

    const upstreamRange = normalizeUpstreamRange(clientRange, clen);
    let upstream: Response | null = null;
    try {
      upstream = await fetchUpstream(target, upstreamRange);
      if (!upstream.ok && upstream.status !== 206) {
        console.warn(`[stream.ts] Upstream returned ${upstream.status} for ${id} (clientRange: "${clientRange}", upstreamRange: "${upstreamRange}")`);
        cache.delete(id);
        const freshTarget = await resolveUrl(id, true);
        if (freshTarget) {
          target = freshTarget;
          try {
            const p = new URL(target);
            clen = parseInt(p.searchParams.get("clen") || "0", 10);
            dur = parseFloat(p.searchParams.get("dur") || "0");
          } catch {}
          const freshRange = normalizeUpstreamRange(clientRange, clen);
          upstream = await fetchUpstream(target, freshRange);
        }
      }
    } catch (err) {
      console.warn(`[stream.ts] Upstream fetch error for ${id}, retrying fresh:`, err);
      cache.delete(id);
      try {
        const freshTarget = await resolveUrl(id, true);
        if (freshTarget) {
          target = freshTarget;
          try {
            const p = new URL(target);
            clen = parseInt(p.searchParams.get("clen") || "0", 10);
            dur = parseFloat(p.searchParams.get("dur") || "0");
          } catch {}
          const freshRange = normalizeUpstreamRange(clientRange, clen);
          upstream = await fetchUpstream(target, freshRange);
        }
      } catch (retryErr) {
        console.error(`[stream.ts] Retry failed for ${id}:`, retryErr);
      }
    }

    if (upstream && (upstream.ok || upstream.status === 206)) {
      const headers = makeCorsHeaders();
      const contentType = upstream.headers.get("content-type") || "audio/mp4";
      const contentRange = upstream.headers.get("content-range");
      const contentLength = upstream.headers.get("content-length");

      headers.set("Content-Type", contentType);
      headers.set("Accept-Ranges", "bytes");
      headers.set("Cache-Control", "public, max-age=3600, stale-while-revalidate=86400");
      headers.set("Vary", "Range, Accept-Encoding");
      if (dur > 0) {
        headers.set("X-Audio-Duration", dur.toString());
      }

      const status = upstream.status === 206 ? 206 : (contentRange ? 206 : 200);

      if (contentRange) {
        headers.set("Content-Range", contentRange);
      }
      if (contentLength) {
        headers.set("Content-Length", contentLength);
      } else if (contentRange) {
        const parts = contentRange.replace(/^bytes\s+/, "").split("/");
        const rangePart = parts[0];
        if (rangePart) {
          const [start, end] = rangePart.split("-").map((n) => parseInt(n, 10));
          if (!isNaN(start) && !isNaN(end)) {
            headers.set("Content-Length", String(end - start + 1));
          }
        }
      }

      if (request.method === "HEAD") {
        return new Response(null, {
          status,
          headers,
        });
      }

      return new Response(upstream.body, {
        status,
        headers,
      });
    }
  }

  // Never issue 302 redirect to googlevideo.com to avoid ORB errors
  const h = makeCorsHeaders();
  h.set("Content-Type", "application/json; charset=utf-8");
  return new Response(JSON.stringify({ error: "Stream unavailable" }), {
    status: 502,
    headers: h,
  });
}

export const Route = createFileRoute("/api/stream")({
  server: {
    handlers: {
      GET: async ({ request }) => handleStream(request),
      HEAD: async ({ request }) => handleStream(request),
      OPTIONS: async () => new Response(null, { status: 204, headers: makeCorsHeaders() }),
    },
  },
});
