import { useEffect, useState } from "react";
import { withBackoff } from "@/lib/net/backoff";
import type { Track } from "./types";

const mem = new Map<string, string>();
const inflight = new Map<string, Promise<string>>();
const pinned = new Set<string>();

const AUDIO_CACHE = "flow-audio-v1";
const META_KEY = "flow_download_meta";
const EVENT = "flow-downloads";

export type DownloadedTrack = Track & { savedAt: number; bytes: number };

function trimMem() {
  while (mem.size > 12) {
    const id = [...mem.keys()].find((k) => !pinned.has(k));
    if (!id) break;
    const url = mem.get(id);
    if (url) URL.revokeObjectURL(url);
    mem.delete(id);
  }
}

function remember(id: string, url: string, pin = false) {
  const prev = mem.get(id);
  if (prev && prev !== url) URL.revokeObjectURL(prev);
  mem.set(id, url);
  if (pin) pinned.add(id);
  trimMem();
}

export function cachedAudioUrl(id: string): string | undefined {
  return mem.get(id);
}

export function isDownloaded(id: string): boolean {
  if (!id) return false;
  if (pinned.has(id)) return true;
  if (typeof window === "undefined") return false;
  return Boolean(readMeta()[id]);
}

function readMeta(): Record<string, DownloadedTrack> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(META_KEY);
    return raw ? (JSON.parse(raw) as Record<string, DownloadedTrack>) : {};
  } catch {
    return {};
  }
}

function writeMeta(next: Record<string, DownloadedTrack>) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(META_KEY, JSON.stringify(next));
  } catch {
    /* quota */
  }
  window.dispatchEvent(new Event(EVENT));
}

export function listDownloads(): DownloadedTrack[] {
  return Object.values(readMeta()).sort((a, b) => b.savedAt - a.savedAt);
}

async function cacheApi(): Promise<Cache | null> {
  if (typeof caches === "undefined") return null;
  try {
    return await caches.open(AUDIO_CACHE);
  } catch {
    return null;
  }
}

function offlineKey(id: string) {
  return `/offline-audio/${id}`;
}

async function fromPersistent(id: string): Promise<string | null> {
  const store = await cacheApi();
  if (!store) return null;
  const hit = await store.match(offlineKey(id));
  if (!hit) return null;
  const blob = await hit.blob();
  if (!blob.size) return null;
  const url = URL.createObjectURL(blob);
  remember(id, url, true);
  return url;
}

export function prefetchAudio(id: string) {
  if (!id || mem.has(id) || inflight.has(id)) return;
  void loadLocalAudio(id).catch(() => {});
}

function getStreamApiBase(): string {
  if (typeof window === "undefined") return "";
  const host = window.location.hostname;
  if (host.includes("web.app") || host.includes("firebaseapp.com")) {
    return "https://flow-music-app-two.vercel.app";
  }
  return "";
}

export async function loadLocalAudio(id: string): Promise<string> {
  const hit = mem.get(id);
  if (hit) return hit;
  const pending = inflight.get(id);
  if (pending) return pending;
  const job = (async () => {
    const persisted = await fromPersistent(id);
    if (persisted) return persisted;
    const base = getStreamApiBase();
    return withBackoff(
      async () => {
        const res = await fetch(`${base}/api/stream?v=${id}`, {
          cache: "no-store",
          headers: { Accept: "audio/*,*/*" },
        });
        if (!res.ok && res.status !== 206) throw new Error(`stream ${res.status}`);
        const blob = await res.blob();
        if (!blob.size) throw new Error("empty");
        const url = URL.createObjectURL(blob);
        remember(id, url, pinned.has(id));
        return url;
      },
      { baseMs: 400, maxMs: 6000, maxAttempts: 5, factor: 2, jitter: 0.2 },
    );
  })();
  inflight.set(id, job);
  try {
    return await job;
  } finally {
    inflight.delete(id);
  }
}

export async function downloadTrack(track: Track): Promise<void> {
  const id = track.videoId;
  if (!id || track.isLive || track.source === "radio") throw new Error("non scaricabile");
  const store = await cacheApi();
  if (!store) throw new Error("Cache non disponibile");
  const url = await loadLocalAudio(id);
  const res = await fetch(url);
  const blob = await res.blob();
  if (!blob.size) throw new Error("empty");
  await store.put(
    offlineKey(id),
    new Response(blob, { headers: { "Content-Type": blob.type || "audio/mpeg" } }),
  );
  pinned.add(id);
  const meta = readMeta();
  meta[id] = { ...track, savedAt: Date.now(), bytes: blob.size };
  writeMeta(meta);
}

export function canDownloadTrack(track: Track): boolean {
  return Boolean(track.videoId) && !track.isLive && track.source !== "radio";
}

export async function downloadTracks(
  tracks: Track[],
  onProgress?: (done: number, total: number) => void,
): Promise<{ ok: number; fail: number; skipped: number }> {
  const list = tracks.filter(canDownloadTrack);
  const total = list.length;
  let ok = 0;
  let fail = 0;
  let skipped = 0;
  let done = 0;
  const pending = [...list];
  const worker = async () => {
    while (pending.length) {
      const track = pending.shift();
      if (!track?.videoId) continue;
      try {
        if (isDownloaded(track.videoId)) skipped += 1;
        else {
          await downloadTrack(track);
          ok += 1;
        }
      } catch {
        fail += 1;
      } finally {
        done += 1;
        onProgress?.(done, total);
      }
    }
  };
  const n = Math.min(2, pending.length);
  await Promise.all(Array.from({ length: n }, () => worker()));
  return { ok, fail, skipped };
}

export async function removeDownload(id: string): Promise<void> {
  if (!id) return;
  const store = await cacheApi();
  if (store) await store.delete(offlineKey(id));
  pinned.delete(id);
  const meta = readMeta();
  delete meta[id];
  writeMeta(meta);
}

export function hydrateDownloads() {
  for (const id of Object.keys(readMeta())) pinned.add(id);
}

export function useOfflineDownloads() {
  const [items, setItems] = useState<DownloadedTrack[]>([]);
  useEffect(() => {
    hydrateDownloads();
    const refresh = () => setItems(listDownloads());
    refresh();
    window.addEventListener(EVENT, refresh);
    return () => window.removeEventListener(EVENT, refresh);
  }, []);
  return items;
}

export function useIsDownloaded(id: string | undefined) {
  const [on, setOn] = useState(() => Boolean(id && isDownloaded(id)));
  useEffect(() => {
    const refresh = () => setOn(Boolean(id && isDownloaded(id)));
    refresh();
    window.addEventListener(EVENT, refresh);
    return () => window.removeEventListener(EVENT, refresh);
  }, [id]);
  return on;
}

export function formatBytes(n: number): string {
  if (!Number.isFinite(n) || n <= 0) return "0 B";
  if (n < 1024) return `${Math.round(n)} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(n < 10 * 1024 ? 1 : 0)} KB`;
  if (n < 1024 * 1024 * 1024) return `${(n / (1024 * 1024)).toFixed(n < 10 * 1024 * 1024 ? 1 : 0)} MB`;
  return `${(n / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

export type CacheStats = { bytes: number; count: number; quota?: number; usage?: number };

export async function cacheStats(): Promise<CacheStats> {
  const items = listDownloads();
  let bytes = items.reduce((sum, t) => sum + (t.bytes || 0), 0);
  if (!bytes) {
    const store = await cacheApi();
    if (store) {
      const keys = await store.keys();
      for (const req of keys) {
        const hit = await store.match(req);
        if (!hit) continue;
        const len = Number(hit.headers.get("content-length") || 0);
        bytes += len || 0;
      }
    }
  }
  let quota: number | undefined;
  let usage: number | undefined;
  try {
    const est = await navigator.storage?.estimate?.();
    quota = est?.quota;
    usage = est?.usage;
  } catch {
    /* ignore */
  }
  return { bytes, count: items.length, quota, usage };
}

export async function clearAllDownloads(): Promise<void> {
  const ids = Object.keys(readMeta());
  for (const id of ids) await removeDownload(id);
}

export function useCacheStats() {
  const [stats, setStats] = useState<CacheStats>({ bytes: 0, count: 0 });
  useEffect(() => {
    const refresh = () => {
      void cacheStats().then(setStats);
    };
    refresh();
    window.addEventListener(EVENT, refresh);
    return () => window.removeEventListener(EVENT, refresh);
  }, []);
  return stats;
}
