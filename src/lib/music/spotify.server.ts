import { createServerFn } from "@tanstack/react-start";
import type { Track } from "./types";

type Seed = { title: string; artist: string };

function parseSpotifyRef(raw: string): { kind: "playlist" | "album" | "track"; id: string } | null {
  const text = raw.trim();
  const uri = text.match(/^spotify:(playlist|album|track):([A-Za-z0-9]+)$/i);
  if (uri) return { kind: uri[1].toLowerCase() as "playlist" | "album" | "track", id: uri[2] };
  const url = text.match(/open\.spotify\.com\/(?:intl-[a-z]{2}\/)?(playlist|album|track)\/([A-Za-z0-9]+)/i);
  if (url) return { kind: url[1].toLowerCase() as "playlist" | "album" | "track", id: url[2] };
  if (/^[A-Za-z0-9]{22}$/.test(text)) return { kind: "playlist", id: text };
  return null;
}

function parseLines(raw: string): Seed[] {
  return raw
    .split(/\n+/)
    .map((line) => line.replace(/^\d+[\).\s-]+/, "").trim())
    .filter((line) => line.length > 2 && !/^https?:/i.test(line))
    .map((line) => {
      const dash = line.match(/^(.{2,80}?)\s+[-–—]\s+(.+)$/);
      if (dash) return { artist: dash[1].trim(), title: dash[2].trim() };
      return { artist: "", title: line };
    })
    .slice(0, 60);
}

function collectSeeds(entity: Record<string, unknown>): { title: string; seeds: Seed[] } {
  const title = String(entity.name || entity.title || "Playlist Spotify");
  const list = (entity.trackList || entity.tracks || []) as Record<string, unknown>[];
  if (Array.isArray(list) && list.length) {
    const seeds = list
      .map((item) => ({
        title: String(item.title || item.name || "").trim(),
        artist: String(item.subtitle || "").trim(),
      }))
      .filter((s) => s.title)
      .slice(0, 60);
    return { title, seeds };
  }
  if (entity.title) {
    return { title, seeds: [{ title: String(entity.title), artist: String(entity.subtitle || "") }] };
  }
  return { title, seeds: [] };
}

async function fetchEmbed(kind: string, id: string): Promise<{ title: string; seeds: Seed[] }> {
  const url = `https://open.spotify.com/embed/${kind}/${id}`;
  const res = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (compatible; FlowMusic/1.0)",
      Accept: "text/html",
    },
    signal: AbortSignal.timeout(12000),
  });
  if (!res.ok) throw new Error("Spotify non ha risposto");
  const html = await res.text();
  const match = html.match(/<script id="__NEXT_DATA__" type="application\/json">(.+?)<\/script>/);
  if (!match) throw new Error("Playlist non trovata. Deve essere pubblica.");
  const data = JSON.parse(match[1]) as {
    props?: { pageProps?: { state?: { data?: { entity?: Record<string, unknown> } } } };
  };
  const entity = data.props?.pageProps?.state?.data?.entity;
  if (!entity) throw new Error("Playlist non trovata o privata.");
  return collectSeeds(entity);
}

export const importSpotify = createServerFn({ method: "POST" })
  .validator((d: { url: string }) => d)
  .handler(async ({ data }) => {
    const raw = (data.url || "").trim();
    if (!raw) return { title: "", tracks: [] as Track[], missing: 0, error: "Incolla un link Spotify." };

    let title = "Playlist importata";
    let seeds: Seed[] = [];
    const ref = parseSpotifyRef(raw);
    try {
      if (ref) {
        const parsed = await fetchEmbed(ref.kind, ref.id);
        title = parsed.title;
        seeds = parsed.seeds;
      } else {
        seeds = parseLines(raw);
        title = "Lista importata";
      }
    } catch (err) {
      return {
        title,
        tracks: [] as Track[],
        missing: 0,
        error: err instanceof Error ? err.message : "Import non riuscito",
      };
    }

    if (!seeds.length) {
      return { title, tracks: [] as Track[], missing: 0, error: "Nessun brano trovato. La playlist è pubblica?" };
    }

    const yt = await import("./ytmusic.server");
    const tracks: Track[] = [];
    const seen = new Set<string>();
    for (let i = 0; i < seeds.length; i += 5) {
      const chunk = seeds.slice(i, i + 5);
      const found = await Promise.all(
        chunk.map((s) => {
          const q = [s.artist, s.title].filter(Boolean).join(" ");
          return yt.searchYtMusic(q, 2).catch(() => [] as Track[]);
        }),
      );
      for (const hits of found) {
        const hit = hits[0];
        if (!hit || seen.has(hit.id)) continue;
        seen.add(hit.id);
        tracks.push(hit);
      }
    }

    return {
      title,
      tracks,
      missing: Math.max(0, seeds.length - tracks.length),
      error: tracks.length ? null : "Nessun brano corrispondente trovato.",
    };
  });
