import { createFileRoute } from "@tanstack/react-router";
import { getAudioUrl } from "@/lib/music/ytmusic.server";

const cache = new Map<string, { url: string; exp: number }>();

async function resolveUrl(id: string, force = false): Promise<string | null> {
  const hit = cache.get(id);
  if (!force && hit && hit.exp > Date.now()) return hit.url;
  const url = await getAudioUrl(id);
  if (url) cache.set(id, { url, exp: Date.now() + 15 * 60_000 });
  else cache.delete(id);
  return url;
}

async function handleStream(request: Request): Promise<Response> {
  const id = new URL(request.url).searchParams.get("v") || "";
  if (!/^[\w-]{11}$/.test(id)) return new Response("Bad request", { status: 400 });
  let url = await resolveUrl(id, false);
  if (!url) url = await resolveUrl(id, true);
  if (!url) return new Response("No stream", { status: 404 });
  return Response.json(
    { url },
    { headers: { "Cache-Control": "private, max-age=30" } },
  );
}

export const Route = createFileRoute("/api/stream")({
  server: {
    handlers: {
      GET: async ({ request }) => handleStream(request),
    },
  },
});
