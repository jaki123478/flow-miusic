import type { Track } from "./types";

let pageHiding = false;
let lifecycle = false;

function installLifecycle() {
  if (lifecycle || typeof window === "undefined") return;
  lifecycle = true;
  window.addEventListener("pagehide", () => {
    pageHiding = true;
  });
  window.addEventListener("pageshow", () => {
    pageHiding = false;
  });
}

export function isPlaybackFrozen() {
  if (typeof document === "undefined") return false;
  return document.hidden || pageHiding;
}

export function unlockAudioSession() {
  if (typeof navigator === "undefined") return;
  try {
    const session = (navigator as Navigator & { audioSession?: { type: string } }).audioSession;
    if (session) session.type = "playback";
  } catch {
    /* Safari < 16.4 */
  }
  try {
    const w = window as Window & { webkitAudioContext?: typeof AudioContext; __FLOW_AC__?: AudioContext };
    const Ctx = window.AudioContext || w.webkitAudioContext;
    if (!Ctx) return;
    if (!w.__FLOW_AC__) w.__FLOW_AC__ = new Ctx();
    if (w.__FLOW_AC__.state === "suspended") void w.__FLOW_AC__.resume();
  } catch {
    /* resume only — never connect a silent source */
  }
}

export function getGlobalAudio(): HTMLAudioElement | null {
  if (typeof window === "undefined") return null;
  installLifecycle();
  const w = window as Window & { __FLOW_AUDIO__?: HTMLAudioElement };
  if (!w.__FLOW_AUDIO__) {
    const el = document.createElement("audio");
    el.setAttribute("playsinline", "");
    el.setAttribute("webkit-playsinline", "true");
    el.preload = "auto";
    el.crossOrigin = "anonymous";
    el.style.position = "fixed";
    el.style.bottom = "0";
    el.style.left = "0";
    el.style.width = "1px";
    el.style.height = "1px";
    el.style.opacity = "0.01";
    el.style.zIndex = "-1";
    el.style.pointerEvents = "none";
    document.documentElement.appendChild(el);
    w.__FLOW_AUDIO__ = el;
  }
  return w.__FLOW_AUDIO__;
}

export function directPlayTrack(track: Track) {
  if (typeof window === "undefined" || !track) return;
  unlockAudioSession();
  const audio = getGlobalAudio();
  if (!audio) return;
  if (isPlaybackFrozen()) {
    if (audio.paused) void audio.play().catch(() => {});
    return;
  }
  const host = window.location.hostname;
  const base = host.includes("web.app") || host.includes("firebaseapp.com") ? "https://flow-music-app-two.vercel.app" : "";
  const src = track.streamUrl || (track.videoId ? `${base}/api/stream?v=${track.videoId}` : "");
  if (!src) return;
  audio.src = src;
  void audio.play().catch(() => {});
}
