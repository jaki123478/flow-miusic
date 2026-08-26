import { createFileRoute } from "@tanstack/react-router";

const BLOCKED_HOSTS = /^(localhost|127\.|10\.|192\.168\.|172\.(1[6-9]|2\d|3[0-1])\.|169\.254\.|0\.|\[::1\]|\[::ffff:127)/i;

function isBlockedUrl(raw: string): boolean {
  try {
    const u = new URL(raw);
    if (u.protocol !== "https:") return true;
    if (BLOCKED_HOSTS.test(u.hostname)) return true;
    return false;
  } catch {
    return true;
  }
}

async function handleProxy(request: Request): Promise<Response> {
  const target = new URL(request.url).searchParams.get("u") || "";
  if (!target || isBlockedUrl(target)) {
    return new Response("Forbidden", { status: 403 });
  }

  const headers = new Headers();
  const range = request.headers.get("range");
  if (range) headers.set("Range", range);
  const ua = request.headers.get("user-agent");
  headers.set("User-Agent", ua || "FlowMusic/1.0");
  headers.set("Accept", "*/*");

  let upstream: Response;
  try {
    upstream = await fetch(target, {
      headers,
      redirect: "follow",
      signal: AbortSignal.timeout(20000),
    });
  } catch {
    return new Response("Upstream unavailable", { status: 502 });
  }

  const out = new Headers();
  const pass = ["content-type", "content-length", "content-range", "accept-ranges", "cache-control"];
  for (const key of pass) {
    const v = upstream.headers.get(key);
    if (v) out.set(key, v);
  }
  if (!out.has("accept-ranges")) out.set("Accept-Ranges", "bytes");
  out.set("Cache-Control", out.get("Cache-Control") || "private, max-age=60");

  return new Response(request.method === "HEAD" ? null : upstream.body, {
    status: upstream.status,
    headers: out,
  });
}

export const Route = createFileRoute("/api/proxy")({
  server: {
    handlers: {
      GET: async ({ request }) => handleProxy(request),
      HEAD: async ({ request }) => handleProxy(request),
    },
  },
});
