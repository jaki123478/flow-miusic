import { createServerFn } from "@tanstack/react-start";

const STORE_KEY = "flow_lastfm";
const API = "https://ws.audioscrobbler.com/2.0/";

export type LastFmConfig = {
  apiKey: string;
  apiSecret: string;
  sessionKey: string;
  username: string;
  enabled: boolean;
};

export const EMPTY_LASTFM: LastFmConfig = {
  apiKey: "",
  apiSecret: "",
  sessionKey: "",
  username: "",
  enabled: false,
};

export function readLastFmConfig(): LastFmConfig {
  if (typeof window === "undefined") return EMPTY_LASTFM;
  try {
    const raw = localStorage.getItem(STORE_KEY);
    return raw ? { ...EMPTY_LASTFM, ...(JSON.parse(raw) as Partial<LastFmConfig>) } : EMPTY_LASTFM;
  } catch {
    return EMPTY_LASTFM;
  }
}

export function writeLastFmConfig(cfg: LastFmConfig) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify(cfg));
  } catch {
    /* quota */
  }
}

async function lastFmCall(params: Record<string, string>, secret: string): Promise<Record<string, unknown>> {
  const { createHash } = await import("node:crypto");
  const keys = Object.keys(params)
    .filter((k) => k !== "format" && k !== "callback")
    .sort();
  const api_sig = createHash("md5").update(keys.map((k) => k + params[k]).join("") + secret).digest("hex");
  const body: Record<string, string> = { ...params, format: "json", api_sig };
  const res = await fetch(API, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams(body),
    signal: AbortSignal.timeout(8000),
  });
  const json = (await res.json()) as Record<string, unknown>;
  if (!res.ok || json.error) {
    throw new Error(String(json.message || json.error || `last.fm ${res.status}`));
  }
  return json;
}

export const lastFmHandshake = createServerFn({ method: "POST" })
  .validator((d: { apiKey: string; apiSecret: string; username: string; password: string }) => d)
  .handler(async ({ data }) => {
    const apiKey = data.apiKey.trim();
    const apiSecret = data.apiSecret.trim();
    const username = data.username.trim();
    const password = data.password;
    if (!apiKey || !apiSecret || !username || !password) {
      return { ok: false as const, error: "Compila chiave, secret, utente e password." };
    }
    try {
      const json = await lastFmCall(
        {
          method: "auth.getMobileSession",
          api_key: apiKey,
          username,
          password,
        },
        apiSecret,
      );
      const session = json.session as { key?: string; name?: string } | undefined;
      const sessionKey = session?.key || "";
      if (!sessionKey) return { ok: false as const, error: "Sessione Last.fm non ricevuta." };
      return { ok: true as const, sessionKey, username: session?.name || username };
    } catch (err) {
      return { ok: false as const, error: err instanceof Error ? err.message : "Collegamento Last.fm non riuscito" };
    }
  });

export const lastFmUpdate = createServerFn({ method: "POST" })
  .validator(
    (d: {
      apiKey: string;
      apiSecret: string;
      sessionKey: string;
      artist: string;
      title: string;
      album?: string;
      duration?: number;
      timestamp?: number;
      nowPlaying?: boolean;
    }) => d,
  )
  .handler(async ({ data }) => {
    const apiKey = data.apiKey.trim();
    const apiSecret = data.apiSecret.trim();
    const sessionKey = data.sessionKey.trim();
    const artist = data.artist.trim();
    const title = data.title.trim();
    if (!apiKey || !apiSecret || !sessionKey || !artist || !title) {
      return { ok: false as const, error: "Credenziali Last.fm incomplete." };
    }
    const nowPlaying = Boolean(data.nowPlaying);
    const params: Record<string, string> = {
      method: nowPlaying ? "track.updateNowPlaying" : "track.scrobble",
      api_key: apiKey,
      sk: sessionKey,
    };
    if (nowPlaying) {
      params.artist = artist;
      params.track = title;
      if (data.album) params.album = data.album;
      if (data.duration && data.duration > 0) params.duration = String(Math.round(data.duration));
    } else {
      params["artist[0]"] = artist;
      params["track[0]"] = title;
      params["timestamp[0]"] = String(data.timestamp || Math.floor(Date.now() / 1000));
      if (data.album) params["album[0]"] = data.album;
      if (data.duration && data.duration > 0) params["duration[0]"] = String(Math.round(data.duration));
    }
    try {
      await lastFmCall(params, apiSecret);
      return { ok: true as const };
    } catch (err) {
      return { ok: false as const, error: err instanceof Error ? err.message : "Scrobble non riuscito" };
    }
  });
