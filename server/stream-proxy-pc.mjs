#!/usr/bin/env node
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { spawn } from "node:child_process";
import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";
import { fileURLToPath } from "node:url";
import { BotGuardClient } from "bgutils-js/botguard";
import { buildURL, parseLooseJSON, getHeaders, USER_AGENT } from "bgutils-js/utils";
import { WebPoMinter } from "bgutils-js/webpo";
import { JSDOM } from "jsdom";
import { Innertube, Platform, UniversalCache } from "youtubei.js";

Platform.shim.eval = async (data) => new Function(data.output)();

const PORT = Number(process.env.STREAM_PORT || 8787);
const HOST = process.env.STREAM_HOST || "0.0.0.0";
const REQUEST_KEY = "O43z0dpjhgX20SCx4KAo";
const ROOT = path.dirname(fileURLToPath(import.meta.url));
const CACHE = process.env.STREAM_CACHE || path.join(ROOT, "cache");
fs.mkdirSync(CACHE, { recursive: true });

let sessionPromise = null;
const urlCache = new Map();
const inflight = new Map();

function ffmpegBin() {
  const candidates = [
    process.env.FFMPEG,
    path.join(ROOT, "ffmpeg.exe"),
    path.join(ROOT, "ffmpeg"),
    "C:\\Users\\Jaki1\\tools\\ffmpeg.exe",
    "ffmpeg",
  ].filter(Boolean);
  for (const c of candidates) {
    if (c === "ffmpeg") return c;
    try {
      if (fs.existsSync(c)) return c;
    } catch {}
  }
  return "ffmpeg";
}

function corsHeaders(req) {
  const origin = String(req.headers.origin || "");
  const allow =
    origin &&
    (origin.endsWith(".vercel.app") || origin.endsWith(".grok.me") || origin.endsWith(".grok.com") || origin.endsWith(".trycloudflare.com"))
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
function json(res, status, obj, extra) {
  const body = JSON.stringify(obj);
  setHeaders(res, { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store", "Content-Length": Buffer.byteLength(body), ...extra });
  res.writeHead(status);
  res.end(body);
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

async function createSession() {
  const dom = new JSDOM(" ", { url: "https://www.youtube.com", referrer: "https://www.youtube.com/", userAgent: USER_AGENT });
  const pageHtml = await (await fetch("https://www.youtube.com", { headers: { accept: "*/*", "accept-language": "en-US,en;q=0.7", "user-agent": USER_AGENT } })).text();
  const ytConfig = pageHtml.match(/ytcfg\.set\(({.+?})\);/s)?.[1];
  if (!ytConfig) throw new Error("no ytcfg");
  dom.window.yt = { config_: JSON.parse(ytConfig) };
  Object.assign(globalThis, { yt: dom.window.yt, window: dom.window, document: dom.window.document, location: dom.window.location, origin: dom.window.origin });
  if (!("navigator" in globalThis)) Object.defineProperty(globalThis, "navigator", { value: dom.window.navigator });
  const initialAttestationData = pageHtml.match(/window\.ytAtN\(\s*({[\s\S]*?})\s*\)/);
  if (!initialAttestationData) throw new Error("no challenge");
  const challengeResponse = parseLooseJSON(initialAttestationData[1]).R;
  if (!challengeResponse?.bgChallenge) throw new Error("no bgChallenge");
  const interpreterUrl = challengeResponse.bgChallenge.interpreterUrl.privateDoNotAccessOrElseTrustedResourceUrlWrappedValue;
  const interpreterJavascript = await (await fetch("https:" + interpreterUrl)).text();
  if (!interpreterJavascript) throw new Error("no VM");
  new Function(interpreterJavascript)();
  const botGuardClient = await BotGuardClient.create({
    program: challengeResponse.bgChallenge.program,
    globalName: challengeResponse.bgChallenge.globalName,
    globalObject: globalThis,
  });
  const webPoSignalOutput = [];
  const botguardResponse = await botGuardClient.snapshot({ webPoSignalOutput });
  const integrityTokenJson = await (await fetch(buildURL("GenerateIT", true), { method: "POST", headers: getHeaders(), body: JSON.stringify([REQUEST_KEY, botguardResponse]) })).json();
  const [integrityToken, estimatedTtlSecs, mintRefreshThreshold, websafeFallbackToken] = integrityTokenJson;
  const webPoMinter = await WebPoMinter.create({ integrityToken, estimatedTtlSecs, mintRefreshThreshold, websafeFallbackToken }, webPoSignalOutput);
  const innertube = await Innertube.create({ cache: new UniversalCache(false) });
  return { webPoMinter, innertube, exp: Date.now() + 25 * 60_000 };
}

function session() {
  if (!sessionPromise) {
    sessionPromise = createSession().catch((err) => {
      sessionPromise = null;
      throw err;
    });
  }
  return sessionPromise.then((s) => {
    if (s.exp < Date.now()) {
      sessionPromise = null;
      return session();
    }
    return s;
  });
}

async function resolveUrl(id) {
  const hit = urlCache.get(id);
  if (hit && hit.exp > Date.now() && hit.url) return hit;
  const { webPoMinter, innertube } = await session();
  const pot = await webPoMinter.mintAsWebsafeString(id);
  let info;
  try {
    info = await innertube.getBasicInfo(id, { client: "YTMUSIC" });
  } catch {
    info = await innertube.getBasicInfo(id, { client: "MUSIC" });
  }
  const format = info.chooseFormat({ quality: "best", type: "audio" });
  if (!format) throw new Error("no audio");
  const url = (await format.decipher(innertube.session.player)) + "&pot=" + pot;
  const length = Number(format.content_length) || 0;
  const entry = { url, length, exp: Date.now() + 8 * 60_000 };
  urlCache.set(id, entry);
  return entry;
}

function remux(input, output) {
  return new Promise((resolve, reject) => {
    const ff = spawn(ffmpegBin(), ["-y", "-hide_banner", "-loglevel", "error", "-i", input, "-c", "copy", "-movflags", "+faststart", "-f", "ipod", output], { windowsHide: true });
    let err = "";
    ff.stderr.on("data", (d) => {
      err += d;
    });
    ff.on("error", reject);
    ff.on("close", (code) => {
      if (code === 0) resolve();
      else reject(new Error("ffmpeg " + code + " " + err.slice(-500)));
    });
  });
}

async function ensureProgressive(id) {
  const out = path.join(CACHE, id + ".m4a");
  try {
    const st = fs.statSync(out);
    if (st.size > 8000) return { file: out, length: st.size };
  } catch {}
  if (inflight.has(id)) return inflight.get(id);
  const job = (async () => {
    const resolved = await resolveUrl(id);
    const dash = path.join(CACHE, id + ".dash.tmp");
    const tmp = path.join(CACHE, id + ".m4a.tmp");
    const u = new URL(resolved.url);
    if (resolved.length > 0) u.searchParams.set("range", "0-" + (resolved.length - 1));
    const res = await fetch(u, { headers: { "User-Agent": USER_AGENT, Accept: "*/*" }, redirect: "follow", signal: AbortSignal.timeout(120_000) });
    if (!(res.ok || res.status === 206) || !res.body) {
      try {
        await res.body?.cancel();
      } catch {}
      throw new Error("upstream " + res.status);
    }
    await pipeline(Readable.fromWeb(res.body), fs.createWriteStream(dash));
    await remux(dash, tmp);
    fs.renameSync(tmp, out);
    try {
      fs.unlinkSync(dash);
    } catch {}
    const st = fs.statSync(out);
    if (st.size < 8000) throw new Error("tiny remux");
    return { file: out, length: st.size };
  })();
  inflight.set(id, job);
  try {
    return await job;
  } finally {
    inflight.delete(id);
  }
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
    const body = JSON.stringify({ ok: true, ffmpeg: ffmpegBin(), cache: CACHE });
    res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
    res.end(body);
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
  let file;
  try {
    file = await ensureProgressive(id);
  } catch (err) {
    urlCache.delete(id);
    json(res, 502, { error: err instanceof Error ? err.message : "No stream" }, cors);
    return;
  }
  const size = file.length;
  const out = {
    ...cors,
    "Content-Type": "audio/mp4",
    "Accept-Ranges": "bytes",
    "Cache-Control": "public, max-age=120",
    "X-Content-Type-Options": "nosniff",
  };
  const isHead = req.method === "HEAD";
  const range = parseRange(req.headers.range, size);
  if (range?.unsat) {
    out["Content-Range"] = "bytes */" + size;
    setHeaders(res, out);
    res.writeHead(416);
    res.end();
    return;
  }
  if (isHead) {
    out["Content-Length"] = String(size);
    setHeaders(res, out);
    res.writeHead(200);
    res.end();
    return;
  }
  const start = range ? range.start : 0;
  const end = range ? range.end : size - 1;
  out["Content-Length"] = String(end - start + 1);
  if (range) {
    out["Content-Range"] = "bytes " + start + "-" + end + "/" + size;
    setHeaders(res, out);
    res.writeHead(206);
  } else {
    setHeaders(res, out);
    res.writeHead(200);
  }
  fs.createReadStream(file.file, { start, end }).on("error", () => {
    try {
      res.destroy();
    } catch {}
  }).pipe(res);
});

server.listen(PORT, HOST, () => {
  console.log("[flow-stream-proxy] safari-m4a ffmpeg=" + ffmpegBin() + " http://" + HOST + ":" + PORT);
});
