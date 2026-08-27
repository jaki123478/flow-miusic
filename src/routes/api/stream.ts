import { createFileRoute } from "@tanstack/react-router";
import { getAudioUrl } from "@/lib/music/ytmusic.server";

const cache = new Map<string, { url: string; exp: number }>();

async function resolveUrl(id: string, force = false): Promise<string | null> {
  const hit = cache.get(id);
  if (!force && hit && hit.exp > Date.now()) return hit.url;
  const url = await getAudioUrl(id);
  if (url) cache.set(id, { url, exp: Date.now() + 20 * 60_000 });
  else cache.delete(id);
  return url;
}

async function handleStream(request: Request): Promise<Response> {
  const id = new URL(request.url).searchParams.get("v") || "";
  if (!/^[\w-]{11}$/.test(id)) return new Response("Bad request", { status: 400 });

  const play = async (force: boolean) => {
    const target = await resolveUrl(id, force);
    if (!target) return null;
    const headers = new Headers();
    const range = request.headers.get("range");
    if (range) headers.set("Range", range);
    headers.set(
      "User-Agent",
      request.headers.get("user-agent") ||
        "Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Mobile Safari/537.36",
    );
    headers.set("Accept", "*/*");
    headers.set("Referer", "https://www.youtube.com/");
    headers.set("Origin", "https://www.youtube.com");
    return fetch(target, { headers, redirect: "follow" });
  };

  let upstream = await play(false);
  if (!upstream || upstream.status === 403 || upstream.status === 410) {
    cache.delete(id);
    upstream = await play(true);
  }
  if (!upstream) return new Response("No stream", { status: 404 });

  const out = new Headers();
  const pass = ["content-type", "content-length", "content-range", "accept-ranges", "cache-control"];
  for (const key of pass) {
    const v = upstream.headers.get(key);
    if (v) out.set(key, v);
  }
  if (!out.has("accept-ranges")) out.set("Accept-Ranges", "bytes");
  if (!out.has("content-type")) out.set("Content-Type", "audio/mp4");
  out.set("Cache-Control", "private, max-age=60");

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
