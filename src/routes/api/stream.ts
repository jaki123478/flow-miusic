import { createFileRoute } from "@tanstack/react-router";
import { getAudioUrl } from "@/lib/music/ytmusic.server";

/** Vercel / Nitro: allow the googlevideo proxy to outlive the old 12s kill. */
export const maxDuration = 60;

const cache = new Map<string, { url: string; exp: number }>();

const UPSTREAM_UA =
  "Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1";

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
  } catch (err: unknown) {
    lastError = err instanceof Error ? err.message : String(err);
    console.error("[resolveUrl error]", id, err);
  }
  cache.delete(id);
  return null;
}

function fail(status: number, message: string): Response {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
      "Access-Control-Allow-Origin": "*",
    },
  });
}

function proxyAudio(upstream: Response): Response {
  const headers = new Headers();
  headers.set("Content-Type", upstream.headers.get("content-type") || "audio/mp4");
  headers.set("Accept-Ranges", "bytes");
  headers.set("Access-Control-Allow-Origin", "*");
  headers.set("Cache-Control", "public, max-age=3600");

  const contentRange = upstream.headers.get("content-range");
  if (contentRange) headers.set("Content-Range", contentRange);

  const contentLength = upstream.headers.get("content-length");
  if (contentLength) headers.set("Content-Length", contentLength);

  return new Response(upstream.body, {
    status: upstream.status,
    headers,
  });
}

async function fetchUpstream(target: string, range: string | null): Promise<Response> {
  const headers: Record<string, string> = {
    "User-Agent": UPSTREAM_UA,
    Accept: "*/*",
  };
  // Only forward Range if the client sent one. Never invent bytes=0-.
  if (range) headers.Range = range;
  return fetch(target, {
    headers,
    signal: AbortSignal.timeout(55_000),
  });
}

async function tryProxy(target: string, range: string | null): Promise<Response | null> {
  try {
    const upstream = await fetchUpstream(target, range);
    if (upstream.ok || upstream.status === 206) return proxyAudio(upstream);
    lastError = `upstream ${upstream.status}`;
    try {
      await upstream.body?.cancel();
    } catch {
      /* ignore */
    }
  } catch (err: unknown) {
    lastError = err instanceof Error ? err.message : String(err);
  }
  return null;
}

async function handleStream(request: Request): Promise<Response> {
  const parsed = new URL(request.url);
  const id = parsed.searchParams.get("v") || "";
  if (!/^[\w-]{11}$/.test(id)) return new Response("Bad request", { status: 400 });

  const wantSrc =
    parsed.searchParams.has("src") ||
    (request.headers.get("accept") || "").includes("application/json");

  const target = await resolveUrl(id, false);

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

  if (!target) return new Response("No stream", { status: 404 });

  const range = request.headers.get("range");

  // Always fetch googlevideo from this isolate so the URL's IP lock matches.
  // Never 302 to googlevideo — those URLs are IP-locked to the lambda.
  let proxied = await tryProxy(target, range);
  if (!proxied) {
    const retry = await resolveUrl(id, true);
    if (retry) proxied = await tryProxy(retry, range);
  }
  if (proxied) return proxied;

  return fail(502, lastError || "Upstream fetch failed");
}

export const Route = createFileRoute("/api/stream")({
  server: {
    handlers: {
      GET: async ({ request }) => handleStream(request),
      HEAD: async ({ request }) => handleStream(request),
    },
  },
});
