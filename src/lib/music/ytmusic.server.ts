import { Innertube } from "youtubei.js";
import { FALLBACK_ART, type Track } from "./types";

let tubePromise: Promise<Innertube> | null = null;

export async function getTube(): Promise<Innertube> {
  if (!tubePromise) {
    tubePromise = Innertube.create({
      generate_session_locally: true,
      retrieve_player: true,
    }).catch((err) => {
      tubePromise = null;
      throw err;
    });
  }
  return tubePromise;
}

function isHttp(u: unknown): u is string {
  return typeof u === "string" && /^https?:\/\//.test(u);
}

function isAudioFormat(format: any): boolean {
  const mime = String(format?.mime_type || format?.mimeType || "");
  return (
    mime.startsWith("audio/") ||
    !!format?.has_audio ||
    !!format?.audio_quality ||
    !!format?.audioQuality
  );
}

async function urlFromFormat(format: any, yt: Innertube): Promise<string | null> {
  if (!format) return null;
  if (isHttp(format.url)) return format.url;
  const player = (yt as any).session?.player;
  if (typeof format.decipher === "function") {
    try {
      const u = await format.decipher(player);
      if (isHttp(u)) return u;
    } catch {
      /* next */
    }
  }
  const signed = format.signature_cipher || format.signatureCipher;
  if (signed && player && typeof player.decipher === "function") {
    try {
      const u = player.decipher(signed);
      if (isHttp(u)) return u;
    } catch {
      /* next */
    }
  }
  return null;
}

function collectFormats(info: any): any[] {
  const out: any[] = [];
  try {
    const chosen = info?.chooseFormat?.({ type: "audio", quality: "best" });
    if (chosen) out.push(chosen);
  } catch {
    /* ignore */
  }
  const sd = info?.streaming_data || info?.streamingData || info;
  for (const key of ["adaptive_formats", "adaptiveFormats", "formats"]) {
    const list = sd?.[key];
    if (Array.isArray(list)) out.push(...list);
  }
  return out;
}

async function pickAudioFormat(info: any, yt: Innertube): Promise<string | null> {
  const formats = collectFormats(info);
  for (const format of formats) {
    if (!isAudioFormat(format) && format !== formats[0]) continue;
    const url = await urlFromFormat(format, yt);
    if (url) return url;
  }
  for (const format of formats) {
    const url = await urlFromFormat(format, yt);
    if (url) return url;
  }
  return null;
}

function firstHttp(promises: Promise<string | null>[]): Promise<string | null> {
  return new Promise((resolve) => {
    let left = promises.length;
    if (!left) return resolve(null);
    let settled = false;
    for (const p of promises) {
      p.then((url) => {
        if (!settled && url) {
          settled = true;
          resolve(url);
          return;
        }
        if (--left === 0 && !settled) resolve(null);
      }).catch(() => {
        if (--left === 0 && !settled) resolve(null);
      });
    }
  });
}

function withTimeout<T>(p: Promise<T>, ms: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const t = setTimeout(() => reject(new Error("timeout")), ms);
    p.then(
      (v) => {
        clearTimeout(t);
        resolve(v);
      },
      (e) => {
        clearTimeout(t);
        reject(e);
      },
    );
  });
}

async function fromInnertube(yt: Innertube, id: string, client: string): Promise<string | null> {
  try {
    const info = await withTimeout(yt.getBasicInfo(id, { client: client as any }), 6000);
    const url = await pickAudioFormat(info, yt);
    if (url) return url;
  } catch {
    /* next */
  }
  try {
    const info = await withTimeout(
      (yt as any).actions.execute("/player", { videoId: id, client, parse: true }),
      6000,
    );
    const url = await pickAudioFormat(info, yt);
    if (url) return url;
  } catch {
    /* next */
  }
  try {
    const fmt = await withTimeout(
      (yt as any).getStreamingData(id, { type: "audio", quality: "best", client }),
      6000,
    );
    const url = await urlFromFormat(fmt, yt);
    if (url) return url;
  } catch {
    /* next */
  }
  return null;
}

async function rawPlayer(
  id: string,
  clientName: string,
  clientVersion: string,
  extra: Record<string, unknown>,
  ua: string,
): Promise<string | null> {
  try {
    const res = await fetch("https://www.youtube.com/youtubei/v1/player?prettyPrint=false", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": ua,
        Origin: "https://www.youtube.com",
      },
      body: JSON.stringify({
        videoId: id,
        context: { client: { clientName, clientVersion, hl: "en", gl: "US", ...extra } },
        contentCheckOk: true,
        racyCheckOk: true,
      }),
      signal: AbortSignal.timeout(7000),
    });
    if (!res.ok) return null;
    const data = await res.json();
    const formats = [
      ...(data?.streamingData?.adaptiveFormats || []),
      ...(data?.streamingData?.formats || []),
    ];
    for (const format of formats) {
      if (!isAudioFormat(format)) continue;
      if (isHttp(format.url)) return format.url;
    }
    for (const format of formats) {
      if (isHttp(format.url)) return format.url;
    }
    return null;
  } catch {
    return null;
  }
}

async function rawFallbacks(id: string): Promise<string | null> {
  return firstHttp([
    rawPlayer(
      id,
      "ANDROID_VR",
      "1.65.10",
      { deviceMake: "Oculus", deviceModel: "Quest 3", androidSdkVersion: 32 },
      "com.google.android.apps.youtube.vr.oculus/1.65.10 (Linux; U; Android 12L; eureka-user Build/SQ3A.220605.009.A1) gzip",
    ),
    rawPlayer(
      id,
      "IOS",
      "20.11.6",
      { deviceMake: "Apple", deviceModel: "iPhone16,2", osName: "iOS", osVersion: "17.5.1" },
      "com.google.ios.youtube/20.11.6 (iPhone16,2; U; CPU iOS 17_5_1 like Mac OS X)",
    ),
    rawPlayer(
      id,
      "ANDROID",
      "19.50.37",
      { androidSdkVersion: 34, deviceMake: "Google", deviceModel: "Pixel 7" },
      "com.google.android.youtube/19.50.37 (Linux; U; Android 14; en_US; Pixel 7 Build/UP1A) gzip",
    ),
  ]);
}

export async function getAudioUrl(videoId: string): Promise<string | null> {
  const id = videoId.trim();
  if (!/^[\w-]{11}$/.test(id)) return null;

  const raw = rawFallbacks(id);

  try {
    const yt = await withTimeout(getTube(), 8000);
    const clients = ["ANDROID_VR", "IOS", "ANDROID", "WEB_EMBEDDED"] as const;
    const url = await firstHttp([raw, ...clients.map((client) => fromInnertube(yt, id, client))]);
    if (url) return url;
  } catch (err: any) {
    console.error("[getAudioUrl error]", id, err?.message || err);
  }

  return raw;
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

export async function searchYtMusic(query: string, limit = 24): Promise<Track[]> {
  const q = query.trim();
  if (!q) return [];
  try {
    const yt = await getTube();
    const result = await yt.music.search(q);
    const tracks: Track[] = [];
    const seen = new Set<string>();
    walkTracks(result, tracks, seen);
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
