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

const IOS_UA =
  "com.google.ios.youtube/20.11.6 (iPhone16,2; U; CPU iOS 17_5_1 like Mac OS X)";
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
export let lastResolveDetail = "";

function audioUrlFromPlayerData(data: any, notes: string[], tag: string): string | null {
  const status = data?.playabilityStatus?.status || data?.playability_status?.status || "?";
  const reason = data?.playabilityStatus?.reason || data?.playability_status?.reason || "";
  const formats = [
    ...(data?.streamingData?.adaptiveFormats || []),
    ...(data?.streamingData?.formats || []),
    ...(data?.streaming_data?.adaptive_formats || []),
    ...(data?.streaming_data?.formats || []),
  ];
  const audio = formats.filter((f: any) => isAudioFormat(f) && isHttp(f.url));
  notes.push(`${tag}:${status}${reason ? "(" + String(reason).slice(0, 40) + ")" : ""} fmt=${formats.length} audio=${audio.length}`);
  if (audio[0]) return audio[0].url;
  const any = formats.find((f: any) => isHttp(f.url));
  return any?.url || null;
}

async function iosPlayer(id: string, yt: Innertube | null, notes: string[]): Promise<string | null> {
  const visitor = (yt as any)?.session?.context?.client?.visitorData;
  const body = {
    videoId: id,
    context: {
      client: {
        ...IOS_CLIENT,
        ...(visitor ? { visitorData: visitor } : {}),
      },
    },
    contentCheckOk: true,
    racyCheckOk: true,
  };
  const endpoint = "https://youtubei.googleapis.com/youtubei/v1/player?prettyPrint=false";
  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": IOS_UA,
        "X-YouTube-Client-Name": "5",
        "X-YouTube-Client-Version": IOS_CLIENT.clientVersion,
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) {
      notes.push(`ios-gapi:http ${res.status}`);
      return null;
    }
    const data = await res.json();
    return audioUrlFromPlayerData(data, notes, "ios-gapi");
  } catch (err: any) {
    notes.push(`ios-gapi:${err?.message || "fail"}`);
    return null;
  }
}

export async function getAudioUrl(videoId: string): Promise<string | null> {
  const id = videoId.trim();
  if (!/^[\w-]{11}$/.test(id)) return null;
  const notes: string[] = [];
  lastResolveDetail = "";

  let yt: Innertube | null = null;
  try {
    yt = await withTimeout(getTube(), 8000);
  } catch (err: any) {
    notes.push(`tube:${err?.message || err}`);
  }

  try {
    const url = await iosPlayer(id, yt, notes);
    if (url) {
      lastResolveDetail = notes.join(" | ");
      return url;
    }
  } catch (err: any) {
    notes.push(`ios:${err?.message || err}`);
  }

  if (yt) {
    for (const client of ["IOS", "ANDROID_VR", "ANDROID"] as const) {
      try {
        const url = await fromInnertube(yt, id, client);
        if (url) {
          notes.push(`${client}:ok`);
          lastResolveDetail = notes.join(" | ");
          return url;
        }
        notes.push(`${client}:empty`);
      } catch (err: any) {
        notes.push(`${client}:${err?.message || err}`);
      }
    }
  }

  lastResolveDetail = notes.join(" | ") || "no url";
  console.error("[getAudioUrl miss]", id, lastResolveDetail);
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

function asSeconds(n: number): number {
  if (!Number.isFinite(n) || n <= 0) return 0;
  return n > 10000 ? Math.round(n / 1000) : Math.round(n);
}
function durationOf(item: Record<string, unknown>, subtitle: string): number {
  for (const key of ["duration_seconds", "length_seconds", "lengthSeconds", "durationSeconds"]) {
    const n = asSeconds(Number(item[key]));
    if (n > 0) return n;
  }
  const d = item.duration;
  if (typeof d === "number" && d > 0) return asSeconds(d);
  if (d && typeof d === "object") {
    const rec = d as { seconds?: number; duration_seconds?: number; text?: unknown };
    const n = asSeconds(Number(rec.seconds ?? rec.duration_seconds ?? 0));
    if (n > 0) return n;
    const clock = parseClock(txt(rec.text));
    if (clock > 0) return clock;
  }
  const extra = [
    subtitle,
    txt(item.length_text),
    txt(item.duration_text),
    txt(item.lengthText),
    txt((item.flex_columns as { title?: unknown }[] | undefined)?.[1]?.title),
    txt((item.flex_columns as { title?: unknown }[] | undefined)?.[2]?.title),
  ].join(" ");
  return parseClock(extra);
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
  if (!root || depth > 16 || into.length > 250) return;
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
  if (track.duration > 0 && track.duration < 25) return false;
  if (track.duration > 20 * 60) return false;
  return true;
}

export async function searchYtMusic(query: string, limit = 24): Promise<Track[]> {
  const q = query.trim();
  if (!q) return [];
  try {
    const yt = await getTube();
    const tracks: Track[] = [];
    const seen = new Set<string>();
    try {
      const songs = await yt.music.search(q, { type: "song" });
      walkTracks(songs, tracks, seen);
    } catch {
      /* mixed search below */
    }
    if (tracks.length < limit) {
      const mixed = await yt.music.search(q);
      walkTracks(mixed, tracks, seen);
    }
    return uniqueTracks(tracks.filter(isLikelySong)).slice(0, limit);
  } catch {
    return [];
  }
}

export async function getYtMusicHome(limit = 48): Promise<Track[]> {
  try {
    const yt = await getTube();
    const home = await yt.music.getHomeFeed();
    const tracks: Track[] = [];
    const seen = new Set<string>();
    walkTracks(home.sections || home, tracks, seen);
    try {
      if (home.has_continuation && tracks.length < limit) {
        const more = await home.getContinuation();
        walkTracks(more.sections || more, tracks, seen);
      }
    } catch {
      /* one page is enough */
    }
    return uniqueTracks(tracks.filter(isLikelySong)).slice(0, limit);
  } catch {
    return [];
  }
}

function walkNamedIds(root: unknown, into: string[], kind: "artist" | "album", depth = 0) {
  if (!root || depth > 14 || into.length > 24) return;
  if (Array.isArray(root)) {
    for (const item of root) walkNamedIds(item, into, kind, depth + 1);
    return;
  }
  if (typeof root !== "object") return;
  const rec = root as Record<string, unknown>;
  const itemType = String(rec.item_type || rec.content_type || rec.type || "").toLowerCase();
  const id = String(rec.id || rec.browse_id || rec.browseId || rec.channel_id || rec.channelId || "");
  if (kind === "artist") {
    if (/^UC[\w-]{20,}$/.test(id) && (itemType.includes("artist") || !itemType) && !into.includes(id)) into.push(id);
  } else if (/^MPRE/.test(id) && (itemType.includes("album") || !itemType) && !into.includes(id)) {
    into.push(id);
  }
  for (const key of ["contents", "sections", "results", "items"]) {
    if (rec[key]) walkNamedIds(rec[key], into, kind, depth + 1);
  }
}

function normalizeArtist(s: string): string {
  return s.toLowerCase().replace(/\b(feat\.?|ft\.?|vs\.?)\b|&|,|-/g, " ").replace(/\s+/g, " ").trim();
}

export function artistClose(trackArtist: string, followed: string): boolean {
  const a = normalizeArtist(trackArtist);
  const b = normalizeArtist(followed);
  if (!a || !b) return false;
  if (a === b) return true;
  if (a.includes(b) || b.includes(a)) return true;
  return false;
}

export async function getArtistLatestSongs(name: string, limit = 8): Promise<Track[]> {
  const q = name.trim();
  if (!q) return [];
  try {
    const yt = await getTube();
    const tracks: Track[] = [];
    const seen = new Set<string>();
    try {
      const artists = await yt.music.search(q, { type: "artist" });
      const ids: string[] = [];
      walkNamedIds(artists, ids, "artist");
      const artistId = ids[0];
      if (artistId) {
        const page = await yt.music.getArtist(artistId);
        walkTracks(page.sections || page, tracks, seen);
        const albumIds: string[] = [];
        walkNamedIds(page.sections || page, albumIds, "album");
        for (const albumId of albumIds.slice(0, 2)) {
          try {
            const album = await yt.music.getAlbum(albumId);
            walkTracks((album as { contents?: unknown }).contents || album, tracks, seen);
          } catch {
            /* skip album */
          }
        }
      }
    } catch {
      /* search fallback below */
    }
    if (tracks.length < limit) {
      const year = new Date().getFullYear();
      for (const query of [`${q} ${year}`, `${q} ${year - 1}`]) {
        try {
          const songs = await yt.music.search(query, { type: "song" });
          walkTracks(songs, tracks, seen);
        } catch {
          /* next */
        }
        if (tracks.length >= limit * 2) break;
      }
    }
    return uniqueTracks(tracks.filter(isLikelySong).filter((t) => artistClose(t.artist, q))).slice(0, limit);
  } catch {
    return [];
  }
}

function walkArtistCards(root: unknown, into: { name: string; artwork: string }[], skip: string, depth = 0) {
  if (!root || depth > 14 || into.length > 16) return;
  if (Array.isArray(root)) {
    for (const item of root) walkArtistCards(item, into, skip, depth + 1);
    return;
  }
  if (typeof root !== "object") return;
  const rec = root as Record<string, unknown>;
  const itemType = String(rec.item_type || rec.content_type || rec.type || "").toLowerCase();
  const name = txt(rec.title) || txt(rec.name);
  const id = String(rec.id || rec.channel_id || rec.channelId || "");
  if (name && (itemType.includes("artist") || /^UC[\w-]{20,}$/.test(id))) {
    if (!artistClose(name, skip) && !into.some((a) => artistClose(a.name, name))) {
      into.push({ name, artwork: thumbnailOf(rec, "") });
    }
  }
  for (const key of ["contents", "sections", "results", "items"]) {
    if (rec[key]) walkArtistCards(rec[key], into, skip, depth + 1);
  }
}

export type ArtistAlbum = {
  id: string;
  title: string;
  year: string;
  artwork: string;
  tracks: Track[];
};

export type SimilarArtist = { name: string; artwork: string };

export type ArtistPageData = {
  name: string;
  artwork: string;
  songs: Track[];
  albums: ArtistAlbum[];
  similar: SimilarArtist[];
};

export async function getArtistPage(name: string): Promise<ArtistPageData> {
  const q = decodeURIComponent(name).trim();
  const empty: ArtistPageData = { name: q || "Artista", artwork: FALLBACK_ART, songs: [], albums: [], similar: [] };
  if (!q) return empty;
  try {
    const yt = await getTube();
    const songs: Track[] = [];
    const seen = new Set<string>();
    const albums: ArtistAlbum[] = [];
    const similar: SimilarArtist[] = [];
    let artwork = FALLBACK_ART;
    let display = q;
    const found = await yt.music.search(q, { type: "artist" });
    const ids: string[] = [];
    walkNamedIds(found, ids, "artist");
    const artistId = ids[0];
    if (artistId) {
      const page = await yt.music.getArtist(artistId);
      const header = page.header as Record<string, unknown> | undefined;
      if (header) {
        display = txt(header.title) || txt((header as { name?: unknown }).name) || q;
        artwork = thumbnailOf(header, "") || artwork;
      }
      try {
        const all = await page.getAllSongs();
        if (all) walkTracks(all, songs, seen);
      } catch {
        /* sections below */
      }
      walkTracks(page.sections || page, songs, seen);
      const albumIds: string[] = [];
      walkNamedIds(page.sections || page, albumIds, "album");
      for (const albumId of albumIds.slice(0, 4)) {
        try {
          const album = await yt.music.getAlbum(albumId);
          const tracks: Track[] = [];
          const seenA = new Set<string>();
          walkTracks((album as { contents?: unknown }).contents || album, tracks, seenA);
          const list = uniqueTracks(tracks.filter(isLikelySong));
          const ah = (album as { header?: Record<string, unknown> }).header;
          const title = (ah && (txt(ah.title) || txt(ah.subtitle))) || list[0]?.album || "Album";
          const year = (ah && (txt(ah.subtitle) || String(ah.year || ""))) || "";
          albums.push({
            id: albumId,
            title,
            year: /\d{4}/.test(year) ? (year.match(/\d{4}/) || [""])[0] : "",
            artwork: list[0]?.artwork || artwork,
            tracks: list,
          });
        } catch {
          /* skip album */
        }
      }
      walkArtistCards(page.sections || page, similar, display);
    }
    if (songs.length < 8) {
      const extra = await searchYtMusic(q, 16).catch(() => [] as Track[]);
      for (const t of extra) {
        if (!seen.has(t.id)) {
          seen.add(t.id);
          songs.push(t);
        }
      }
    }
    const top = uniqueTracks(songs.filter(isLikelySong).filter((t) => artistClose(t.artist, q) || artistClose(t.artist, display))).slice(0, 20);
    return {
      name: display || q,
      artwork: top[0]?.artwork || artwork,
      songs: top.length ? top : uniqueTracks(songs.filter(isLikelySong)).slice(0, 20),
      albums,
      similar: similar.slice(0, 8),
    };
  } catch {
    const songs = await searchYtMusic(q, 16).catch(() => [] as Track[]);
    return { ...empty, songs };
  }
}

export async function getRelatedSongs(videoId: string, limit = 24): Promise<Track[]> {
  const id = String(videoId || "").trim();
  if (!isVideoId(id)) return [];
  try {
    const yt = await getTube();
    const tracks: Track[] = [];
    const seen = new Set<string>();
    try {
      const upNext = await yt.music.getUpNext(id, true);
      walkTracks(upNext, tracks, seen);
    } catch {
      /* related shelf below */
    }
    try {
      const related = await yt.music.getRelated(id);
      walkTracks(related, tracks, seen);
    } catch {
      /* ignore */
    }
    return uniqueTracks(tracks.filter(isLikelySong).filter((t) => t.videoId !== id)).slice(0, limit);
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
      if (/film|movie trailer|comedy|gaming/.test(title)) continue;
      const bucket = /nuov|fresh|release|album/.test(title) ? fresh : trending;
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
    const playlist = await (yt.music.getPlaylist(id).catch(() => yt.getPlaylist(id)));
    const tracks: Track[] = [];
    const seen = new Set<string>();
    walkTracks((playlist as { items?: unknown }).items || playlist, tracks, seen);
    return uniqueTracks(tracks.filter(isLikelySong)).slice(0, limit);
  } catch {
    return [];
  }
}
