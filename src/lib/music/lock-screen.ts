import type { Track } from "./types";

export function isAppleMobile() {
  if (typeof navigator === "undefined") return false;
  return /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
}

function artUrl(src: string) {
  if (!src || src.startsWith("data:") || src.startsWith("blob:")) return src;
  if (src.startsWith("/")) return `${window.location.origin}${src}`;
  return `${window.location.origin}/api/proxy?u=${encodeURIComponent(src)}`;
}

export function pushLockScreen(track: Track, isPlaying: boolean, currentTime: number, duration: number, rate: number) {
  if (typeof navigator === "undefined" || !("mediaSession" in navigator)) return;
  const src = artUrl(track.artwork);
  try {
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
    navigator.mediaSession.playbackState = isPlaying ? "playing" : "paused";
  } catch {
    /* older WebKit */
  }
  if (track.isLive) return;
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
