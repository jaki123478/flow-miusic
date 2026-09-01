import { createServerFn } from "@tanstack/react-start";

export interface LyricLine {
  timeMs: number;
  text: string;
}

export type LyricsSource = "lrclib" | "kugou" | "";

export type LyricsPayload = {
  videoId: string;
  lines: LyricLine[];
  synced: boolean;
  source: LyricsSource;
};

const EMPTY: LyricsPayload = { videoId: "", lines: [], synced: false, source: "" };

const cache = new Map<string, LyricsPayload>();
const MAX_CACHE = 64;

function cacheGet(key: string): LyricsPayload | undefined {
  return cache.get(key);
}

function cacheSet(key: string, value: LyricsPayload) {
  if (!key) return;
  if (cache.has(key)) cache.delete(key);
  cache.set(key, value);
  while (cache.size > MAX_CACHE) {
    const oldest = cache.keys().next().value;
    if (!oldest) break;
    cache.delete(oldest);
  }
}

function parseSynced(raw: string): LyricLine[] {
  const lines: LyricLine[] = [];
  for (const line of raw.split("\n")) {
    const match = line.match(/\[(\d+):(\d+(?:\.\d+)?)\](.*)/);
    if (!match) continue;
    const text = match[3].trim();
    if (!text) continue;
    lines.push({
      timeMs: (parseInt(match[1], 10) * 60 + parseFloat(match[2])) * 1000,
      text,
    });
  }
  return lines;
}

function parsePlain(raw: string): LyricLine[] {
  return raw
    .split("\n")
    .map((text, i) => ({ timeMs: i * 4000, text: text.trim() }))
    .filter((l) => l.text && l.text !== "♪");
}

function fromRaw(raw: string | undefined | null, source: LyricsSource, videoId: string): LyricsPayload | null {
  if (!raw) return null;
  const synced = parseSynced(raw);
  if (synced.length) return { videoId, lines: synced, synced: true, source };
  const plain = parsePlain(raw);
  if (plain.length) return { videoId, lines: plain, synced: false, source };
  return null;
}

async function lrclib(
  title: string,
  artist: string,
  album: string | undefined,
  duration: number | undefined,
  videoId: string,
): Promise<LyricsPayload | null> {
  const cleanTitle = title.replace(/\(official.*?\)|\[official.*?\]|feat\..*|ft\..*/gi, "").trim();
  const cleanArtist = (artist || "").replace(/feat\..*|ft\..*/gi, "").trim();
  const params = new URLSearchParams({ track_name: cleanTitle || title, artist_name: cleanArtist || artist });
  if (album) params.set("album_name", album);
  if (duration && duration > 20) params.set("duration", String(Math.round(duration)));

  try {
    const res = await fetch(`https://lrclib.net/api/get?${params}`, {
      headers: { "User-Agent": "FlowMusic/1.0 (https://grok.x.ai)", Accept: "application/json" },
      signal: AbortSignal.timeout(8000),
    });
    if (res.ok) {
      const data = (await res.json()) as { syncedLyrics?: string; plainLyrics?: string };
      const hit = fromRaw(data.syncedLyrics, "lrclib", videoId) || fromRaw(data.plainLyrics, "lrclib", videoId);
      if (hit) return hit;
    }
  } catch {
    /* search fallback */
  }

  try {
    const q = new URLSearchParams({ track_name: cleanTitle || title });
    if (cleanArtist || artist) q.set("artist_name", cleanArtist || artist);
    const res = await fetch(`https://lrclib.net/api/search?${q}`, {
      headers: { "User-Agent": "FlowMusic/1.0 (https://grok.x.ai)", Accept: "application/json" },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return null;
    const list = (await res.json()) as { syncedLyrics?: string; plainLyrics?: string }[];
    if (!Array.isArray(list)) return null;
    for (const data of list.slice(0, 5)) {
      const hit = fromRaw(data.syncedLyrics, "lrclib", videoId) || fromRaw(data.plainLyrics, "lrclib", videoId);
      if (hit) return hit;
    }
  } catch {
    /* ignore */
  }
  return null;
}

async function kugou(
  title: string,
  artist: string,
  duration: number | undefined,
  videoId: string,
): Promise<LyricsPayload | null> {
  const keyword = [title, artist].filter(Boolean).join(" ").trim();
  if (!keyword) return null;
  try {
    const durMs = duration && duration > 20 ? Math.round(duration * 1000) : 0;
    const search = new URLSearchParams({
      ver: "1",
      man: "yes",
      client: "pc",
      keyword,
      hash: "",
    });
    if (durMs) search.set("duration", String(durMs));
    const res = await fetch(`https://lyrics.kugou.com/search?${search}`, {
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return null;
    const body = (await res.json()) as {
      candidates?: { id: number | string; accesskey: string }[];
    };
    const cand = body.candidates?.[0];
    if (!cand?.id || !cand.accesskey) return null;
    const dl = await fetch(
      `https://lyrics.kugou.com/download?ver=1&client=pc&id=${encodeURIComponent(String(cand.id))}&accesskey=${encodeURIComponent(cand.accesskey)}&fmt=lrc&charset=utf8`,
      { headers: { Accept: "application/json" }, signal: AbortSignal.timeout(8000) },
    );
    if (!dl.ok) return null;
    const data = (await dl.json()) as { content?: string };
    if (!data.content) return null;
    const raw = Buffer.from(data.content, "base64").toString("utf8");
    return fromRaw(raw, "kugou", videoId);
  } catch {
    return null;
  }
}

export const getTrackLyrics = createServerFn({ method: "GET" })
  .validator((d: { videoId?: string; title: string; artist: string; album?: string; duration?: number }) => d)
  .handler(async ({ data }) => {
    const videoId = (data.videoId || "").trim();
    const title = (data.title || "").trim();
    const artist = (data.artist || "").trim();
    const album = (data.album || "").trim() || undefined;
    const duration = typeof data.duration === "number" && data.duration > 0 ? data.duration : undefined;
    const cacheKey = videoId || `${title}|${artist}`.toLowerCase();

    try {
      const cached = cacheGet(cacheKey);
      if (cached) return cached;

      if (title) {
        const fromLrc = await lrclib(title, artist, album, duration, videoId).catch(() => null);
        if (fromLrc?.lines.length) {
          cacheSet(cacheKey, fromLrc);
          return fromLrc;
        }
      }

      if (title) {
        const fromKugou = await kugou(title, artist, duration, videoId).catch(() => null);
        if (fromKugou?.lines.length) {
          cacheSet(cacheKey, fromKugou);
          return fromKugou;
        }
      }

      cacheSet(cacheKey, { ...EMPTY, videoId });
      return { ...EMPTY, videoId };
    } catch {
      return { ...EMPTY, videoId };
    }
  });

export const getTranslatedLyrics = createServerFn({ method: "POST" })
  .validator((d: { lines: string[]; targetLang?: string }) => d)
  .handler(async ({ data }) => {
    try {
      const target = data.targetLang || "it";
      const text = (data.lines || []).join("\n");
      if (!text.trim()) return [];

      const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${target}&dt=t&q=${encodeURIComponent(text)}`;
      const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
      if (res.ok) {
        const json = (await res.json()) as unknown[];
        if (Array.isArray(json) && Array.isArray(json[0])) {
          const translatedFull = (json[0] as unknown[][])
            .map((chunk) => (typeof chunk[0] === "string" ? chunk[0] : ""))
            .join("");
          return translatedFull.split("\n");
        }
      }
    } catch {
      /* ignore */
    }
    return [];
  });
