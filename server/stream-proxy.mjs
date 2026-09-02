#!/usr/bin/env node
/**
 * Flow Music stream proxy — InnerTube IOS resolve + googlevideo Range/206 pipe.
 * Same host must both resolve and proxy because googlevideo URLs are IP-locked.
 *
 * GET  /stream?id=VIDEO_ID
 * GET  /api/stream?id=VIDEO_ID   (also accepts ?v=)
 * GET  /health  → ok
 */
import http from "node:http";
import { Readable } from "node:stream";

const PORT = Number(process.env.STREAM_PORT || 8787);
const HOST = process.env.STREAM_HOST || "0.0.0.0";

const IOS_UA =
  "com.google.ios.youtube/20.11.6 (iPhone16,2; U; CPU iOS 17_5_1 like Mac OS X)";
const UPSTREAM_UA =
  "Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1";
const PLAYER_URL = "https://youtubei.googleapis.com/youtubei/v1/player?prettyPrint=false";
const IOS_CLIENT = {
  clientName: "IOS",
  clientVersion: "20.11.6",
  deviceMake: "Apple",
  deviceModel: "iPhone16,2",
  osName: "iOS",
  osVersion: "17.5.1.21F90",
  platform: "MOBILE",
  hl: "en",
  gl: "US",
};

const ALLOWED_ORIGINS = new Set([
  "https://flow-music-web.vercel.app",
  "https://flow-music-app-two.vercel.app",
]);

const urlCache = new Map();

function corsHeaders(req) {
  const origin = String(req.headers.origin || "");
  const allow =
    origin && (ALLOWED_ORIGINS.has(origin) || origin.endsWith(".vercel.app") || origin.endsWith(".trycloudflare.com"))
      ? origin
      : "*";
  return {
    "Access-Control-Allow-Origin": allow,
    "Access-Control-Allow-Methods": "GET, HEAD, OPTIONS",
    "Access-Control-Allow-Headers": "Range, Accept, Content-Type, Origin",
    "Access-Control-Expose-Headers": "Content-Length, Content-Range, Accept-Ranges, Content-Type",
    "Access-Control-Max-Age": "86400",
    Vary: "Origin",
  };
}

function setHeaders(res, obj) {
  for (const [k, v] of Object.entries(obj)) if (v != null) res.setHeader(k, v);
}

function isHttp(u) {
  return typeof u === "string" && /^https?:\/\//.test(u);
}

function isAudioFormat(f) {
  const mime = String(f?.mimeType || f?.mime_type || "");
  return mime.startsWith("audio/") || !!f?.audioQuality || !!f?.audio_quality;
}

function pickAudio(data) {
  const formats = [
    ...(data?.streamingData?.adaptiveFormats || []),
    ...(data?.streamingData?.formats || []),
  ];
  const audio = formats.filter((f) => isAudioFormat(f) && isHttp(f.url));
  audio.sort((a, b) => (b.bitrate || 0) - (a.bitrate || 0));
  const mp4 = audio.find((f) => String(f.mimeType || "").includes("mp4"));
  return mp4 || audio[0] || formats.find((f) => isHttp(f.url)) || null;
}

async function resolveStream(id) {
  const hit = urlCache.get(id);
  if (hit && hit.exp > Date.now()) return hit;
  const body = {
    videoId: id,
    context: { client: { ...IOS_CLIENT } },
    contentCheckOk: true,
    racyCheckOk: true,
  };
  const res = await fetch(PLAYER_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "User-Agent": IOS_UA,
      "X-YouTube-Client-Name": "5",
      "X-YouTube-Client-Version": IOS_CLIENT.clientVersion,
    },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(10_000),
  });
  if (!res.ok) throw new Error(`innertube ${res.status}`);
  const data = await res.json();
  const status = data?.playabilityStatus?.status || "?";
  const reason = data?.playabilityStatus?.reason || "";
  const fmt = pickAudio(data);
  if (!fmt?.url) {
    throw new Error(`no stream (${status}${reason ? ": " + String(reason).slice(0, 80) : ""})`);
  }
  const entry = {
    url: fmt.url,
    mime: String(fmt.mimeType || fmt.mime_type || "audio/mp4").split(";")[0].trim() || "audio/mp4",
    exp: Date.now() + 12 * 60_000,
  };
  urlCache.set(id, entry);
  return entry;
}

async function proxyBytes(target, range) {
  const headers = { "User-Agent": UPSTREAM_UA, Accept: "*/*" };
  if (range) headers.Range = range;
  return fetch(target, { headers, signal: AbortSignal.timeout(55_000), redirect: "follow" });
}

function json(res, status, obj, extra = {}) {
  const body = JSON.stringify(obj);
  setHeaders(res, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
    "Content-Length": Buffer.byteLength(body),
    ...extra,
  });
  res.writeHead(status);
  res.end(body);
}

function pipeWeb(res, webStream) {
  if (!webStream) {
    res.end();
    return;
  }
  Readable.fromWeb(webStream).on("error", () => {
    try {
      res.destroy();
    } catch {
      /* ignore */
    }
  }).pipe(res);
}

const server = http.createServer(async (req, res) => {
  const cors = corsHeaders(req);
  setHeaders(res, cors);

  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }

  let parsed;
  try {
    parsed = new URL(req.url || "/", `http://${req.headers.host || "localhost"}`);
  } catch {
    res.writeHead(400);
    res.end("Bad request");
    return;
  }

  const path = parsed.pathname.replace(/\/+$/, "") || "/";

  if (path === "/health") {
    res.writeHead(200, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("ok");
    return;
  }

  if (path !== "/stream" && path !== "/api/stream") {
    res.writeHead(404);
    res.end("Not found");
    return;
  }

  const id = (parsed.searchParams.get("id") || parsed.searchParams.get("v") || "").trim();
  if (!/^[\w-]{11}$/.test(id)) {
    json(res, 400, { error: "Bad request" }, cors);
    return;
  }

  let resolved;
  try {
    resolved = await resolveStream(id);
  } catch (err) {
    json(res, 404, { error: err instanceof Error ? err.message : "No stream" }, cors);
    return;
  }

  const range = req.headers.range || null;
  let upstream;
  try {
    upstream = await proxyBytes(resolved.url, range);
    if (!(upstream.ok || upstream.status === 206)) {
      try {
        await upstream.body?.cancel();
      } catch {
        /* ignore */
      }
      urlCache.delete(id);
      resolved = await resolveStream(id);
      upstream = await proxyBytes(resolved.url, range);
    }
  } catch (err) {
    json(res, 502, { error: err instanceof Error ? err.message : "Upstream fetch failed" }, cors);
    return;
  }

  if (!(upstream.ok || upstream.status === 206)) {
    const msg = `upstream ${upstream.status}`;
    try {
      await upstream.body?.cancel();
    } catch {
      /* ignore */
    }
    json(res, 502, { error: msg }, cors);
    return;
  }

  const out = {
    ...cors,
    "Content-Type": upstream.headers.get("content-type") || resolved.mime || "audio/mp4",
    "Accept-Ranges": "bytes",
    "Cache-Control": "public, max-age=3600",
  };
  const cr = upstream.headers.get("content-range");
  if (cr) out["Content-Range"] = cr;
  const cl = upstream.headers.get("content-length");
  if (cl) out["Content-Length"] = cl;
  setHeaders(res, out);
  res.writeHead(upstream.status);
  if (req.method === "HEAD") {
    try {
      await upstream.body?.cancel();
    } catch {
      /* ignore */
    }
    res.end();
    return;
  }
  pipeWeb(res, upstream.body);
});

server.listen(PORT, HOST, () => {
  console.log(`[flow-stream-proxy] http://${HOST}:${PORT}  /api/stream?id=VIDEO_ID`);
});
