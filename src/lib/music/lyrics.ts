import { createServerFn } from "@tanstack/react-start";

export interface LyricLine {
  timeMs: number;
  text: string;
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

type SimpEntry = {
  videoId?: string;
  songTitle?: string;
  artistName?: string;
  plainLyric?: string;
  syncedLyrics?: string;
  syncedLyric?: string;
};

async function simpGet(path: string): Promise<SimpEntry | null> {
  try {
    const res = await fetch(`https://api-lyrics.simpmusic.org/v1${path}`, {
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return null;
    const body = (await res.json()) as { data?: SimpEntry | SimpEntry[]; success?: boolean };
    const data = Array.isArray(body.data) ? body.data[0] : body.data;
    return data || null;
  } catch {
    return null;
  }
}

function linesFromSimp(entry: SimpEntry | null): LyricLine[] {
  if (!entry) return [];
  const synced = entry.syncedLyrics || entry.syncedLyric;
  if (synced) {
    const lines = parseSynced(synced);
    if (lines.length) return lines;
  }
  if (entry.plainLyric) return parsePlain(entry.plainLyric);
  return [];
}

async function lrclib(title: string, artist: string): Promise<LyricLine[]> {
  try {
    const url = `https://lrclib.net/api/get?track_name=${encodeURIComponent(title)}&artist_name=${encodeURIComponent(artist || "")}`;
    const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
    if (!res.ok) return [];
    const data = (await res.json()) as { syncedLyrics?: string; plainLyrics?: string };
    if (data.syncedLyrics) {
      const lines = parseSynced(data.syncedLyrics);
      if (lines.length) return lines;
    }
    if (data.plainLyrics) return parsePlain(data.plainLyrics);
  } catch {
    /* ignore */
  }
  return [];
}

export const getTrackLyrics = createServerFn({ method: "GET" })
  .validator((d: { videoId?: string; title: string; artist: string }) => d)
  .handler(async ({ data }) => {
    const videoId = (data.videoId || "").trim();
    const title = (data.title || "").trim();
    const artist = (data.artist || "").trim();

    if (videoId) {
      const byId = linesFromSimp(await simpGet(`/${encodeURIComponent(videoId)}`));
      if (byId.length) return byId;
    }

    const q = [title, artist].filter(Boolean).join(" ");
    if (q) {
      const hit = await simpGet(`/search?q=${encodeURIComponent(q)}&limit=1`);
      if (hit?.videoId) {
        const full = linesFromSimp(await simpGet(`/${encodeURIComponent(hit.videoId)}`));
        if (full.length) return full;
      }
      const fromHit = linesFromSimp(hit);
      if (fromHit.length) return fromHit;
    }

    if (title) return lrclib(title, artist);
    return [] as LyricLine[];
  });
