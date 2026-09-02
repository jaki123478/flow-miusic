#!/usr/bin/env node
import http from "node:http";

const PORT = Number(process.env.STREAM_PORT || 8787);
const HOST = process.env.STREAM_HOST || "0.0.0.0";
const IOS_UA = "com.google.ios.youtube/20.11.6 (iPhone16,2; U; CPU iOS 17_5_1 like Mac OS X)";
const UPSTREAM_UA = "Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1";
const PLAYER_URL = "https://youtubei.googleapis.com/youtubei/v1/player?prettyPrint=false";
const CHUNK = 256 * 1024;
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
const fileCache = new Map();

function corsHeaders(req) {
  const origin = String(req.headers.origin || "");
  const allow =
    origin &&
    (origin.endsWith(".vercel.app") ||
      origin.endsWith(".grok.me") ||
      origin.endsWith(".grok.com") ||
      origin.endsWith(".trycloudflare.com"))
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
    signal: AbortSignal.timeout(12_000),
  });
  if (!res.ok) throw new Error("innertube " + res.status);
  const data = await res.json();
  const fmt = pickAudio(data);
  if (!fmt?.url) throw new Error("no stream (" + (data?.playabilityStatus?.status || "?") + ")");
  const entry = { url: fmt.url, exp: Date.now() + 8 * 60_000, length: Number(fmt.contentLength) || 0 };
  urlCache.set(id, entry);
  return entry;
}
async function fetchSlice(url, start, end) {
  const headers = { "User-Agent": UPSTREAM_UA, Accept: "*/*", Range: "bytes=" + start + "-" + end };
  const res = await fetch(url, { headers, signal: AbortSignal.timeout(25_000), redirect: "follow" });
  return res;
}
function parseTotal(cr, fallback) {
  const m = /\/(\d+)\s*$/.exec(String(cr || ""));
  return m ? Number(m[1]) : fallback;
}
async function fetchFull(url, knownLen) {
  const parts = [];
  let start = 0;
  let total = knownLen || 0;
  while (!total || start < total) {
    const end = total ? Math.min(start + CHUNK - 1, total - 1) : start + CHUNK - 1;
    let res = await fetchSlice(url, start, end);
    if (!(res.ok || res.status === 206)) {
      try { await res.body?.cancel(); } catch {}
      throw new Error("upstream " + res.status + " at " + start);
    }
    const cr = res.headers.get("content-range");
    total = parseTotal(cr, total);
    const buf = Buffer.from(await res.arrayBuffer());
    if (!buf.length) break;
    parts.push(buf);
    start += buf.length;
    if (res.status === 200) break;
    if (total && start >= total) break;
    if (!total && buf.length < CHUNK) break;
  }
  return Buffer.concat(parts, total || undefined);
}
async function getFile(id) {
  const hit = fileCache.get(id);
  if (hit && hit.exp > Date.now() && hit.buf?.length) return hit.buf;
  let resolved = await resolveStream(id);
  let buf;
  try {
    buf = await fetchFull(resolved.url, resolved.length);
  } catch {
    urlCache.delete(id);
    resolved = await resolveStream(id);
    buf = await fetchFull(resolved.url, resolved.length);
  }
  if (!buf?.length) throw new Error("empty body");
  fileCache.set(id, { buf, exp: Date.now() + 6 * 60_000 });
  if (fileCache.size > 12) {
    const first = fileCache.keys().next().value;
    fileCache.delete(first);
  }
  return buf;
}
function parseRange(header, size) {
  const m = /^bytes=(\d*)-(\d*)$/i.exec(String(header || "").trim());
  if (!m) return null;
  let start = m[1] === "" ? 0 : Number(m[1]);
  let end = m[2] === "" ? size - 1 : Number(m[2]);
  if (!Number.isFinite(start) || !Number.isFinite(end) || start < 0) return null;
  if (start >= size) return { unsat: true };
  end = Math.min(end, size - 1);
  if (end < start) return null;
  return { start, end };
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
  if (pathname === "/health" || pathname === "/api/health") {
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
  let buf;
  try {
    buf = await getFile(id);
  } catch (err) {
    json(res, 502, { error: err instanceof Error ? err.message : "No stream" }, cors);
    return;
  }
  const size = buf.length;
  const out = { ...cors, "Content-Type": "audio/mp4", "Accept-Ranges": "bytes", "Cache-Control": "public, max-age=120" };
  const isHead = req.method === "HEAD";
  const range = parseRange(req.headers.range, size);
  if (range?.unsat) {
    out["Content-Range"] = "bytes */" + size;
    setHeaders(res, out);
    res.writeHead(416);
    res.end();
    return;
  }
  if (range) {
    const slice = buf.subarray(range.start, range.end + 1);
    out["Content-Range"] = "bytes " + range.start + "-" + range.end + "/" + size;
    out["Content-Length"] = String(slice.length);
    setHeaders(res, out);
    res.writeHead(206);
    if (isHead) res.end();
    else res.end(slice);
    return;
  }
  out["Content-Length"] = String(size);
  setHeaders(res, out);
  res.writeHead(200);
  if (isHead) res.end();
  else res.end(buf);
});

server.listen(PORT, HOST, () => {
  console.log("[flow-stream-proxy] http://" + HOST + ":" + PORT);
});
