import { useEffect, useRef } from "react";
import { lastFmUpdate, readLastFmConfig } from "@/lib/music/lastfm";
import { hydrateDownloads } from "@/lib/music/offline-audio";
import { useFlowStore } from "@/stores/flow-store";

export function PlaybackWatch() {
  const sleepEndsAt = useFlowStore((s) => s.sleepEndsAt);
  const current = useFlowStore((s) => s.current);
  const isPlaying = useFlowStore((s) => s.isPlaying);
  const currentTime = useFlowStore((s) => s.currentTime);
  const duration = useFlowStore((s) => s.duration);
  const scrobbled = useRef<string>("");
  const startedAt = useRef<number>(0);
  const nowPlayingSent = useRef<string>("");

  useEffect(() => {
    hydrateDownloads();
  }, []);

  useEffect(() => {
    if (!sleepEndsAt) return;
    const tick = () => {
      const s = useFlowStore.getState();
      if (!s.sleepEndsAt) return;
      if (Date.now() < s.sleepEndsAt) return;
      s.pause();
      s.setSleep(null);
      s.notify("Timer spento");
    };
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [sleepEndsAt]);

  useEffect(() => {
    if (!current) return;
    startedAt.current = Math.floor(Date.now() / 1000);
    nowPlayingSent.current = "";
  }, [current?.id]);

  useEffect(() => {
    const track = current;
    if (!track || track.isLive || track.source === "radio") return;
    const cfg = readLastFmConfig();
    if (!cfg.enabled || !cfg.apiKey || !cfg.apiSecret || !cfg.sessionKey) return;
    if (useFlowStore.getState().settings.privateSession) return;

    if (isPlaying && nowPlayingSent.current !== track.id) {
      nowPlayingSent.current = track.id;
      void lastFmUpdate({
        data: {
          apiKey: cfg.apiKey,
          apiSecret: cfg.apiSecret,
          sessionKey: cfg.sessionKey,
          artist: track.artist,
          title: track.title,
          album: track.album,
          duration: duration || track.duration || undefined,
          nowPlaying: true,
        },
      }).catch(() => {});
    }

    const dur = duration || track.duration || 0;
    const listened = currentTime;
    const threshold = dur > 0 ? Math.min(dur * 0.5, 240) : 30;
    if (isPlaying && listened >= Math.max(30, threshold) && scrobbled.current !== track.id) {
      scrobbled.current = track.id;
      void lastFmUpdate({
        data: {
          apiKey: cfg.apiKey,
          apiSecret: cfg.apiSecret,
          sessionKey: cfg.sessionKey,
          artist: track.artist,
          title: track.title,
          album: track.album,
          duration: dur || undefined,
          timestamp: startedAt.current || Math.floor(Date.now() / 1000),
          nowPlaying: false,
        },
      }).catch(() => {});
    }
  }, [current, isPlaying, currentTime, duration]);

  return null;
}
