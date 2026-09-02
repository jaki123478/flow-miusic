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
      cache.set(id, { url, exp: Date.now() + 12 * 60_000 });
      return url;
    }
  } catch (err: any) {
    lastError = err?.message || String(err);
    console.error("[resolveUrl error]", id, err);
  }
  cache.delete(id);
  return null;
}

const bufferCache = new Map<string, { buffer: Uint8Array; contentType: string; length: number; exp: number }>();

async function getBufferedAudio(id: string): Promise<{ buffer: Uint8Array; contentType: string; length: number } | null> {
  const cached = bufferCache.get(id);
  if (cached && cached.exp > Date.now()) return cached;

  const url = await resolveUrl(id);
  if (!url) return null;

  try {
    const upstream = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1",
      },
      signal: AbortSignal.timeout(15000),
    });
    if (!upstream.ok) return null;
    const arrayBuf = await upstream.arrayBuffer();
    const u8 = new Uint8Array(arrayBuf);
    const contentType = upstream.headers.get("content-type") || "audio/mp4";
    const entry = {
      buffer: u8,
      contentType,
      length: u8.byteLength,
      exp: Date.now() + 60 * 60_000,
    };
    bufferCache.set(id, entry);
    if (bufferCache.size > 25) {
      const oldest = bufferCache.keys().next().value;
      if (oldest) bufferCache.delete(oldest);
    }
    return entry;
  } catch (err) {
    console.error("[getBufferedAudio error]", id, err);
    return null;
  }
}

async function handleStream(request: Request): Promise<Response> {
  const parsed = new URL(request.url);
  const id = parsed.searchParams.get("v") || "";
  if (!/^[\w-]{11}$/.test(id)) return new Response("Bad request", { status: 400 });

  const wantSrc =
    parsed.searchParams.has("src") ||
    (request.headers.get("accept") || "").includes("application/json");

  let target = await resolveUrl(id, false);
  if (!target) target = await resolveUrl(id, true);

  if (wantSrc) {
    if (!target) {
      return Response.json(
        { url: null, error: lastError || "Stream resolution failed" },
        {
          status: 404,
          headers: {
            "Content-Type": "application/json; charset=utf-8",
            "Cache-Control": "no-store",
            Vary: "Accept",
          },
        },
      );
    }
    return Response.json(
      { url: target },
      {
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          "Cache-Control": "no-store",
          "Access-Control-Allow-Origin": "*",
          Vary: "Accept",
        },
      },
    );
  }

  if (target) {
    try {
      const range = request.headers.get("range") || "bytes=0-";
      const upstream = await fetch(target, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1",
          Range: range,
          Accept: "*/*",
        },
        signal: AbortSignal.timeout(10000),
      });

      if (upstream.ok || upstream.status === 206) {
        const headers = new Headers();
        headers.set("Content-Type", upstream.headers.get("content-type") || "audio/mp4");
        headers.set("Accept-Ranges", "bytes");
        headers.set("Access-Control-Allow-Origin", "*");
        headers.set("Cache-Control", "public, max-age=86400");

        const contentRange = upstream.headers.get("content-range");
        if (contentRange) headers.set("Content-Range", contentRange);

        const contentLength = upstream.headers.get("content-length");
        if (contentLength) headers.set("Content-Length", contentLength);

        return new Response(upstream.body, {
          status: upstream.status,
          headers,
        });
      }
    } catch {
      /* fallback to redirect */
    }

    return new Response(null, {
      status: 302,
      headers: {
        Location: target,
        "Cache-Control": "public, max-age=86400",
        "Access-Control-Allow-Origin": "*",
      },
    });
  }

  return new Response("No stream", { status: 404 });
}

export const Route = createFileRoute("/api/stream")({
  server: {
    handlers: {
      GET: async ({ request }) => handleStream(request),
      HEAD: async ({ request }) => handleStream(request),
    },
  },
});
