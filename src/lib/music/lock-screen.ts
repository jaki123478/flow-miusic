import type { Track } from "./types";

export function isAppleMobile() {
  if (typeof navigator === "undefined") return false;
  return /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
}

export function isAndroid() {
  if (typeof navigator === "undefined") return false;
  return /Android/i.test(navigator.userAgent);
}

export function prefersNativeYtAudio() {
  return isAndroid() || isAppleMobile();
}

function artUrl(src: string) {
  if (!src || src.startsWith("data:") || src.startsWith("blob:")) return src;
  if (src.startsWith("/")) return `${window.location.origin}${src}`;
  return `${window.location.origin}/api/proxy?u=${encodeURIComponent(src)}`;
}

let lastMetaId = "";
let lastState: "none" | "paused" | "playing" = "none";
let lastPosAt = 0;

export function pushLockScreen(track: Track, isPlaying: boolean, currentTime: number, duration: number, rate: number) {
  if (typeof navigator === "undefined" || !("mediaSession" in navigator)) return;
  const src = artUrl(track.artwork);
  try {
    if (lastMetaId !== track.id) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: track.title,
        artist: track.artist,
        album: track.album || "Flow",
        artwork: src
          ? [
              { src, sizes: "96x96", type: "image/jpeg" },
              { src, sizes: "256x256", type: "image/jpeg" },
              { src, sizes: "512x512", type: "image/jpeg" },
            ]
          : [],
      });
      lastMetaId = track.id;
    }
    const state: "paused" | "playing" = isPlaying ? "playing" : "paused";
    if (lastState !== state) {
      navigator.mediaSession.playbackState = state;
      lastState = state;
    }
  } catch {
    /* older WebKit */
  }
  if (track.isLive) return;
  if (typeof document !== "undefined" && document.hidden) return;
  const now = Date.now();
  const gap = 900;
  if (now - lastPosAt < gap) return;
  lastPosAt = now;
  const dur = Number.isFinite(duration) && duration > 0 ? duration : 0;
  const pos = Number.isFinite(currentTime) ? Math.max(0, currentTime) : 0;
  if (dur <= 0) return;
  try {
    navigator.mediaSession.setPositionState({
      duration: dur,
      playbackRate: rate > 0 ? rate : 1,
      position: Math.min(pos, dur),
    });
  } catch {
    /* iOS may reject invalid position */
  }
}

export function bindLockScreenActions(handlers: {
  play: () => void;
  pause: () => void;
  prev: () => void;
  next: () => void;
  seek: (time: number) => void;
  skip: (delta: number) => void;
  stop: () => void;
}) {
  if (typeof navigator === "undefined" || !("mediaSession" in navigator)) return;
  const bind = (action: MediaSessionAction, fn: MediaSessionActionHandler | null) => {
    try {
      navigator.mediaSession.setActionHandler(action, fn);
    } catch {
      /* unsupported on this OS */
    }
  };
  bind("play", handlers.play);
  bind("pause", handlers.pause);
  bind("previoustrack", handlers.prev);
  bind("nexttrack", handlers.next);
  bind("stop", handlers.stop);
  bind("seekto", (d) => {
    if (typeof d.seekTime === "number") handlers.seek(d.seekTime);
  });
  bind("seekforward", () => handlers.skip(10));
  bind("seekbackward", () => handlers.skip(-10));
}
