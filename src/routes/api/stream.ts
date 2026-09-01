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

  let target = await resolveUrl(id, false);
  if (!target) target = await resolveUrl(id, true);

  if (wantSrc) {
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

  if (target) {
    return new Response(null, {
      status: 302,
      headers: {
        Location: target,
        "Cache-Control": "public, max-age=3600",
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
