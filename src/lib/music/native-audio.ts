import { cachedAudioUrl } from "./offline-audio";
import { useFlowStore } from "@/stores/flow-store";
import type { Track } from "./types";
import { readAudioOutputId } from "./plan-suite";

export function getStreamApiBase(): string {
  if (typeof window === "undefined") return "";
  const configured = (import.meta.env.VITE_STREAM_API_BASE as string | undefined)?.trim();
  if (configured) return configured.replace(/\/+$/, "");
  return "https://flow-miusic.onrender.com";
}

export function isValidVideoId(videoId?: string | null): videoId is string {
  return /^[A-Za-z0-9_-]{11}$/.test((videoId || "").trim());
}

export function getStreamApiUrl(videoId: string, params?: Record<string, string | number | boolean>): string {
  const cleanVideoId = videoId.trim();
  if (!isValidVideoId(cleanVideoId)) return "";
  const search = new URLSearchParams({ v: cleanVideoId });
  for (const [key, value] of Object.entries(params || {})) {
    search.set(key, String(value));
  }
  const base = getStreamApiBase();
  return `${base}/api/stream?${search.toString()}`;
}

export function getStreamUrlForTrack(
  track: Track | { source?: string; videoId?: string; streamUrl?: string },
): string {
  if (track.source === "radio" && track.streamUrl) {
    if (track.streamUrl.startsWith("http://")) {
      return `/api/proxy?u=${encodeURIComponent(track.streamUrl)}`;
    }
    return track.streamUrl;
  }
  if (isValidVideoId(track.videoId)) {
    const cached = cachedAudioUrl(track.videoId);
    if (cached) return cached;
    return getStreamApiUrl(track.videoId);
  }
  if (track.streamUrl) return track.streamUrl;
  return "";
}

export function configureAudioCorsForSrc(audio: HTMLAudioElement, src: string) {
  try {
    const url = new URL(src, typeof window !== "undefined" ? window.location.href : "https://flow-music-app.web.app/");
    if (url.hostname === "flow-stream-proxy.netlify.app" || url.hostname === "flow-miusic.onrender.com") {
      audio.crossOrigin = "anonymous";
    } else {
      audio.removeAttribute("crossorigin");
    }
  } catch {
    audio.removeAttribute("crossorigin");
  }
}

export function getGlobalAudio(): HTMLAudioElement | null {
  if (typeof window === "undefined") return null;
  const w = window as any;
  if (!w.__FLOW_AUDIO__) {
    const el = document.createElement("audio");
    el.setAttribute("playsinline", "");
    el.setAttribute("webkit-playsinline", "true");
    el.setAttribute("x5-playsinline", "true");
    el.setAttribute("x-webkit-airplay", "allow");
    el.preload = "auto";
    // crossOrigin is configured per-source. The Netlify music proxy sends
    // Access-Control-Allow-Origin and needs CORS mode to avoid Chromium ORB,
    // while many public radio streams break if CORS is forced globally.
    el.style.position = "fixed";
    el.style.bottom = "0";
    el.style.left = "0";
    el.style.width = "1px";
    el.style.height = "1px";
    el.style.opacity = "0.01";
    // Keep the media element in the active rendering layer. Safari/iOS can
    // suspend audio elements placed behind the document with z-index:-1 when
    // the screen locks. It remains visually invisible and non-interactive.
    el.style.zIndex = "0";
    el.style.pointerEvents = "none";
    document.documentElement.appendChild(el);
    w.__FLOW_AUDIO__ = el;
  }
  return w.__FLOW_AUDIO__;
}

export function syncAudioOutput(audio: HTMLAudioElement) {
  try {
    const s = useFlowStore.getState();
    const raw = s.isMuted ? 0 : s.volume;
    const norm = s.settings?.normalize ? 0.92 : 1;
    const duck = s.voiceDuck ? 0.28 : 1;
    audio.volume = Math.max(0, Math.min(1, raw * norm * duck));
    if (s.playbackRate) audio.playbackRate = s.playbackRate;
    const sink = readAudioOutputId();
    const anyAudio = audio as HTMLAudioElement & { setSinkId?: (id: string) => Promise<void>; sinkId?: string };
    if (sink && typeof anyAudio.setSinkId === "function" && anyAudio.sinkId !== sink) {
      void anyAudio.setSinkId(sink).catch(() => undefined);
    }
  } catch {
    /* ignore */
  }
}

export function unlockAudioInUserGesture(
  track?: Track | { source?: string; videoId?: string; streamUrl?: string },
) {
  if (typeof window === "undefined") return;
  try {
    if ((navigator as any).audioSession) {
      (navigator as any).audioSession.type = "playback";
    }
  } catch (_) {}

  const audio = getGlobalAudio();
  if (audio) {
    if (track) {
      const src = getStreamUrlForTrack(track);
      if (src) {
        const fullUrl = new URL(src, window.location.href).href;
        if (audio.src !== fullUrl && audio.src !== src) {
          configureAudioCorsForSrc(audio, src);
          audio.src = src;
          audio.load();
        }
      }
    } else if (!audio.src || audio.src.startsWith("data:")) {
      audio.src =
        "data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA";
      audio.load();
    }
    syncAudioOutput(audio);
    const p = audio.play();
    if (p && p.catch) {
      p.catch(() => {});
    }
  }
}

export function directPlayTrack(track: Track) {
  unlockAudioInUserGesture(track);
}
