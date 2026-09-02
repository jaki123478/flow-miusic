#!/usr/bin/env node
import http from "node:http";
import { Readable } from "node:stream";

const PORT = Number(process.env.STREAM_PORT || 8787);
const HOST = process.env.STREAM_HOST || "0.0.0.0";
const IOS_UA = "com.google.ios.youtube/20.11.6 (iPhone16,2; U; CPU iOS 17_5_1 like Mac OS X)";
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
const urlCache = new Map();

function corsHeaders(req) {
  const origin = String(req.headers.origin || "");
  const allow = origin && (origin.endsWith(".vercel.app") || origin.endsWith(".grok.me") || origin.endsWith(".grok.com") || origin.endsWith(".trycloudflare.com")) ? origin : "*";
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

function pickAudio(data) {
  const formats = [...(data?.streamingData?.adaptiveFormats || []), ...(data?.streamingData?.formats || [])];
  const audio = formats.filter((f) => {
    const mime = String(f?.mimeType || "");
    return typeof f.url === "string" && f.url.startsWith("http") && (mime.startsWith("audio/") || f.audioQuality);
  });
  return audio.find((f) => Number(f.itag) === 140) || audio.find((f) => String(f.mimeType || "").includes("mp4a")) || audio[0] || null;
}

async function resolveStream(id) {
  const hit = urlCache.get(id);
  if (hit && hit.exp > Date.now()) return hit;
  const res = await fetch(PLAYER_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "User-Agent": IOS_UA,
      "X-YouTube-Client-Name": "5",
      "X-YouTube-Client-Version": IOS_CLIENT.clientVersion,
    },
    body: JSON.stringify({ videoId: id, context: { client: { ...IOS_CLIENT } }, contentCheckOk: true, racyCheckOk: true }),
    signal: AbortSignal.timeout(10_000),
  });
  if (!res.ok) throw new Error("innertube " + res.status);
  const data = await res.json();
  const fmt = pickAudio(data);
  if (!fmt?.url) {
    const status = data?.playabilityStatus?.status || "?";
    throw new Error("no stream (" + status + ")");
  }
  const entry = { url: fmt.url, exp: Date.now() + 12 * 60_000 };
  urlCache.set(id, entry);
  return entry;
}

function clampRange(range) {
  if (range && /^bytes=/i.test(range)) {
    const m = /^bytes=(\d*)-(\d*)$/i.exec(range.trim());
    if (m) {
      const start = m[1] === "" ? 0 : Number(m[1]);
      let end = m[2] === "" ? start + 524287 : Number(m[2]);
      if (!Number.isFinite(start) || start > 1048575) return "bytes=0-524287";
      if (!Number.isFinite(end) || end - start > 524287 || end > start + 524287) end = start + 524287;
      if (end > 1048575) end = 1048575;
      return "bytes=" + start + "-" + end;
    }
  }
  return "bytes=0-65535";
}

async function proxyBytes(target, range) {
  const headers = { "User-Agent": UPSTREAM_UA, Accept: "*/*", Range: clampRange(range) };
  return fetch(target, { headers, signal: AbortSignal.timeout(20_000), redirect: "follow" });
}

function json(res, status, obj, extra) {
  const body = JSON.stringify(obj);
  setHeaders(res, { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store", "Content-Length": Buffer.byteLength(body), ...extra });
  res.writeHead(status);
  res.end(body);
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
    parsed = new URL(req.url || "/", "http://" + (req.headers.host || "localhost"));
  } catch {
    res.writeHead(400);
    res.end("Bad request");
    return;
  }
  const pathname = parsed.pathname.replace(/\/+$/, "") || "/";
  if (pathname === "/health") {
    res.writeHead(200, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("ok");
    return;
  }
  if (pathname !== "/stream" && pathname !== "/api/stream") {
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
  let upstream;
  try {
    upstream = await proxyBytes(resolved.url, req.headers.range || null);
    if (!(upstream.ok || upstream.status === 206)) {
      urlCache.delete(id);
      resolved = await resolveStream(id);
      try {
        await upstream.body?.cancel();
      } catch {}
      upstream = await proxyBytes(resolved.url, req.headers.range || null);
    }
  } catch (err) {
    json(res, 502, { error: err instanceof Error ? err.message : "Upstream fetch failed" }, cors);
    return;
  }
  if (!(upstream.ok || upstream.status === 206)) {
    json(res, 502, { error: "upstream " + upstream.status }, cors);
    return;
  }
  const cr = upstream.headers.get("content-range");
  const cl = upstream.headers.get("content-length");
  const out = { ...cors, "Content-Type": "audio/mp4", "Accept-Ranges": "bytes", "Cache-Control": "public, max-age=120" };
  if (cr) out["Content-Range"] = cr;
  if (cl) out["Content-Length"] = cl;
  const isHead = req.method === "HEAD";
  if (isHead && cr) {
    const total = (/\/(\d+)\s*$/.exec(cr) || [])[1];
    if (total) {
      out["Content-Length"] = total;
      delete out["Content-Range"];
      setHeaders(res, out);
      res.writeHead(200);
      try {
        await upstream.body?.cancel();
      } catch {}
      res.end();
      return;
    }
  }
  setHeaders(res, out);
  res.writeHead(upstream.status === 206 ? 206 : 200);
  if (isHead) {
    try {
      await upstream.body?.cancel();
    } catch {}
    res.end();
    return;
  }
  if (!upstream.body) {
    res.end();
    return;
  }
  Readable.fromWeb(upstream.body).on("error", () => {
    try {
      res.destroy();
    } catch {}
  }).pipe(res);
});

server.listen(PORT, HOST, () => {
  console.log("[flow-stream-proxy] http://" + HOST + ":" + PORT + "  /api/stream?id=VIDEO_ID");
});
