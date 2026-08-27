import { createFileRoute } from "@tanstack/react-router";
import { auth } from "@/lib/auth/server";

async function handle(request: Request): Promise<Response> {
  try {
    return await auth.handler(request);
  } catch (err) {
    console.error("[auth]", err);
    const path = new URL(request.url).pathname;
    if (path.endsWith("/get-session")) {
      return Response.json(null, { status: 200 });
    }
    return Response.json({ error: "Auth non disponibile" }, { status: 503 });
  }
}

export const Route = createFileRoute("/api/auth/$")({
  server: {
    handlers: {
      GET: ({ request }) => handle(request),
      POST: ({ request }) => handle(request),
    },
  },
});
