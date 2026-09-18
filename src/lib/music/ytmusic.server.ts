import { Innertube, UniversalCache, Platform, Log } from "youtubei.js";
import { FALLBACK_ART, type Track } from "./types";

try {
  Log.setLevel(Log.Level.ERROR);
} catch {}

// Provide the JS evaluator so Innertube can decipher signatures and n-throttle tokens!
if (typeof Platform !== "undefined" && Platform?.shim) {
  Platform.shim.eval = (data: any) => {
    return new Function(data.output)();
  };
}

let tubePromise: Promise<Innertube> | null = null;

export async function getTube(): Promise<Innertube> {
  if (typeof Platform !== "undefined" && Platform?.shim) {
    Platform.shim.eval = (data: any) => {
      return new Function(data.output)();
    };
  }
  if (!tubePromise) {
    tubePromise = Innertube.create({
      cache: new UniversalCache(false),
      lang: "it",
      location: "IT",
    }).catch((err) => {
      tubePromise = null;
      throw err;
    });
  }
  return tubePromise;
}

async function validateStreamUrl(url: string, clientName: string): Promise<boolean> {
  try {
    const headers: Record<string, string> = {
      Range: "bytes=0-100",
      Accept: "*/*",
    };
    if (clientName === "IOS") {
      headers["User-Agent"] = "com.google.ios.youtube/19.29.1 (iPhone16,2; U; CPU iOS 17_5_1 like Mac OS X;)";
    } else if (clientName === "ANDROID_VR") {
      headers["User-Agent"] = "com.google.android.apps.youtube.vr.oculus/1.37 (Linux; U; Android 12; en_US; Quest 3; Build/SQ3A.220605.009.A1; Cronet/107.0.5284.2)";
    } else {
      headers["User-Agent"] = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36";
      headers["Origin"] = "https://music.youtube.com";
      headers["Referer"] = "https://music.youtube.com/";
    }
    const res = await fetch(url, {
      method: "GET",
      headers,
      signal: AbortSignal.timeout(3500),
    });
    return res.status === 200 || res.status === 206;
  } catch {
    return false;
  }
}

// chooseFormat() THROWS when no format matches — wrap it so callers get null instead
function safeChooseFormat(info: any, opts: Record<string, unknown>): any | null {
  try {
    return info.chooseFormat(opts) || null;
  } catch {
    return null;
  }
}

function pickAudioFormat(info: any): any | null {
  return (
    safeChooseFormat(info, { type: "audio", quality: "best" }) ||
    safeChooseFormat(info, { type: "audio" }) ||
    safeChooseFormat(info, { type: "audio", format: "mp4" }) ||
    info.streaming_data?.adaptive_formats?.find((f: any) => (f.mime_type || "").startsWith("audio/")) ||
    info.streaming_data?.formats?.find((f: any) => (f.mime_type || "").startsWith("audio/") || f.has_audio) ||
    null
  );
}

async function fetchFallbackAudioUrl(id: string): Promise<string | null> {
  // Race all mirrors in parallel — first JSON response with an audio URL wins
  const mirrors = [
    `https://pipedapi.kavin.rocks/streams/${id}`,
    `https://pipedapi.adminforge.de/streams/${id}`,
    `https://invidious.fdn.fr/api/v1/videos/${id}`,
    `https://inv.nadeko.net/api/v1/videos/${id}`,
    `https://invidious.nerdvpn.de/api/v1/videos/${id}`,
  ];

  const attempts = mirrors.map(async (endpoint) => {
    const isInvidious = endpoint.includes("/api/v1/");
    const res = await fetch(endpoint, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36",
        Accept: "application/json",
      },
      signal: AbortSignal.timeout(4000),
    });
    if (!res.ok) throw new Error(`${res.status}`);
    const ct = res.headers.get("content-type") || "";
    if (!ct.includes("json")) throw new Error("not json");
    const data = (await res.json()) as any;

    let bestUrl: string | null = null;
    if (isInvidious) {
      const formats = data.adaptiveFormats || [];
      const audio = formats.find((f: any) => (f.type || "").startsWith("audio/"));
      bestUrl = audio?.url || null;
    } else {
      const streams = data.audioStreams || data.adaptiveFormats || [];
      const best = streams.find((s: any) => (s.mimeType || s.type || "").startsWith("audio/"));
      bestUrl = best?.url || null;
    }
    if (!bestUrl) throw new Error("no audio");
    return bestUrl;
  });

  try {
    return await Promise.any(attempts);
  } catch {
    return null;
  }
}

// Try a single client and return the first URL found (no validation — the proxy retries on 403)
async function tryClient(
  yt: any,
  id: string,
  client: string,
): Promise<string> {
  const info = await yt.getInfo(id, { client });
  const format = pickAudioFormat(info);

  if (format?.url) return format.url;

  if (format && typeof (format as any).decipher === "function") {
    try {
      const u = await (format as any).decipher(yt.session.player);
      if (u) return u;
    } catch { /* decipher failed */ }
  }

  // getBasicInfo as fallback for this client
  const basic = await yt.getBasicInfo(id, { client });
  const basicFormat = pickAudioFormat(basic);

  if (basicFormat?.url) return basicFormat.url;

  if (basicFormat && typeof (basicFormat as any).decipher === "function") {
    try {
      const u = await (basicFormat as any).decipher(yt.session.player);
      if (u) return u;
    } catch { /* decipher failed */ }
  }

  throw new Error(`${client}: no audio format`);
}

export async function getAudioUrl(videoId: string): Promise<string | null> {
  const id = videoId.trim();
  if (!/^[\w-]{11}$/.test(id)) return null;

  // 1. Race all Innertube clients IN PARALLEL — first one to find a URL wins
  try {
    const yt = await getTube();
    const clients = ["WEB", "YTMUSIC", "ANDROID_VR", "MWEB", "IOS"] as const;

    const url = await Promise.any(
      clients.map((client) =>
        Promise.race([
          tryClient(yt, id, client),
          // Per-client timeout of 6s — don't let one slow client block others
          new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error(`${client}: timeout`)), 6000),
          ),
        ]),
      ),
    );

    if (url) return url;
  } catch (err: any) {
    console.warn("[getAudioUrl] all clients failed:", err?.errors?.map?.((e: any) => e?.message) || err?.message || err);
    // Reset Innertube instance for next call
    tubePromise = null;
  }

  // 2. Fallback: race Piped/Invidious mirrors
  const fallback = await fetchFallbackAudioUrl(id);
  if (fallback) return fallback;

  throw new Error("Audio resolution failed for all clients and fallback mirrors");
}

function txt(value: unknown): string {
  if (value == null) return "";
  if (typeof value === "string") return value.trim();
  if (typeof value === "number") return String(value);
  if (typeof value === "object") {
    const rec = value as { name?: unknown; text?: unknown; toString?: () => string };
    if (typeof rec.name === "string") return rec.name.trim();
    if (typeof rec.text === "string") return rec.text.trim();
    if (typeof rec.toString === "function") {
      const s = rec.toString();
      if (s && s !== "[object Object]") return s.trim();
    }
  }
  return "";
}

function parseClock(raw: string): number {
  const matches = [...raw.matchAll(/(\d+):(\d{2})/g)];
  const last = matches[matches.length - 1];
  if (!last) return 0;
  return parseInt(last[1], 10) * 60 + parseInt(last[2], 10);
}

function durationOf(item: Record<string, unknown>, subtitle: string): number {
  const d = item.duration;
  if (typeof d === "number" && d > 0) return d > 1000 ? Math.round(d / 1000) : d;
  if (d && typeof d === "object") {
    const rec = d as { seconds?: number; duration_seconds?: number };
    const n = Number(rec.seconds ?? rec.duration_seconds ?? 0);
    if (n > 0) return n;
  }
  return parseClock(subtitle);
}

function thumbnailOf(item: Record<string, unknown>, videoId: string): string {
  const thumb = item.thumbnail as { contents?: { url?: string }[] } | undefined;
  const image = (item.content_image as { image?: { url?: string }[] } | undefined)?.image;
  const list = thumb?.contents || image || [];
  for (let i = list.length - 1; i >= 0; i--) {
    const url = list[i]?.url;
    if (url?.startsWith("http")) return url;
  }
  if (videoId) return `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
  return FALLBACK_ART;
}

function artistOf(item: Record<string, unknown>, subtitle: string, title: string): string {
  const authors = item.authors as unknown[] | undefined;
  const artists = item.artists as unknown[] | undefined;
  const fromAuthors = (authors || artists || []).map(txt).filter(Boolean);
  if (fromAuthors.length) return fromAuthors.join(", ");
  const parts = subtitle.split("•").map((s) => s.trim()).filter(Boolean);
  const skip = /video|visualizzaz|views|official|album|playlist|puntata/i;
  const guess = parts.find((p) => !skip.test(p) && !/^\d/.test(p) && p.length < 60);
  if (guess) return guess;
  const dash = title.match(/^(.{2,48}?)\s+[-–—]\s+/);
  if (dash) return dash[1].trim();
  return "Artista";
}

function isVideoId(id: string): boolean {
  return /^[\w-]{11}$/.test(id);
}

function toTrack(item: unknown): Track | null {
  if (!item || typeof item !== "object") return null;
  const rec = item as Record<string, unknown>;
  const itemType = String(rec.item_type || rec.content_type || rec.type || "").toLowerCase();
  if (itemType.includes("artist") || itemType.includes("podcast") || itemType.includes("episode")) return null;

  const tap = rec.on_tap as { payload?: { videoId?: string } } | undefined;
  const overlay = rec.overlay as { content?: { endpoint?: { payload?: { videoId?: string } } } } | undefined;
  const id = String(
    rec.id ||
      rec.content_id ||
      rec.video_id ||
      tap?.payload?.videoId ||
      overlay?.content?.endpoint?.payload?.videoId ||
      "",
  );
  if (!isVideoId(id)) return null;

  const title = txt(rec.title) || txt((rec.metadata as { title?: unknown } | undefined)?.title);
  if (!title) return null;
  if (/puntata|podcast|episode/i.test(title) && !/official|mv|audio|lyrics/i.test(title)) return null;

  const subtitle =
    txt(rec.subtitle) ||
    txt((rec.flex_columns as { title?: unknown }[] | undefined)?.[1]?.title) ||
    "";
  const artist = artistOf(rec, subtitle, title);

  return {
    id: `yt_${id}`,
    videoId: id,
    title,
    artist,
    artwork: thumbnailOf(rec, id),
    duration: durationOf(rec, subtitle),
    streamUrl: "",
    source: "ytmusic",
  };
}

function walkTracks(root: unknown, into: Track[], seen: Set<string>, depth = 0) {
  if (!root || depth > 14 || into.length > 80) return;
  if (Array.isArray(root)) {
    for (const item of root) walkTracks(item, into, seen, depth + 1);
    return;
  }
  if (typeof root !== "object") return;
  const rec = root as Record<string, unknown>;
  const track = toTrack(rec);
  if (track && !seen.has(track.id)) {
    seen.add(track.id);
    into.push(track);
  }
  for (const key of ["contents", "sections", "results", "items", "header"]) {
    if (rec[key]) walkTracks(rec[key], into, seen, depth + 1);
  }
}

function uniqueTracks(list: Track[]): Track[] {
  const seen = new Set<string>();
  const out: Track[] = [];
  for (const t of list) {
    const key = `${t.videoId || t.id}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(t);
  }
  return out;
}

const NOT_MUSIC =
  /puntata|podcast|vangelo|rosario|garlasco|ucraina|true crime|notizie|giornale|intervista politica|serie a\b|formula 1|gp olanda/i;

function isLikelySong(track: Track): boolean {
  const blob = `${track.title} ${track.artist}`;
  if (NOT_MUSIC.test(blob)) return false;
  if (track.title.length > 96) return false;
  if (/\bplaylist\b|top hits \d{4}|trending songs \d{4}|best songs playlist|spotify pop mix/i.test(track.title)) {
    return false;
  }
  return true;
}

export async function searchYtMusic(query: string, limit = 28): Promise<Track[]> {
  const q = query.trim();
  if (!q) return [];
  try {
    const yt = await getTube();
    const tracks: Track[] = [];
    const seen = new Set<string>();

    // 1. Direct YouTube Music official tracks
    try {
      const result = await yt.music.search(q);
      walkTracks(result, tracks, seen);
    } catch {
      /* continue to fallback */
    }

    // 2. Global YouTube search for remixes, live concerts, rare & international tracks
    if (tracks.length < limit) {
      try {
        const fullSearch = await yt.search(q, { type: "video" });
        walkTracks(fullSearch, tracks, seen);
      } catch {
        /* ignore */
      }
    }

    return uniqueTracks(tracks.filter(isLikelySong)).slice(0, limit);
  } catch {
    return [];
  }
}

export async function getExploreTracks(): Promise<{ trending: Track[]; fresh: Track[] }> {
  try {
    const yt = await getTube();
    const explore = await yt.music.getExplore();
    const sections = (explore.sections || []) as {
      header?: { title?: unknown };
      title?: unknown;
      contents?: unknown[];
    }[];
    const trending: Track[] = [];
    const fresh: Track[] = [];
    const seenT = new Set<string>();
    const seenF = new Set<string>();
    for (const section of sections) {
      const title = `${txt(section.header?.title)} ${txt(section.title)}`.toLowerCase();
      if (/puntat|podcast|episodio/.test(title)) continue;
      const isMusic = /video musical|nuovi video|brani|hits|official/.test(title);
      if (!isMusic && title.trim()) continue;
      const bucket = /nuov/.test(title) ? fresh : trending;
      const seen = bucket === fresh ? seenF : seenT;
      walkTracks(section.contents, bucket, seen);
    }
    return {
      trending: uniqueTracks(trending.filter(isLikelySong)).slice(0, 24),
      fresh: uniqueTracks(fresh.filter(isLikelySong)).slice(0, 24),
    };
  } catch {
    return { trending: [], fresh: [] };
  }
}

export async function getPlaylistTracks(playlistId: string, limit = 30): Promise<Track[]> {
  const id = playlistId.replace(/^VL/, "");
  if (!id) return [];
  try {
    const yt = await getTube();
    const playlist = await yt.getPlaylist(id);
    const tracks: Track[] = [];
    const seen = new Set<string>();
    walkTracks(playlist.items || playlist, tracks, seen);
    return uniqueTracks(tracks.filter(isLikelySong)).slice(0, limit);
  } catch {
    return [];
  }
}
