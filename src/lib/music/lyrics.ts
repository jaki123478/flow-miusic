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

async function searchLrclib(query: string): Promise<LyricLine[]> {
  try {
    const url = `https://lrclib.net/api/search?q=${encodeURIComponent(query)}`;
    const res = await fetch(url, {
      headers: { "User-Agent": "FlowMusic/1.0 (https://grok.x.ai)" },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return [];
    const list = (await res.json()) as Array<{ syncedLyrics?: string; plainLyrics?: string }>;
    if (!Array.isArray(list) || !list.length) return [];
    for (const item of list) {
      if (item.syncedLyrics) {
        const lines = parseSynced(item.syncedLyrics);
        if (lines.length) return lines;
      }
    }
    for (const item of list) {
      if (item.plainLyrics) {
        const lines = parsePlain(item.plainLyrics);
        if (lines.length) return lines;
      }
    }
  } catch {
    /* ignore */
  }
  return [];
}

async function lrclib(title: string, artist: string, duration?: number): Promise<LyricLine[]> {
  try {
    const cleanTitle = title.replace(/\(official.*?\)|\[official.*?\]|feat\..*|ft\..*/gi, "").trim();
    const cleanArtist = artist.replace(/feat\..*|ft\..*/gi, "").trim();
    let url = `https://lrclib.net/api/get?track_name=${encodeURIComponent(cleanTitle || title)}&artist_name=${encodeURIComponent(cleanArtist || artist)}`;
    if (duration && duration > 0) {
      url += `&duration=${Math.round(duration)}`;
    }
    const res = await fetch(url, {
      headers: { "User-Agent": "FlowMusic/1.0 (https://grok.x.ai)" },
      signal: AbortSignal.timeout(8000),
    });
    if (res.ok) {
      const data = (await res.json()) as { syncedLyrics?: string; plainLyrics?: string };
      if (data.syncedLyrics) {
        const lines = parseSynced(data.syncedLyrics);
        if (lines.length) return lines;
      }
      if (data.plainLyrics) {
        const lines = parsePlain(data.plainLyrics);
        if (lines.length) return lines;
      }
    }
  } catch {
    /* fallback to search */
  }
  const q = [artist, title].filter(Boolean).join(" ").replace(/\(official.*?\)|\[official.*?\]/gi, "").trim();
  if (q) {
    return searchLrclib(q);
  }
  return [];
}

export const getTrackLyrics = createServerFn({ method: "GET" })
  .validator((d: { videoId?: string; title: string; artist: string; duration?: number }) => d)
  .handler(async ({ data }) => {
    const title = (data.title || "").trim();
    const artist = (data.artist || "").trim();
    if (!title && !artist) return [] as LyricLine[];
    return lrclib(title, artist, data.duration);
  });
