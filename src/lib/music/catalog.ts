import { createServerFn } from "@tanstack/react-start";
import { FALLBACK_ART, type RadioStation, type Track } from "./types";

const UA = "FlowMusic/1.0 (https://grok.x.ai)";

async function fetchJson<T>(url: string, timeoutMs = 10000): Promise<T | null> {
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": UA, Accept: "application/json" },
      signal: AbortSignal.timeout(timeoutMs),
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

function uniqueTracks(list: Track[]): Track[] {
  const seen = new Set<string>();
  const out: Track[] = [];
  for (const t of list) {
    const key = t.videoId || t.id;
    if (seen.has(key) || seen.has(t.id)) continue;
    seen.add(key);
    seen.add(t.id);
    out.push(t);
  }
  return out;
}

type RbStation = {
  stationuuid: string;
  name: string;
  country: string;
  countrycode: string;
  state?: string;
  tags?: string;
  favicon?: string;
  url_resolved?: string;
  url?: string;
  bitrate?: number;
  votes?: number;
  lastcheckok?: number;
};

function toStation(s: RbStation): RadioStation | null {
  const stream = (s.url_resolved || s.url || "").trim();
  if (!s.stationuuid || !s.name || !stream.startsWith("https://")) return null;
  if (s.lastcheckok === 0) return null;
  return {
    id: s.stationuuid,
    name: s.name.trim(),
    country: s.country || "",
    countryCode: (s.countrycode || "").toUpperCase(),
    city: s.state,
    tags: s.tags || "",
    artwork: FALLBACK_ART,
    streamUrl: stream,
    bitrate: s.bitrate,
    votes: s.votes,
  };
}

const RB_HOSTS = [
  "https://de1.api.radio-browser.info",
  "https://fi1.api.radio-browser.info",
  "https://at1.api.radio-browser.info",
];

async function radioBrowser(path: string): Promise<RbStation[]> {
  const result = await Promise.any(
    RB_HOSTS.map(async (host) => {
      const data = await fetchJson<RbStation[]>(`${host}${path}`, 4500);
      if (!Array.isArray(data) || data.length === 0) throw new Error("empty");
      return data;
    }),
  ).catch(() => [] as RbStation[]);
  return result;
}

export function stationToTrack(station: RadioStation): Track {
  return {
    id: `rd_${station.id}`,
    title: station.name,
    artist: [station.city, station.country].filter(Boolean).join(" · ") || "Radio",
    artwork: station.artwork || FALLBACK_ART,
    duration: 0,
    streamUrl: station.streamUrl.startsWith("https:")
      ? station.streamUrl
      : `/api/proxy?u=${encodeURIComponent(station.streamUrl)}`,
    source: "radio",
    isLive: true,
  };
}

export const getHomeFeed = createServerFn({ method: "GET" }).handler(async () => {
  const yt = await import("./ytmusic.server");
  const settled = await Promise.allSettled([
    yt.searchYtMusic("top hits official audio 2026", 16),
    yt.searchYtMusic("hit italia canzone official audio", 12),
    yt.getPlaylistTracks("PL4fGSI1pDJn77aK7sAW2AT0oOzo5inWY8", 16),
    yt.getPlaylistTracks("PL4fGSI1pDJn61unMfmrUSz68RT8IFFnks", 12),
    radioBrowser("/json/stations/search?hidebroken=true&order=clickcount&reverse=true&limit=40"),
    yt.getExploreTracks(),
  ]);
  const hits = settled[0].status === "fulfilled" ? settled[0].value : [];
  const italy = settled[1].status === "fulfilled" ? settled[1].value : [];
  const pop = settled[2].status === "fulfilled" ? settled[2].value : [];
  const viral = settled[3].status === "fulfilled" ? settled[3].value : [];
  const radiosRaw = settled[4].status === "fulfilled" ? settled[4].value : [];
  const explore = settled[5].status === "fulfilled" ? settled[5].value : { trending: [], fresh: [] };
  const stations = radiosRaw.map(toStation).filter((s): s is RadioStation => Boolean(s)).slice(0, 18);
  const trending = uniqueTracks([...hits, ...pop, ...explore.trending]).slice(0, 24);
  return {
    trending,
    hitsMix: uniqueTracks(italy.length ? italy : viral).slice(0, 16),
    independent: uniqueTracks([...explore.fresh, ...viral]).slice(0, 16),
    radios: stations,
  };
});

export const searchCatalog = createServerFn({ method: "GET" })
  .validator((d: { q: string }) => d)
  .handler(async ({ data }) => {
    const q = (data.q || "").trim();
    if (!q) return { tracks: [] as Track[], radios: [] as RadioStation[], independent: [] as Track[] };
    const yt = await import("./ytmusic.server");
    const [tracks, rb] = await Promise.all([
      yt.searchYtMusic(q, 28).catch(() => [] as Track[]),
      radioBrowser(`/json/stations/search?name=${encodeURIComponent(q)}&hidebroken=true&limit=12&order=votes&reverse=true`),
    ]);
    return {
      tracks: uniqueTracks(tracks),
      independent: [] as Track[],
      radios: rb.map(toStation).filter((s): s is RadioStation => Boolean(s)).slice(0, 10),
    };
  });

export const getChartTracks = createServerFn({ method: "GET" })
  .validator((d: { query: string; playlistId?: string }) => d)
  .handler(async ({ data }) => {
    const yt = await import("./ytmusic.server");
    const fromPl = data.playlistId ? await yt.getPlaylistTracks(data.playlistId, 40).catch(() => []) : [];
    if (fromPl.length >= 8) return uniqueTracks(fromPl);
    const query = (data.query || "").trim();
    const tracks = query ? await yt.searchYtMusic(query, 30) : await yt.getExploreTracks().then((e) => e.trending);
    return uniqueTracks([...fromPl, ...tracks]).slice(0, 40);
  });

export const getGenreMix = createServerFn({ method: "GET" })
  .validator((d: { query: string }) => d)
  .handler(async ({ data }) => {
    const yt = await import("./ytmusic.server");
    const tracks = await yt.searchYtMusic(data.query, 30);
    return uniqueTracks(tracks).slice(0, 30);
  });

export const getCountryRadios = createServerFn({ method: "GET" })
  .validator((d: { countryCode: string }) => d)
  .handler(async ({ data }) => {
    const code = (data.countryCode || "IT").toUpperCase();
    const list = await radioBrowser(
      `/json/stations/search?countrycode=${encodeURIComponent(code)}&hidebroken=true&order=clickcount&reverse=true&limit=40`,
    );
    return list.map(toStation).filter((s): s is RadioStation => Boolean(s)).slice(0, 30);
  });

export const getTopRadios = createServerFn({ method: "GET" }).handler(async () => {
  const list = await radioBrowser("/json/stations/search?hidebroken=true&order=clickcount&reverse=true&limit=50");
  return list.map(toStation).filter((s): s is RadioStation => Boolean(s)).slice(0, 36);
});

export const createMoodMix = createServerFn({ method: "POST" })
  .validator((d: { mood: string; prompt: string }) => d)
  .handler(async ({ data }) => {
    const mood = (data.mood || "").trim();
    const prompt = (data.prompt || mood).trim();
    if (!prompt) return { tracks: [] as Track[], blurb: "" };
    let queries = [prompt];
    let blurb = "";
    const apiKey = process.env.XAI_API_KEY;
    if (apiKey) {
      try {
        const res = await fetch("https://api.x.ai/v1/chat/completions", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
          body: JSON.stringify({
            model: "grok-4.5",
            max_tokens: 400,
            messages: [
              {
                role: "system",
                content:
                  'Sei un DJ. Rispondi SOLO con JSON: {"blurb":"frase breve in italiano","queries":["titolo canzone artista", ...]} con esattamente 8 query di brani reali adatti al mood.',
              },
              { role: "user", content: `Mood: ${prompt}` },
            ],
          }),
          signal: AbortSignal.timeout(12000),
        });
        if (res.ok) {
          const body = (await res.json()) as { choices?: { message?: { content?: string } }[] };
          const raw = body.choices?.[0]?.message?.content || "";
          const match = raw.match(/\{[\s\S]*\}/);
          if (match) {
            const parsed = JSON.parse(match[0]) as { blurb?: string; queries?: string[] };
            if (Array.isArray(parsed.queries) && parsed.queries.length) {
              queries = parsed.queries.slice(0, 8);
              blurb = String(parsed.blurb || "");
            }
          }
        }
      } catch {
        /* fallback */
      }
    }
    const yt = await import("./ytmusic.server");
    const batches = await Promise.all(queries.slice(0, 8).map((q) => yt.searchYtMusic(q, 2).catch(() => [] as Track[])));
    const extra = await yt.searchYtMusic(prompt, 12).catch(() => [] as Track[]);
    return { tracks: uniqueTracks([...batches.flat(), ...extra]).slice(0, 16), blurb: blurb || `Mix per: ${mood || prompt}` };
  });

export const getRelatedTracks = createServerFn({ method: "GET" })
  .validator((d: { artist: string; title: string; excludeId?: string }) => d)
  .handler(async ({ data }) => {
    const yt = await import("./ytmusic.server");
    const artist = (data.artist || "").trim();
    const title = (data.title || "").trim();
    const queries = [`${artist} ${title} mix official audio`, `${artist} radio mix official audio`, `${artist} similar songs official audio`].filter(
      (q) => q.replace(/official audio|mix|radio|similar songs/gi, "").trim().length > 1,
    );
    const batches = await Promise.all(queries.map((q) => yt.searchYtMusic(q, 10).catch(() => [] as Track[])));
    return uniqueTracks(batches.flat())
      .filter((t) => t.id !== data.excludeId && t.videoId !== data.excludeId)
      .slice(0, 24);
  });

export const getDiscoverMix = createServerFn({ method: "POST" })
  .validator((d: { artists: string[] }) => d)
  .handler(async ({ data }) => {
    const artists = (data.artists || []).map((a) => a.trim()).filter(Boolean).slice(0, 6);
    const yt = await import("./ytmusic.server");
    if (!artists.length) {
      const explore = await yt.getExploreTracks();
      return uniqueTracks([...explore.trending, ...explore.fresh]).slice(0, 24);
    }
    const batches = await Promise.all(artists.map((a) => yt.searchYtMusic(`${a} mix official audio`, 8).catch(() => [] as Track[])));
    return uniqueTracks(batches.flat()).slice(0, 28);
  });

export const getFreshTracks = createServerFn({ method: "POST" })
  .validator((d: { artists: string[] }) => d)
  .handler(async ({ data }) => {
    const yt = await import("./ytmusic.server");
    const explore = await yt.getExploreTracks();
    const artists = (data.artists || []).map((a) => a.trim()).filter(Boolean).slice(0, 5);
    const year = new Date().getFullYear();
    const batches = await Promise.all(artists.map((a) => yt.searchYtMusic(`${a} ${year} official audio`, 6).catch(() => [] as Track[])));
    return uniqueTracks([...explore.fresh, ...batches.flat()]).slice(0, 28);
  });

export const getVideoTrack = createServerFn({ method: "GET" })
  .validator((d: { id: string }) => d)
  .handler(async ({ data }) => {
    const id = (data.id || "").trim();
    if (!id) return null as Track | null;
    const yt = await import("./ytmusic.server");
    const hits = await yt.searchYtMusic(id, 6).catch(() => [] as Track[]);
    return hits.find((t) => t.videoId === id || t.id === id) || hits[0] || null;
  });

export const getPlayUrl = createServerFn({ method: "GET" })
  .validator((d: { v: string }) => d)
  .handler(async ({ data }) => {
    const id = (data.v || "").trim();
    if (!/^[\w-]{11}$/.test(id)) return { url: null as string | null };
    const yt = await import("./ytmusic.server");
    const url = await yt.getAudioUrl(id);
    return { url: url || null };
  });
