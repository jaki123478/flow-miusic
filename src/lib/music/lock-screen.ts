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

let audioContext: AudioContext | null = null;
let keepAliveNode: AudioNode | null = null;

export function unlockAudioSession() {
  if (typeof window === "undefined") return;
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (AudioCtx) {
      if (!audioContext || audioContext.state === "closed") {
        audioContext = new AudioCtx();
      }
      if (audioContext.state === "suspended") {
        void audioContext.resume();
      }
      // Oscillator keep-alive is Apple-mobile only. On Android it steals
      // audio focus from the native <audio> element when the screen locks.
      if (!keepAliveNode && audioContext && isAppleMobile() && !isAndroid()) {
        const osc = audioContext.createOscillator();
        const gain = audioContext.createGain();
        gain.gain.value = 0.00001; // Inaudible keep-alive for iOS Safari background thread
        osc.connect(gain);
        gain.connect(audioContext.destination);
        osc.start();
        keepAliveNode = osc;
      }
    }
    // NEVER assign /silence.wav (or any dummy src) to __FLOW_AUDIO_EL__.
  } catch {
    /* ignore */
  }
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
  const now = Date.now();
  const gap = typeof document !== "undefined" && document.hidden ? 2500 : 900;
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
