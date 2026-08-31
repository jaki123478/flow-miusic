import { Innertube } from "youtubei.js";
import { FALLBACK_ART, type Track } from "./types";

let tubePromise: Promise<Innertube> | null = null;

export async function getTube(): Promise<Innertube> {
  if (!tubePromise) {
    tubePromise = Innertube.create({
      retrieve_player: false,
      generate_session_locally: true,
      lang: "it",
      location: "IT",
    }).catch((err) => {
      tubePromise = null;
      throw err;
    });
  }
  return tubePromise;
}

export async function getAudioUrl(videoId: string): Promise<string | null> {
  const id = videoId.trim();
  if (!/^[\w-]{11}$/.test(id)) return null;

  // 1. Innertube direct resolution
  try {
    const yt = await getTube();
    const clients = ["IOS", "ANDROID", "YTMUSIC", "WEB_REMIX"] as const;
    for (const client of clients) {
      try {
        const info = await yt.getBasicInfo(id, { client });
        const format = info.chooseFormat({ type: "audio", quality: "bestefficiency" });
        const url = format.url || (await format.decipher(yt.session.player).catch(() => ""));
        if (url) return url;
      } catch {
        /* next client */
      }
    }
  } catch {
    /* fallback */
  }

  // 2. Multi-instance fallback
  const fallbackUrls = [
    `https://pipedapi.kavin.rocks/streams/${id}`,
    `https://api.piped.private.coffee/streams/${id}`,
    `https://inv.nadeko.net/api/v1/videos/${id}`,
  ];
  for (const ep of fallbackUrls) {
    try {
      const res = await fetch(ep, { headers: { Accept: "application/json" }, signal: AbortSignal.timeout(3500) });
      if (!res.ok) continue;
      const data = (await res.json()) as { audioStreams?: { url?: string }[]; adaptiveFormats?: { url?: string; type?: string; mimeType?: string }[] };
      const streams = data.audioStreams || (data.adaptiveFormats || []).filter((f) => (f.type || f.mimeType || "").startsWith("audio"));
      if (streams && streams.length && streams[0]?.url) {
        return streams[0].url;
      }
    } catch {
      /* continue */
    }
  }

  return null;
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
  const yt = await getTube();
  const result = await yt.music.search(q);
  const tracks: Track[] = [];
  const seen = new Set<string>();
  walkTracks(result, tracks, seen);
  return uniqueTracks(tracks.filter(isLikelySong)).slice(0, limit);
}

export async function getExploreTracks(): Promise<{ trending: Track[]; fresh: Track[] }> {
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
}

export async function getPlaylistTracks(playlistId: string, limit = 30): Promise<Track[]> {
  const id = playlistId.replace(/^VL/, "");
  if (!id) return [];
  const yt = await getTube();
  const playlist = await yt.getPlaylist(id);
  const tracks: Track[] = [];
  const seen = new Set<string>();
  walkTracks(playlist.items || playlist, tracks, seen);
  return uniqueTracks(tracks.filter(isLikelySong)).slice(0, limit);
}
