import type { Track } from "./types";

export type ImportSeed = {
  title: string;
  artist: string;
  videoId?: string;
  duration?: number;
  album?: string;
};

function csvEscape(value: string): string {
  if (/[",\n\r]/.test(value)) return `"${value.replace(/"/g, '""')}"`;
  return value;
}

export function tracksToCsv(tracks: Track[]): string {
  const header = "title,artist,album,duration,videoId,url";
  const rows = tracks.map((t) =>
    [
      csvEscape(t.title),
      csvEscape(t.artist),
      csvEscape(t.album || ""),
      String(Math.round(t.duration || 0)),
      t.videoId || "",
      t.videoId ? `https://www.youtube.com/watch?v=${t.videoId}` : t.streamUrl || "",
    ].join(","),
  );
  return [header, ...rows].join("\n");
}

export function tracksToM3u(tracks: Track[], title?: string): string {
  const lines = ["#EXTM3U"];
  if (title) lines.push(`#PLAYLIST:${title}`);
  for (const t of tracks) {
    lines.push(`#EXTINF:${Math.round(t.duration || 0)},${t.artist} - ${t.title}`);
    lines.push(t.videoId ? `https://www.youtube.com/watch?v=${t.videoId}` : t.streamUrl || "");
  }
  return lines.join("\n");
}

export function downloadText(name: string, body: string, mime = "text/plain;charset=utf-8") {
  const a = document.createElement("a");
  const url = URL.createObjectURL(new Blob([body], { type: mime }));
  a.href = url;
  a.download = name;
  a.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 2000);
}

export function slugFile(name: string): string {
  return name.replace(/[^\w\u00C0-\u024f.-]+/g, "_").replace(/^_+|_+$/g, "").slice(0, 80) || "playlist";
}

export function videoIdFromUrl(raw: string): string | undefined {
  const text = raw.trim();
  const match =
    text.match(/(?:youtu\.be\/|v=|\/shorts\/|\/embed\/|\/offline-audio\/)([A-Za-z0-9_-]{11})/) ||
    text.match(/^([A-Za-z0-9_-]{11})$/);
  return match?.[1];
}

function splitCsvLine(line: string): string[] {
  const out: string[] = [];
  let cur = "";
  let q = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (q) {
      if (ch === '"' && line[i + 1] === '"') {
        cur += '"';
        i += 1;
      } else if (ch === '"') q = false;
      else cur += ch;
    } else if (ch === '"') q = true;
    else if (ch === ",") {
      out.push(cur);
      cur = "";
    } else cur += ch;
  }
  out.push(cur);
  return out.map((s) => s.trim());
}

function looksLikeCsv(raw: string): boolean {
  const first = raw.split(/\r?\n/).find((l) => l.trim()) || "";
  return /title\s*,\s*artist/i.test(first) || (first.includes(",") && first.split(",").length >= 2);
}

function parseArtistTitle(rest: string): { artist: string; title: string } {
  const dash = rest.match(/^(.{1,80}?)\s+[-–—]\s+(.+)$/);
  if (dash) return { artist: dash[1].trim(), title: dash[2].trim() };
  return { artist: "", title: rest.trim() };
}

function parseM3u(raw: string): { title: string; seeds: ImportSeed[] } {
  const title = raw.match(/#PLAYLIST:(.+)/i)?.[1]?.trim() || "Playlist importata";
  const seeds: ImportSeed[] = [];
  const lines = raw.split(/\r?\n/);
  let pending: ImportSeed | null = null;
  for (const line of lines) {
    const t = line.trim();
    if (!t || /^#EXTM3U/i.test(t) || /^#PLAYLIST/i.test(t)) continue;
    const inf = t.match(/#EXTINF:(-?\d+)\s*,\s*(.*)/i);
    if (inf) {
      const parsed = parseArtistTitle(inf[2]);
      pending = {
        duration: Number(inf[1]) > 0 ? Number(inf[1]) : undefined,
        artist: parsed.artist,
        title: parsed.title,
      };
      continue;
    }
    if (t.startsWith("#")) continue;
    const videoId = videoIdFromUrl(t);
    if (pending) {
      seeds.push({ ...pending, videoId });
      pending = null;
    } else {
      seeds.push({ title: t, artist: "", videoId });
    }
  }
  return { title, seeds: seeds.slice(0, 200) };
}

function parseCsv(raw: string): { title: string; seeds: ImportSeed[] } {
  const rows = raw.split(/\r?\n/).map((l) => l.trim()).filter((l) => l && !l.startsWith("#"));
  if (!rows.length) return { title: "Playlist importata", seeds: [] };
  const header = splitCsvLine(rows[0]).map((h) => h.toLowerCase());
  const hasHeader = header.includes("title") || header.includes("titolo") || header.includes("artist") || header.includes("artista");
  const idx = (names: string[]) => header.findIndex((h) => names.includes(h));
  const iTitle = hasHeader ? idx(["title", "titolo", "name", "track"]) : 0;
  const iArtist = hasHeader ? idx(["artist", "artista", "artists"]) : 1;
  const iAlbum = hasHeader ? idx(["album"]) : -1;
  const iDur = hasHeader ? idx(["duration", "durata", "length"]) : -1;
  const iVid = hasHeader ? idx(["videoid", "video_id", "id"]) : -1;
  const iUrl = hasHeader ? idx(["url", "link", "uri"]) : -1;
  const start = hasHeader ? 1 : 0;
  const seeds: ImportSeed[] = [];
  for (const row of rows.slice(start)) {
    const cols = splitCsvLine(row);
    if (!cols.length) continue;
    const url = iUrl >= 0 ? cols[iUrl] || "" : cols.find((c) => /youtu|http/i.test(c)) || "";
    const videoId = (iVid >= 0 ? cols[iVid] : "") || videoIdFromUrl(url);
    let title = iTitle >= 0 ? cols[iTitle] || "" : "";
    let artist = iArtist >= 0 ? cols[iArtist] || "" : "";
    if (!title && cols[0]) {
      const parsed = parseArtistTitle(cols[0]);
      artist = artist || parsed.artist;
      title = parsed.title;
    }
    if (!title) continue;
    const durationRaw = iDur >= 0 ? cols[iDur] : "";
    const duration = durationRaw ? Number(durationRaw) : undefined;
    seeds.push({
      title,
      artist,
      videoId,
      duration: duration && Number.isFinite(duration) ? duration : undefined,
      album: iAlbum >= 0 ? cols[iAlbum] : undefined,
    });
  }
  return { title: "Playlist importata", seeds: seeds.slice(0, 200) };
}

function parseLines(raw: string): { title: string; seeds: ImportSeed[] } {
  const seeds = raw
    .split(/\r?\n/)
    .map((line) => line.replace(/^\d+[\).\s-]+/, "").trim())
    .filter((line) => line.length > 1 && !line.startsWith("#"))
    .map((line) => {
      const videoId = videoIdFromUrl(line);
      if (videoId) return { title: videoId, artist: "", videoId };
      const parsed = parseArtistTitle(line);
      return { title: parsed.title, artist: parsed.artist };
    })
    .slice(0, 200);
  return { title: "Lista importata", seeds };
}

export function parsePlaylistFile(raw: string, filename = ""): { title: string; seeds: ImportSeed[] } {
  const lower = filename.toLowerCase();
  if (lower.endsWith(".csv") || looksLikeCsv(raw)) return parseCsv(raw);
  if (/#EXTM3U/i.test(raw) || lower.endsWith(".m3u") || lower.endsWith(".m3u8")) return parseM3u(raw);
  return parseLines(raw);
}

export function seedsToTracks(seeds: ImportSeed[]): { tracks: Track[]; unresolved: ImportSeed[] } {
  const tracks: Track[] = [];
  const unresolved: ImportSeed[] = [];
  const seen = new Set<string>();
  for (const s of seeds) {
    if (s.videoId && /^[\w-]{11}$/.test(s.videoId)) {
      if (seen.has(s.videoId)) continue;
      seen.add(s.videoId);
      tracks.push({
        id: s.videoId,
        title: s.title || s.videoId,
        artist: s.artist || "Artista",
        album: s.album,
        artwork: `https://i.ytimg.com/vi/${s.videoId}/hqdefault.jpg`,
        duration: s.duration || 0,
        streamUrl: `/api/stream?v=${s.videoId}`,
        source: "ytmusic",
        videoId: s.videoId,
      });
    } else if (s.title) unresolved.push(s);
  }
  return { tracks, unresolved };
}

export function unresolvedToText(seeds: ImportSeed[]): string {
  return seeds
    .map((s) => (s.artist ? `${s.artist} - ${s.title}` : s.title))
    .filter(Boolean)
    .join("\n");
}
