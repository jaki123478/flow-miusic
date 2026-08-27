import { createFileRoute } from "@tanstack/react-router";
import { getAudioUrl } from "@/lib/music/ytmusic.server";

const cache = new Map<string, { url: string; exp: number }>();

async function resolveUrl(id: string, force = false): Promise<string | null> {
  const hit = cache.get(id);
  if (!force && hit && hit.exp > Date.now()) return hit.url;
  const url = await getAudioUrl(id);
  if (url) cache.set(id, { url, exp: Date.now() + 12 * 60_000 });
  else cache.delete(id);
  return url;
}

async function handleStream(request: Request): Promise<Response> {
  const parsed = new URL(request.url);
  const id = parsed.searchParams.get("v") || "";
  if (!/^[\w-]{11}$/.test(id)) return new Response("Bad request", { status: 400 });

  const wantSrc =
    parsed.searchParams.has("src") ||
    (request.headers.get("accept") || "").includes("application/json");

  if (wantSrc && parsed.searchParams.has("src")) {
    let target = await resolveUrl(id, false);
    if (!target) target = await resolveUrl(id, true);
    if (!target) {
      return Response.json(
        { url: null },
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

  const play = async (force: boolean) => {
    const target = await resolveUrl(id, force);
    if (!target) return null;
    const headers = new Headers();
    const range = request.headers.get("range");
    if (range) headers.set("Range", range);
    headers.set(
      "User-Agent",
      "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1",
    );
    headers.set("Accept", "*/*");
    headers.set("Referer", "https://www.youtube.com/");
    return fetch(target, { headers, redirect: "follow" });
  };

  let upstream = await play(false);
  if (!upstream || upstream.status === 403 || upstream.status === 410) {
    cache.delete(id);
    upstream = await play(true);
  }
  if (!upstream) return new Response("No stream", { status: 404 });

  const out = new Headers();
  for (const key of ["content-type", "content-length", "content-range", "accept-ranges"]) {
    const v = upstream.headers.get(key);
    if (v) out.set(key, v);
  }
  if (!out.has("accept-ranges")) out.set("Accept-Ranges", "bytes");
  if (!out.has("content-type")) out.set("Content-Type", "audio/mp4");
  out.set("Cache-Control", "private, max-age=120");
  out.set("Vary", "Accept, Range");

  return new Response(request.method === "HEAD" ? null : upstream.body, {
    status: upstream.status,
    headers: out,
  });
}

export const Route = createFileRoute("/api/stream")({
  server: {
    handlers: {
      GET: async ({ request }) => handleStream(request),
      HEAD: async ({ request }) => handleStream(request),
    },
  },
});
