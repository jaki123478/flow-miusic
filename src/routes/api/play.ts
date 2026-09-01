import { createFileRoute } from "@tanstack/react-router";
import { getAudioUrl } from "@/lib/music/ytmusic.server";

export const Route = createFileRoute("/api/play")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        try {
          const id = new URL(request.url).searchParams.get("v") || "";
          if (!/^[\w-]{11}$/.test(id)) {
            return Response.json({ url: null }, { status: 400, headers: { "Cache-Control": "no-store" } });
          }
          const url = await getAudioUrl(id).catch(() => null);
          return Response.json(
            { url: url || null },
            {
              status: url ? 200 : 404,
              headers: {
                "Content-Type": "application/json; charset=utf-8",
                "Cache-Control": "no-store",
                "Access-Control-Allow-Origin": "*",
              },
            },
          );
        } catch {
          return Response.json({ url: null }, { status: 404, headers: { "Cache-Control": "no-store" } });
        }
      },
    },
  },
});
