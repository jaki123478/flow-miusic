import { useEffect, useRef, useState, type CSSProperties, type TouchEvent } from "react";
import {
  Check,
  ChevronDown,
  Download,
  Gauge,
  Heart,
  ListMusic,
  Mic2,
  Moon,
  Pause,
  Play,
  Radio,
  Repeat,
  Repeat1,
  RotateCcw,
  RotateCw,
  Share2,
  Shuffle,
  SkipBack,
  SkipForward,
  Sliders,
  Sparkles,
  Type,
  Languages,
  QrCode,
  Car,
  ShieldCheck,
  Volume2,
  VolumeX,
  Smartphone,
} from "lucide-react";
import { cn, formatTime, useOpenTransition } from "@/lib/utils";
import { useFlowStore, type FlowSettings } from "@/stores/flow-store";
import { AudioVisualizer } from "./visualizer";
import { AndroidPowerHubModal } from "./android-power-hub";
import { notifyNativeTrackChange, notifyNativeLyricLine, isAndroidNative } from "@/lib/music/android-bridge";

const EQ_PRESETS = [
  { id: "flat", label: "Flat", bass: 0, treble: 0 },
  { id: "bass_boost", label: "Bass Boost", bass: 7, treble: 0 },
  { id: "vocal", label: "Vocal Boost", bass: -2, treble: 5 },
  { id: "treble_boost", label: "Treble Boost", bass: -1, treble: 7 },
  { id: "rock", label: "Rock", bass: 5, treble: 4 },
  { id: "pop", label: "Pop", bass: 3, treble: 3 },
  { id: "electronic", label: "Electronic", bass: 6, treble: 5 },
] as const;
import { TrackArt, TrackRow } from "./tracks";
import { bindLockScreenActions, isAppleMobile, pushLockScreen } from "@/lib/music/lock-screen";
import { getGlobalAudio, isPlaybackFrozen, unlockAudioSession } from "@/lib/music/native-audio";
import { bindAudioFocus, claimAudioFocus, markPlayingForFocus, shouldResumeAfterFocus } from "@/lib/music/audio-focus";
import { showAndroidNowPlaying } from "@/lib/music/android-bg";
import {
  cachedAudioUrl,
  canDownloadTrack,
  downloadTrack,
  downloadTracks,
  loadLocalAudio,
  prefetchAudio,
  removeDownload,
  useIsDownloaded,
} from "@/lib/music/offline-audio";
import { getTrackLyrics, getTranslatedLyrics, type LyricsPayload } from "@/lib/music/lyrics";
import { getRelatedTracks } from "@/lib/music/catalog";
import { averageArtworkColor, shareLyricsCard } from "@/lib/music/lyrics-share";

function fallbackSrc(track: { source?: string; videoId?: string; streamUrl?: string }) {
  if (track.source === "radio" && track.streamUrl) return track.streamUrl;
  const id = track.videoId || "";
  if (id.length === 11) {
    return "https://taken-transition-locator-hunting.trycloudflare.com/api/stream?id=" + encodeURIComponent(id);
  }
  return track.streamUrl || "";
}

function applyOutput(audio: HTMLAudioElement) {
  const s = useFlowStore.getState();
  const raw = s.isMuted ? 0 : s.volume;
  const norm = s.settings.normalize ? 0.92 : 1;
  const duck = s.voiceDuck ? 0.28 : 1;
  audio.volume = Math.max(0, Math.min(1, raw * norm * duck));
  try {
    audio.playbackRate = s.playbackRate || 1;
  } catch {
    /* ignore */
  }
}

export function AudioEngine() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const current = useFlowStore((s) => s.current);
  const isPlaying = useFlowStore((s) => s.isPlaying);
  const volume = useFlowStore((s) => s.volume);
  const isMuted = useFlowStore((s) => s.isMuted);
  const voiceDuck = useFlowStore((s) => s.voiceDuck);
  const playbackRate = useFlowStore((s) => s.playbackRate);
  const normalize = useFlowStore((s) => s.settings.normalize);
  const seekVersion = useFlowStore((s) => s.seekVersion);
  const currentTime = useFlowStore((s) => s.currentTime);
  const setCurrentTime = useFlowStore((s) => s.setCurrentTime);
  const setDuration = useFlowStore((s) => s.setDuration);
  const onEnded = useFlowStore((s) => s.onEnded);
  const lastSeek = useRef(0);
  const lastSrc = useRef("");
  const lastMove = useRef(0);
  const lastPos = useRef(0);
  const recovering = useRef("");

  const el = () => audioRef.current || (audioRef.current = getGlobalAudio());

  const resumeElement = (audio: HTMLAudioElement | null) => {
    if (!audio) return;
    if (useFlowStore.getState().isPlaying && audio.paused) void audio.play().catch(() => {});
  };

  const applySrc = (audio: HTMLAudioElement, src: string, play: boolean, force = false, allowHidden = false) => {
    if (!src) return;
    applyOutput(audio);
    if (isPlaybackFrozen() && !allowHidden) {
      if (play && audio.paused && useFlowStore.getState().isPlaying) void audio.play().catch(() => {});
      return;
    }
    if (lastSrc.current === src) {
      if (play && audio.paused) void audio.play().catch(() => {});
      return;
    }
    const playing = !audio.paused && !audio.error;
    const blobUpgrade = src.startsWith("blob:") && lastSrc.current.includes("/api/stream");
    if (playing && blobUpgrade) return;
    if (playing && !force) return;
    lastSrc.current = src;
    audio.src = src;
    if (play) void audio.play().catch(() => {});
  };

  const recover = (id: string, time: number) => {
    const audio = el();
    if (!audio || recovering.current === id) return;
    if (isPlaybackFrozen()) {
      resumeElement(audio);
      return;
    }
    recovering.current = id;
    const ready = cachedAudioUrl(id);
    if (ready) {
      applySrc(audio, ready, true, true);
      audio.addEventListener(
        "loadedmetadata",
        () => {
          try {
            if (time > 0) audio.currentTime = time;
          } catch {
            /* ignore */
          }
          void audio.play().catch(() => {});
        },
        { once: true },
      );
      return;
    }
    void loadLocalAudio(id)
      .then((url) => {
        if (isPlaybackFrozen()) return;
        if (useFlowStore.getState().current?.videoId !== id) return;
        applySrc(audio, url, true, true);
        audio.addEventListener(
          "loadedmetadata",
          () => {
            try {
              if (time > 0) audio.currentTime = time;
            } catch {
              /* ignore */
            }
            if (useFlowStore.getState().isPlaying) void audio.play().catch(() => {});
          },
          { once: true },
        );
      })
      .catch(() => {
        if (recovering.current === id) recovering.current = "";
      });
  };

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      void navigator.serviceWorker.register("/sw-audio.js").catch(() => {});
    }
    const audio = el();
    if (!audio) return;
    audio.setAttribute("playsinline", "true");
    audio.setAttribute("webkit-playsinline", "true");
    unlockAudioSession();
    claimAudioFocus();

    const onTimeUpdate = () => {
      const t = audio.currentTime;
      if (!Number.isFinite(t)) return;
      setCurrentTime(t);
      if (t > lastPos.current) {
        lastPos.current = t;
        lastMove.current = Date.now();
      }
      if (document.hidden) return;
      const track = useFlowStore.getState().current;
      if (track) pushLockScreen(track, !audio.paused, t, audio.duration || 0, 1);
    };
    const onDurationChange = () => {
      const d = audio.duration;
      if (Number.isFinite(d) && d > 0) setDuration(d);
    };
    const onPlaying = () => {
      lastMove.current = Date.now();
      recovering.current = "";
      const track = useFlowStore.getState().current;
      if (track) {
        markPlayingForFocus(true);
        pushLockScreen(track, true, audio.currentTime || 0, audio.duration || 0, 1);
      }
    };
    const onPause = () => {
      resumeElement(audio);
    };
    const onWaiting = () => {
      if (isPlaybackFrozen()) resumeElement(audio);
    };
    const onError = () => {
      const s = useFlowStore.getState();
      const id = s.current?.videoId;
      if (!id) return;
      if (isPlaybackFrozen()) {
        resumeElement(audio);
        return;
      }
      applySrc(audio, "https://taken-transition-locator-hunting.trycloudflare.com/api/stream?id=" + encodeURIComponent(id), s.isPlaying, true);
    };
    const onStalled = () => {
      if (isPlaybackFrozen()) resumeElement(audio);
    };
    const onEndedEv = () => {
      onEnded();
      const s = useFlowStore.getState();
      const track = s.current;
      if (!track || !s.isPlaying) return;
      applySrc(audio, fallbackSrc(track), true, true, true);
    };

    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("durationchange", onDurationChange);
    audio.addEventListener("playing", onPlaying);
    audio.addEventListener("pause", onPause);
    audio.addEventListener("waiting", onWaiting);
    audio.addEventListener("error", onError);
    audio.addEventListener("stalled", onStalled);
    audio.addEventListener("ended", onEndedEv);

    bindLockScreenActions({
      play: () => {
        unlockAudioSession();
        useFlowStore.getState().resume();
        void audio.play().catch(() => {});
      },
      pause: () => {
        useFlowStore.getState().pause();
        audio.pause();
      },
      prev: () => {
        useFlowStore.getState().prev();
        const track = useFlowStore.getState().current;
        if (track) applySrc(audio, fallbackSrc(track), true, true, true);
      },
      next: () => {
        useFlowStore.getState().next();
        const track = useFlowStore.getState().current;
        if (track) applySrc(audio, fallbackSrc(track), true, true, true);
      },
      seek: (t) => useFlowStore.getState().seek(t),
      skip: (d) => useFlowStore.getState().skipBy(d),
      stop: () => {
        useFlowStore.getState().pause();
        audio.pause();
      },
    });
    const unbindFocus = bindAudioFocus({
      onLost: () => {
        if (document.hidden) return;
        useFlowStore.getState().pause();
      },
      onGained: () => {
        if (!shouldResumeAfterFocus()) return;
        const s = useFlowStore.getState();
        if (s.current) s.resume();
        void audio.play().catch(() => {});
      },
    });
    return () => {
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("durationchange", onDurationChange);
      audio.removeEventListener("playing", onPlaying);
      audio.removeEventListener("pause", onPause);
      audio.removeEventListener("waiting", onWaiting);
      audio.removeEventListener("error", onError);
      audio.removeEventListener("stalled", onStalled);
      audio.removeEventListener("ended", onEndedEv);
      unbindFocus();
    };
  }, [onEnded, setCurrentTime, setDuration]);

  useEffect(() => {
    const audio = el();
    if (!audio || !current) return;
    recovering.current = "";
    lastMove.current = Date.now();
    lastPos.current = 0;
    /* catalog audio plays via native <audio> against the off-Vercel proxy */
    if (current.duration && current.duration > 0) setDuration(current.duration);
    else setDuration(0);
    const wantPlay = useFlowStore.getState().isPlaying;
    applySrc(audio, fallbackSrc(current), wantPlay, true);
    unlockAudioSession();
    claimAudioFocus();
    if (wantPlay) {
      markPlayingForFocus(true);
      showAndroidNowPlaying(current);
    }
    pushLockScreen(current, wantPlay, 0, current.duration || 0, 1);
    notifyNativeTrackChange(current, wantPlay, 0);
    const st = useFlowStore.getState();
    const nxt = st.queue[st.queueIndex + 1];
    if (nxt?.videoId && nxt.videoId !== current.videoId) prefetchAudio(nxt.videoId);
  }, [current?.id, current?.videoId, current?.streamUrl, setDuration]);

  useEffect(() => {
    const audio = el();
    if (!audio) return;
    markPlayingForFocus(isPlaying);
    unlockAudioSession();
    claimAudioFocus();
    applyOutput(audio);
    if (isPlaying) {
      void audio.play().catch(() => {});
    } else {
      audio.pause();
    }
    if (current) {
      pushLockScreen(current, isPlaying, audio.currentTime || 0, audio.duration || 0, 1);
      notifyNativeTrackChange(current, isPlaying, audio.currentTime || 0);
    }
  }, [isPlaying, current]);

  useEffect(() => {
    const audio = el();
    if (audio) applyOutput(audio);
  }, [volume, isMuted, voiceDuck, playbackRate, normalize]);

  useEffect(() => {
    if (seekVersion === lastSeek.current) return;
    lastSeek.current = seekVersion;
    const audio = el();
    if (!audio) return;
    if (Math.abs(audio.currentTime - currentTime) > 0.4) {
      audio.currentTime = currentTime;
    }
  }, [seekVersion, currentTime]);

  useEffect(() => {
    let hidKeep = false;
    const keepPlaying = () => {
      const audio = el();
      const s = useFlowStore.getState();
      if (!audio || !s.isPlaying) return;
      claimAudioFocus();
      if (audio.paused) void audio.play().catch(() => {});
    };
    const kick = () => {
      const audio = el();
      const s = useFlowStore.getState();
      if (!audio || !s.isPlaying || !s.current) return;
      if (document.hidden || isPlaybackFrozen()) {
        if (!hidKeep) {
          hidKeep = true;
          keepPlaying();
        }
        return;
      }
      hidKeep = false;
      resumeElement(audio);
      const t = audio.currentTime || 0;
      if (t > lastPos.current + 0.15) {
        lastPos.current = t;
        lastMove.current = Date.now();
        return;
      }
      if (Date.now() - lastMove.current > 4000 && s.current.videoId && audio.error) {
        recover(s.current.videoId, t || s.currentTime);
      }
    };
    const onHide = () => {
      hidKeep = false;
      keepPlaying();
    };
    const onVis = () => {
      if (document.hidden) onHide();
      else kick();
    };
    document.addEventListener("visibilitychange", onVis);
    window.addEventListener("pageshow", kick);
    window.addEventListener("pagehide", onHide);
    const watchdog = window.setInterval(kick, 2000);
    return () => {
      document.removeEventListener("visibilitychange", onVis);
      window.removeEventListener("pageshow", kick);
      window.removeEventListener("pagehide", onHide);
      window.clearInterval(watchdog);
    };
  }, []);

  return null;
}

export function MiniPlayer() {
  const current = useFlowStore((s) => s.current);
  const isPlaying = useFlowStore((s) => s.isPlaying);
  const currentTime = useFlowStore((s) => s.currentTime);
  const duration = useFlowStore((s) => s.duration);
  const remainingTime = useFlowStore((s) => s.settings.remainingTime);
  const togglePlay = useFlowStore((s) => s.togglePlay);
  const next = useFlowStore((s) => s.next);
  const prev = useFlowStore((s) => s.prev);
  const seek = useFlowStore((s) => s.seek);
  const shuffle = useFlowStore((s) => s.shuffle);
  const repeat = useFlowStore((s) => s.repeat);
  const volume = useFlowStore((s) => s.volume);
  const isMuted = useFlowStore((s) => s.isMuted);
  const toggleShuffle = useFlowStore((s) => s.toggleShuffle);
  const cycleRepeat = useFlowStore((s) => s.cycleRepeat);
  const toggleLike = useFlowStore((s) => s.toggleLike);
  const liked = useFlowStore((s) => (current ? s.liked.some((t) => t.id === current.id) : false));
  const setShowFullPlayer = useFlowStore((s) => s.setShowFullPlayer);
  const setVolume = useFlowStore((s) => s.setVolume);
  const toggleMute = useFlowStore((s) => s.toggleMute);
  const showFull = useFlowStore((s) => s.showFullPlayer);
  const { mounted, open } = useOpenTransition(Boolean(current), 280);
  if (!mounted || !current) return null;
  const progress = duration > 0 ? Math.min(100, (currentTime / duration) * 100) : 0;
  const RepeatIcon = repeat === "one" ? Repeat1 : Repeat;
  const rightTime = remainingTime && duration > 0 ? Math.max(0, duration - currentTime) : duration;
  return (
    <div className={cn("now-bar pointer-events-auto bg-elevated/95 md:bg-bg", (!open || showFull) && "is-away")}>
      <div className="md:hidden">
        <div className="mx-2.5 mb-1 overflow-hidden rounded-2xl bg-[#14171E]/95 shadow-xl ring-1 ring-white/10 backdrop-blur-xl">
          <div className="flex items-center gap-2 px-2.5 py-2">
            <button type="button" onClick={() => setShowFullPlayer(true)} className="flex min-w-0 flex-1 items-center gap-3 text-left active:scale-[0.99] transition-transform">
              <span className="size-11 shrink-0 overflow-hidden rounded-xl bg-surface shadow-md ring-1 ring-white/10"><TrackArt src={current.artwork} alt="" /></span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-semibold text-fg">{current.title}</span>
                <span className="block truncate text-xs text-muted">{current.artist}</span>
              </span>
            </button>
            <button type="button" onClick={togglePlay} className="flex size-11 shrink-0 items-center justify-center rounded-full text-primary hover:bg-white/5 active:scale-90 transition-transform" aria-label="Play">
              {isPlaying ? <Pause className="size-5 fill-current" /> : <Play className="size-5 fill-current ml-0.5" />}
            </button>
          </div>
          <div className="h-1 w-full bg-white/5"><div className="h-full bg-primary transition-all duration-150" style={{ width: `${progress}%` }} /></div>
        </div>
      </div>
      <div className="hidden h-[90px] items-center gap-4 px-4 md:flex">
        <button type="button" onClick={() => setShowFullPlayer(true)} className="flex min-w-0 flex-1 items-center gap-3 text-left">
          <span className="size-14 shrink-0 overflow-hidden rounded bg-surface"><TrackArt src={current.artwork} alt="" /></span>
          <span className="min-w-0">
            <span className="block max-w-[14rem] truncate text-sm font-medium">{current.title}</span>
            <span className="block max-w-[14rem] truncate text-xs text-muted">{current.artist}</span>
          </span>
        </button>
        <button type="button" onClick={() => toggleLike(current)} className={cn("size-8", liked ? "text-primary" : "text-muted")}>
          <Heart className={cn("size-4", liked && "fill-current")} />
        </button>
        <div className="flex w-[42%] max-w-xl min-w-[22rem] flex-col items-center gap-2">
          <div className="flex items-center gap-3">
            <button type="button" onClick={toggleShuffle} className={cn("size-8", shuffle ? "text-primary" : "text-muted")}><Shuffle className="size-4" /></button>
            <button type="button" onClick={prev} className="size-8 text-muted" aria-label="Prev"><SkipBack className="size-5 fill-current" /></button>
            <button type="button" onClick={togglePlay} className="flex size-10 items-center justify-center rounded-full bg-fg text-bg" aria-label="Play">
              {isPlaying ? <Pause className="size-4 fill-current" /> : <Play className="size-4 fill-current" />}
            </button>
            <button type="button" onClick={next} className="size-8 text-muted" aria-label="Next"><SkipForward className="size-5 fill-current" /></button>
            <button type="button" onClick={cycleRepeat} className={cn("size-8", repeat !== "off" ? "text-primary" : "text-muted")}><RepeatIcon className="size-4" /></button>
          </div>
          <div className="flex w-full items-center gap-2">
            <span className="w-10 text-right text-[11px] tabular-nums text-subtle">{formatTime(currentTime)}</span>
            <input type="range" min={0} max={duration || 1} step={0.25} value={Math.min(currentTime, duration || 1)} onChange={(e) => seek(Number(e.target.value))} className="seek flex-1" />
            <span className="w-10 text-[11px] tabular-nums text-subtle">{remainingTime ? `-${formatTime(rightTime)}` : formatTime(rightTime)}</span>
          </div>
        </div>
        <div className="flex flex-1 items-center justify-end gap-2">
          <button type="button" onClick={toggleMute} className="text-muted">{isMuted || volume === 0 ? <VolumeX className="size-4" /> : <Volume2 className="size-4" />}</button>
          <input type="range" min={0} max={1} step={0.01} value={isMuted ? 0 : volume} onChange={(e) => setVolume(Number(e.target.value))} className="seek w-24" />
        </div>
      </div>
    </div>
  );
}

const lyricsMem = new Map<string, LyricsPayload>();

export function FullPlayer() {
  const current = useFlowStore((s) => s.current);
  const isPlaying = useFlowStore((s) => s.isPlaying);
  const currentTime = useFlowStore((s) => s.currentTime);
  const duration = useFlowStore((s) => s.duration);
  const remainingTime = useFlowStore((s) => s.settings.remainingTime);
  const queue = useFlowStore((s) => s.queue);
  const show = useFlowStore((s) => s.showFullPlayer);
  const showQueue = useFlowStore((s) => s.showQueue);
  const showLyrics = useFlowStore((s) => s.showLyrics);
  const shuffle = useFlowStore((s) => s.shuffle);
  const repeat = useFlowStore((s) => s.repeat);
  const playbackRate = useFlowStore((s) => s.playbackRate || 1);
  const sleepEndsAt = useFlowStore((s) => s.sleepEndsAt);
  const sleepEndOfTrack = useFlowStore((s) => s.sleepEndOfTrack);
  const settings = useFlowStore((s) => s.settings);
  const patchSettings = useFlowStore((s) => s.patchSettings);
  const lyricsFontSize = settings.lyricsFontSize || "md";
  const autoplayRelated = settings.autoplayRelated ?? true;

  const togglePlay = useFlowStore((s) => s.togglePlay);
  const next = useFlowStore((s) => s.next);
  const prev = useFlowStore((s) => s.prev);
  const seek = useFlowStore((s) => s.seek);
  const skipBy = useFlowStore((s) => s.skipBy);
  const toggleShuffle = useFlowStore((s) => s.toggleShuffle);
  const cycleRepeat = useFlowStore((s) => s.cycleRepeat);
  const setPlaybackRate = useFlowStore((s) => s.setPlaybackRate);
  const setSleep = useFlowStore((s) => s.setSleep);
  const setSleepEndOfTrack = useFlowStore((s) => s.setSleepEndOfTrack);
  const toggleLike = useFlowStore((s) => s.toggleLike);
  const playQueue = useFlowStore((s) => s.playQueue);
  const liked = useFlowStore((s) => (current ? s.liked.some((t) => t.id === current.id) : false));
  const setShowFullPlayer = useFlowStore((s) => s.setShowFullPlayer);
  const setShowQueue = useFlowStore((s) => s.setShowQueue);
  const setShowLyrics = useFlowStore((s) => s.setShowLyrics);
  const setQrTarget = useFlowStore((s) => s.setQrTarget);
  const notify = useFlowStore((s) => s.notify);

  const downloaded = useIsDownloaded(current?.videoId);
  const [busyDl, setBusyDl] = useState(false);
  const [busyQueue, setBusyQueue] = useState(false);
  const [queueProg, setQueueProg] = useState("");
  const [lyrics, setLyrics] = useState<LyricsPayload | null>(null);
  const [lyricsLoading, setLyricsLoading] = useState(false);
  const [showTranslate, setShowTranslate] = useState(false);
  const [translatedLines, setTranslatedLines] = useState<string[]>([]);
  const [translating, setTranslating] = useState(false);
  const [glow, setGlow] = useState<string | null>(null);
  const [sharing, setSharing] = useState(false);
  const [showSleepMenu, setShowSleepMenu] = useState(false);
  const [showEqMenu, setShowEqMenu] = useState(false);
  const [showCarMode, setShowCarMode] = useState(false);
  const [showAudioHud, setShowAudioHud] = useState(false);
  const [showAndroidHub, setShowAndroidHub] = useState(false);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const lyricsBox = useRef<HTMLDivElement | null>(null);

  const { mounted, open } = useOpenTransition(show, 260);

  useEffect(() => {
    setTranslatedLines([]);
    setShowTranslate(false);
  }, [current?.id]);

  useEffect(() => {
    if (!current?.artwork) {
      setGlow(null);
      return;
    }
    let cancelled = false;
    void averageArtworkColor(current.artwork).then((color) => {
      if (!cancelled) setGlow(color);
    });
    return () => {
      cancelled = true;
    };
  }, [current?.artwork]);

  useEffect(() => {
    if (!current || current.isLive) {
      setLyrics(null);
      return;
    }
    const key = current.videoId || current.id;
    const hit = lyricsMem.get(key);
    if (hit) {
      setLyrics(hit);
      return;
    }
    let cancelled = false;
    setLyricsLoading(true);
    void getTrackLyrics({
      data: {
        title: current.title,
        artist: current.artist,
        album: current.album,
        duration: current.duration || duration || undefined,
        videoId: current.videoId,
      },
    })
      .then((res) => {
        if (cancelled) return;
        if (res) {
          lyricsMem.set(key, res);
          setLyrics(res);
        } else {
          setLyrics(null);
        }
      })
      .catch(() => {
        if (!cancelled) setLyrics(null);
      })
      .finally(() => {
        if (!cancelled) setLyricsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [current?.id, current?.videoId, current?.title, current?.artist, current?.album, current?.duration, current?.isLive, duration]);

  const activeIdx = lyrics?.synced
    ? lyrics.lines.reduce((acc, line, i) => (currentTime * 1000 >= line.timeMs ? i : acc), 0)
    : -1;

  useEffect(() => {
    if (activeIdx >= 0 && lyrics?.lines[activeIdx]) {
      notifyNativeLyricLine(lyrics.lines[activeIdx].text, current?.title || "");
    }
    if (!showLyrics || activeIdx < 0) return;
    const root = lyricsBox.current;
    const el = root?.querySelector(`[data-ly="${activeIdx}"]`);
    el?.scrollIntoView({ block: "center", behavior: "smooth" });
  }, [activeIdx, showLyrics, current?.title]);

  if (!mounted || !current) return null;

  const progress = duration > 0 ? Math.min(100, (currentTime / duration) * 100) : 0;
  const rightTime = remainingTime && duration > 0 ? Math.max(0, duration - currentTime) : duration;
  const RepeatIcon = repeat === "one" ? Repeat1 : Repeat;
  const canDownload = canDownloadTrack(current);
  const shareLine =
    (activeIdx >= 0 ? lyrics?.lines[activeIdx]?.text : lyrics?.lines[0]?.text) || current.title;

  const runShare = () => {
    if (sharing) return;
    setSharing(true);
    void shareLyricsCard({ track: current, line: shareLine })
      .then((how) => {
        if (how === "shared") notify("Testo condiviso");
        else if (how === "downloaded") notify("Immagine della card salvata");
        else notify("Testo copiato");
      })
      .catch(() => notify("Condivisione non riuscita"))
      .finally(() => setSharing(false));
  };

  const cycleRate = () => {
    const rates = [1, 1.25, 1.5, 2.0, 0.8];
    const curIdx = rates.indexOf(playbackRate);
    const nextRate = rates[(curIdx + 1) % rates.length];
    setPlaybackRate(nextRate);
    notify(`Velocità: ${nextRate}x`);
  };

  const cycleLyricsFontSize = () => {
    const sizes: ("sm" | "md" | "lg" | "xl")[] = ["sm", "md", "lg", "xl"];
    const curIdx = sizes.indexOf(lyricsFontSize);
    const nextSize = sizes[(curIdx + 1) % sizes.length];
    patchSettings({ lyricsFontSize: nextSize });
    notify(`Carattere testi: ${nextSize.toUpperCase()}`);
  };

  const startRadioMix = async () => {
    if (!current) return;
    try {
      notify("Ricerca correlati YouTube Music…");
      const related = await getRelatedTracks({
        data: { artist: current.artist, title: current.title, excludeId: current.id },
      });
      if (related && related.length) {
        playQueue([current, ...related], 0);
        notify(`Radio avviata (${related.length} brani)`);
      }
    } catch {
      notify("Impossibile avviare la radio");
    }
  };

  const handleTouchStart = (e: TouchEvent) => {
    setTouchStartX(e.touches[0]?.clientX ?? null);
  };

  const handleTouchEnd = (e: TouchEvent) => {
    if (touchStartX === null) return;
    const endX = e.changedTouches[0]?.clientX ?? touchStartX;
    const diff = endX - touchStartX;
    if (Math.abs(diff) > 60) {
      if (diff < 0) next();
      else prev();
    }
    setTouchStartX(null);
  };

  return (
    <div
      className={cn("player-full fixed inset-0 z-50 flex h-dvh flex-col overflow-hidden bg-bg pt-[env(safe-area-inset-top)]", open ? "is-open" : "is-closing")}
      role="dialog"
      style={glow ? ({ ["--player-glow"]: glow } as CSSProperties) : undefined}
    >
      {/* Lyra Dynamic Ambient Glow Background */}
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <img src={current.artwork} alt="" referrerPolicy="no-referrer" className="player-ambient size-full object-cover blur-3xl opacity-45 saturate-200" />
        <div
          className="absolute inset-0"
          style={{
            background: glow
              ? `linear-gradient(180deg, color-mix(in oklab, ${glow} 55%, transparent) 0%, rgb(0 0 0 / 0.6) 40%, rgb(0 0 0 / 0.92) 100%)`
              : "linear-gradient(180deg, rgb(0 0 0 / 0.35) 0%, rgb(0 0 0 / 0.88) 100%)",
          }}
        />
      </div>

      <div className="relative z-10 flex min-h-0 flex-1 flex-col">
        {/* Top Header Bar */}
        <div className="mx-3 mt-1.5 flex items-center justify-between rounded-2xl px-2 py-1 player-glass shadow-lg">
          <button type="button" onClick={() => setShowFullPlayer(false)} className="flex size-11 items-center justify-center rounded-full hover:bg-elevated/60 active:scale-95 transition-transform" aria-label="Chiudi">
            <ChevronDown className="size-6 text-fg" />
          </button>
          <button
            type="button"
            onClick={() => setShowAudioHud(!showAudioHud)}
            className="flex flex-col items-center px-3 py-1 rounded-full hover:bg-white/10 active:scale-95 transition-all cursor-pointer"
            title="Specifiche Audio Hi-Res & Codec"
          >
            <p className="text-[10px] font-bold tracking-widest text-muted uppercase">In Riproduzione</p>
            <span className="flex items-center gap-1.5 text-[11px] font-bold text-primary">
              <span className="size-1.5 rounded-full bg-primary animate-pulse" />
              Hi-Res · Opus 320k
            </span>
          </button>
          <div className="flex items-center gap-0.5">
            <button
              type="button"
              onClick={() => setShowCarMode(true)}
              className="flex size-10 items-center justify-center rounded-full text-fg/80 hover:text-primary hover:bg-elevated/60 transition-colors"
              title="Modalità Guida / Car View"
              aria-label="Modalità Guida"
            >
              <Car className="size-4" />
            </button>
            {showLyrics && (
              <>
                <button
                  type="button"
                  onClick={() => {
                    if (showTranslate) {
                      setShowTranslate(false);
                      return;
                    }
                    setShowTranslate(true);
                    if (translatedLines.length || !lyrics?.lines.length) return;
                    setTranslating(true);
                    void getTranslatedLyrics({
                      data: {
                        lines: lyrics.lines.map((l) => l.text),
                        targetLang: "it",
                      },
                    })
                      .then((res) => {
                        if (res && res.length) setTranslatedLines(res);
                      })
                      .finally(() => setTranslating(false));
                  }}
                  className={cn(
                    "flex size-10 items-center justify-center rounded-full transition-colors text-xs font-bold",
                    showTranslate ? "text-primary bg-primary/15" : "text-fg/80 hover:text-primary hover:bg-elevated/60",
                  )}
                  title="Traduci testi in italiano"
                >
                  <Languages className="size-4" />
                </button>
                <button
                  type="button"
                  onClick={cycleLyricsFontSize}
                  className="flex size-10 items-center justify-center rounded-full text-fg/80 hover:text-primary hover:bg-elevated/60 transition-colors text-xs font-bold"
                  title="Cambia dimensione caratteri"
                >
                  <Type className="size-4" />
                </button>
              </>
            )}
            <button
              type="button"
              onClick={() => {
                setQrTarget({
                  title: current.title,
                  subtitle: current.artist,
                  url: `${window.location.origin}/?track=${current.videoId || current.id}`,
                  artwork: current.artwork,
                });
              }}
              className="flex size-10 items-center justify-center rounded-full text-fg/80 hover:text-primary hover:bg-elevated/60 transition-colors"
              title="Condividi con QR Code"
              aria-label="QR Code"
            >
              <QrCode className="size-4" />
            </button>
            <button
              type="button"
              onClick={runShare}
              disabled={sharing}
              className={cn("flex size-10 items-center justify-center rounded-full transition-colors", sharing ? "text-primary" : "text-fg/80 hover:text-primary hover:bg-elevated/60")}
              aria-label="Condividi testo"
            >
              <Share2 className="size-4" />
            </button>
            <button
              type="button"
              onClick={() => {
                setShowQueue(false);
                setShowLyrics(!showLyrics);
              }}
              className={cn("flex size-10 items-center justify-center rounded-full transition-colors", showLyrics ? "text-primary bg-primary/15" : "text-fg/80 hover:text-primary hover:bg-elevated/60")}
              aria-label="Testi"
            >
              <Mic2 className="size-4" />
            </button>
            <button
              type="button"
              onClick={() => {
                setShowLyrics(false);
                setShowQueue(!showQueue);
              }}
              className={cn("flex size-10 items-center justify-center rounded-full transition-colors", showQueue ? "text-primary bg-primary/15" : "text-fg/80 hover:text-primary hover:bg-elevated/60")}
              aria-label="Coda"
            >
              <ListMusic className="size-4" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        {showQueue ? (
          <div className="min-h-0 flex-1 overflow-y-auto px-3 pb-8 pt-2">
            <div className="sticky top-0 z-10 mb-3 flex items-center justify-between rounded-2xl px-3.5 py-2.5 player-glass shadow-lg">
              <div>
                <p className="text-sm font-bold text-fg">In Coda · {queue.length} brani</p>
                <p className="text-[11px] text-muted">{autoplayRelated ? "Autoplay YouTube Music attivo" : "Autoplay disattivato"}</p>
              </div>
              <button
                type="button"
                disabled={busyQueue || !queue.some(canDownloadTrack)}
                onClick={() => {
                  setBusyQueue(true);
                  setQueueProg("");
                  void downloadTracks(queue, (done, total) => setQueueProg(`${done}/${total}`))
                    .then((r) => {
                      const saved = r.ok + r.skipped;
                      notify(r.fail ? `Salvati ${saved}, ${r.fail} errori` : `${saved} brani salvati in cache`);
                    })
                    .catch(() => notify("Download coda non riuscito"))
                    .finally(() => {
                      setBusyQueue(false);
                      setQueueProg("");
                    });
                }}
                className="h-9 rounded-full bg-primary px-4 text-xs font-bold text-primary-fg shadow-md disabled:opacity-50 active:scale-95 transition-transform"
              >
                {busyQueue ? queueProg || "Salvataggio…" : "Salva tutta la coda"}
              </button>
            </div>
            <div className="space-y-1">
              {queue.map((t, i) => (
                <TrackRow key={`${t.id}-${i}`} track={t} queue={queue} index={i} showIndex />
              ))}
            </div>
          </div>
        ) : (
          <div className="flex min-h-0 flex-1 flex-col px-5 pb-3">
            {showLyrics ? (
              <div ref={lyricsBox} className="player-glass mx-auto mt-2 min-h-0 w-full max-w-lg flex-1 overflow-y-auto rounded-3xl px-4 py-6 text-center space-y-3.5 shadow-2xl">
                {lyricsLoading ? (
                  <div className="flex flex-col items-center justify-center py-16 text-muted">
                    <div className="size-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                    <p className="mt-4 text-sm font-semibold">Caricamento testi LRCLIB…</p>
                  </div>
                ) : !lyrics?.lines.length ? (
                  <div className="flex flex-col items-center justify-center py-16 text-muted">
                    <Mic2 className="size-12 opacity-25" />
                    <p className="mt-3 text-base font-bold text-fg">Testo non disponibile</p>
                    <p className="mt-1 text-xs text-subtle">Nessun testo sincronizzato trovato per questo brano.</p>
                  </div>
                ) : (
                  lyrics.lines.map((line, i) => {
                    const isCur = i === activeIdx;
                    const isPast = i < activeIdx;
                    const sizeStyle =
                      lyricsFontSize === "sm"
                        ? isCur ? "text-lg font-bold py-1.5" : "text-sm py-1"
                        : lyricsFontSize === "lg"
                        ? isCur ? "text-2xl font-extrabold py-3" : "text-lg py-1.5"
                        : lyricsFontSize === "xl"
                        ? isCur ? "text-3xl font-black py-3.5" : "text-xl py-2"
                        : isCur ? "text-xl font-extrabold py-2" : "text-base py-1.5";

                    return (
                      <button
                        key={`${line.timeMs}-${i}`}
                        type="button"
                        data-ly={i}
                        onClick={() => lyrics.synced && seek(line.timeMs / 1000)}
                        className={cn(
                          "block w-full text-center leading-snug transition-all rounded-xl cursor-pointer select-none",
                          sizeStyle,
                          isCur
                            ? "scale-105 text-primary font-black drop-shadow-md"
                            : isPast
                            ? "text-fg/80 font-medium"
                            : "text-muted/60 hover:text-fg/90",
                        )}
                      >
                        <span className="block">{line.text}</span>
                        {showTranslate && translatedLines[i] && (
                          <span className="block text-xs font-medium text-emerald-400/90 mt-1 tracking-wide animate-in fade-in duration-200">
                            {translatedLines[i]}
                          </span>
                        )}
                      </button>
                    );
                  })
                )}
              </div>
            ) : (
              <div
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
                className="flex min-h-0 flex-1 flex-col items-center justify-center py-2"
              >
                <div className="player-art-float relative aspect-square w-[min(100%-1rem,21rem)] overflow-hidden rounded-3xl bg-surface shadow-2xl ring-1 ring-white/15">
                  <TrackArt src={current.artwork} alt={current.title} />
                  <div className="pointer-events-none absolute inset-0" aria-hidden />
                </div>

                {/* Live Neon Audio Visualizer */}
                <div className="mt-3 flex items-center justify-center">
                  <AudioVisualizer barCount={28} />
                </div>
              </div>
            )}

            {/* Flow Material You Meta & Controls Glass Island */}
            <div className="player-glass mt-auto rounded-3xl px-5 pt-4 pb-[max(1.1rem,env(safe-area-inset-bottom))] shadow-2xl">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <h1 className="truncate text-xl font-bold tracking-tight text-fg md:text-2xl">{current.title}</h1>
                  <p className="mt-0.5 truncate text-sm font-medium text-muted">{current.artist}</p>
                </div>
                <div className="flex items-center gap-1">
                  {canDownload ? (
                    <button
                      type="button"
                      disabled={busyDl}
                      onClick={() => {
                        if (!current.videoId) return;
                        setBusyDl(true);
                        const op = downloaded ? removeDownload(current.videoId) : downloadTrack(current);
                        void op
                          .then(() => notify(downloaded ? "Download rimosso" : "Brano salvato offline"))
                          .catch(() => notify("Download non riuscito"))
                          .finally(() => setBusyDl(false));
                      }}
                      className={cn("size-10 flex items-center justify-center rounded-full text-muted hover:text-fg transition-colors", downloaded && "text-primary")}
                      aria-label={downloaded ? "Rimuovi download" : "Scarica"}
                    >
                      <Download className="size-5" />
                    </button>
                  ) : null}
                  <button
                    type="button"
                    onClick={() => toggleLike(current)}
                    className={cn("size-10 flex items-center justify-center rounded-full transition-transform active:scale-125", liked ? "text-primary" : "text-muted hover:text-fg")}
                    aria-label="Mi piace"
                  >
                    <Heart className={cn("size-6", liked && "fill-current text-primary")} />
                  </button>
                </div>
              </div>

              {/* Material You Waveform / Scrubbing Seekbar */}
              <div className="mt-4">
                <input
                  type="range"
                  min={0}
                  max={duration || 1}
                  step={0.25}
                  value={Math.min(currentTime, duration || 1)}
                  onChange={(e) => seek(Number(e.target.value))}
                  className="h-2 w-full appearance-none rounded-full bg-elevated cursor-pointer accent-primary"
                  style={{
                    background: `linear-gradient(to right, var(--color-primary) ${progress}%, rgb(255 255 255 / 0.16) ${progress}%)`,
                  }}
                />
                <div className="mt-1 flex justify-between text-xs tabular-nums text-subtle font-medium">
                  <span>{formatTime(currentTime)}</span>
                  <span>{remainingTime ? `-${formatTime(rightTime)}` : formatTime(rightTime)}</span>
                </div>
              </div>

              {/* Lyra Main Control Bar */}
              <div className="mt-2 flex items-center justify-between">
                <button
                  type="button"
                  onClick={toggleShuffle}
                  className={cn("size-10 flex items-center justify-center rounded-full transition-colors", shuffle ? "text-primary" : "text-muted hover:text-fg")}
                  aria-label="Shuffle"
                >
                  <Shuffle className="size-5" />
                </button>

                <button
                  type="button"
                  onClick={() => skipBy(-10)}
                  className="size-10 flex items-center justify-center rounded-full text-muted hover:text-fg active:scale-95 transition-transform"
                  aria-label="Indietro 10 secondi"
                  title="-10s"
                >
                  <RotateCcw className="size-4" />
                </button>

                <button
                  type="button"
                  onClick={prev}
                  className="size-11 flex items-center justify-center rounded-full text-fg hover:bg-elevated/50 active:scale-95 transition-transform"
                  aria-label="Brano precedente"
                >
                  <SkipBack className="size-6 fill-current" />
                </button>

                <button
                  type="button"
                  onClick={togglePlay}
                  className="flex size-16 items-center justify-center rounded-full bg-primary text-primary-fg shadow-xl transition-transform active:scale-90 hover:scale-105"
                  aria-label="Play/Pausa"
                >
                  {isPlaying ? <Pause className="size-7 fill-current" /> : <Play className="size-7 fill-current ml-0.5" />}
                </button>

                <button
                  type="button"
                  onClick={next}
                  className="size-11 flex items-center justify-center rounded-full text-fg hover:bg-elevated/50 active:scale-95 transition-transform"
                  aria-label="Brano successivo"
                >
                  <SkipForward className="size-6 fill-current" />
                </button>

                <button
                  type="button"
                  onClick={() => skipBy(10)}
                  className="size-10 flex items-center justify-center rounded-full text-muted hover:text-fg active:scale-95 transition-transform"
                  aria-label="Avanti 10 secondi"
                  title="+10s"
                >
                  <RotateCw className="size-4" />
                </button>

                <button
                  type="button"
                  onClick={cycleRepeat}
                  className={cn("size-10 flex items-center justify-center rounded-full transition-colors", repeat !== "off" ? "text-primary" : "text-muted hover:text-fg")}
                  aria-label="Ripeti"
                >
                  <RepeatIcon className="size-5" />
                </button>
              </div>

              {/* Bottom Quick Tools Dock */}
              <div className="mt-3 flex items-center justify-between border-t border-white/10 pt-2.5 text-xs text-muted">
                {/* Equalizer Button */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => {
                      setShowEqMenu(!showEqMenu);
                      setShowSleepMenu(false);
                    }}
                    className={cn(
                      "flex items-center gap-1.5 rounded-full bg-elevated/70 px-3 py-1 font-semibold hover:text-fg transition-colors",
                      settings.eqPreset !== "flat" && "text-primary bg-primary/10",
                    )}
                  >
                    <Sliders className="size-3.5" />
                    EQ
                  </button>
                  {showEqMenu && (
                    <div className="absolute bottom-9 left-0 z-50 min-w-48 rounded-2xl bg-elevated/95 p-2 shadow-2xl backdrop-blur-xl ring-1 ring-border text-xs space-y-1">
                      <p className="px-2 py-1 font-bold text-muted uppercase tracking-wider text-[10px]">Preset Equalizzatore</p>
                      {EQ_PRESETS.map((p) => (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => {
                            patchSettings({ eqPreset: p.id, eqBass: p.bass, eqTreble: p.treble });
                            setShowEqMenu(false);
                            notify(`Equalizzatore: ${p.label}`);
                          }}
                          className={cn(
                            "flex w-full items-center justify-between rounded-xl px-2.5 py-1.5 text-left font-medium hover:bg-surface active:bg-primary active:text-primary-fg",
                            settings.eqPreset === p.id && "text-primary font-bold bg-primary/10",
                          )}
                        >
                          <span>{p.label}</span>
                          {settings.eqPreset === p.id && <Check className="size-3.5 text-primary" />}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Speed Switcher */}
                <button
                  type="button"
                  onClick={cycleRate}
                  className="flex items-center gap-1.5 rounded-full bg-elevated/70 px-3 py-1 font-semibold hover:text-fg transition-colors"
                >
                  <Gauge className="size-3.5" />
                  {playbackRate}x
                </button>

                {/* Sleep Timer */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => {
                      setShowSleepMenu(!showSleepMenu);
                      setShowEqMenu(false);
                    }}
                    className={cn(
                      "flex items-center gap-1.5 rounded-full bg-elevated/70 px-3 py-1 font-semibold hover:text-fg transition-colors",
                      (sleepEndsAt || sleepEndOfTrack) && "text-primary bg-primary/10",
                    )}
                  >
                    <Moon className="size-3.5" />
                    {sleepEndOfTrack ? "Fine brano" : sleepEndsAt ? "Timer attivo" : "Timer"}
                  </button>
                  {showSleepMenu && (
                    <div className="absolute bottom-9 right-0 z-50 min-w-44 rounded-2xl bg-elevated/95 p-2 shadow-2xl backdrop-blur-xl ring-1 ring-border text-xs space-y-1">
                      <p className="px-2 py-1 font-bold text-muted uppercase tracking-wider text-[10px]">Timer di spegnimento</p>
                      <button
                        type="button"
                        onClick={() => {
                          setSleep(null);
                          setSleepEndOfTrack(false);
                          setShowSleepMenu(false);
                          notify("Timer disattivato");
                        }}
                        className="block w-full rounded-xl px-2.5 py-1.5 text-left font-medium hover:bg-surface"
                      >
                        Disattivato
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setSleepEndOfTrack(true);
                          setShowSleepMenu(false);
                          notify("Timer: spegnimento al termine del brano");
                        }}
                        className={cn(
                          "block w-full rounded-xl px-2.5 py-1.5 text-left font-medium hover:bg-surface",
                          sleepEndOfTrack && "text-primary font-bold bg-primary/10",
                        )}
                      >
                        Al termine del brano 🌙
                      </button>
                      {[
                        [15, "15 minuti"],
                        [30, "30 minuti"],
                        [45, "45 minuti"],
                        [60, "1 ora"],
                      ].map(([mins, label]) => (
                        <button
                          key={String(mins)}
                          type="button"
                          onClick={() => {
                            setSleep(mins as number);
                            setShowSleepMenu(false);
                            notify(`Timer impostato su ${label}`);
                          }}
                          className="block w-full rounded-xl px-2.5 py-1.5 text-left font-medium hover:bg-surface"
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Radio Button */}
                <button
                  type="button"
                  onClick={() => void startRadioMix()}
                  className="flex items-center gap-1.5 rounded-full bg-elevated/70 px-3 py-1 font-semibold hover:text-fg transition-colors text-primary"
                >
                  <Radio className="size-3.5" />
                  Radio
                </button>

                {/* Android Native Features Hub */}
                <button
                  type="button"
                  onClick={() => setShowAndroidHub(true)}
                  className="flex items-center gap-1.5 rounded-full bg-emerald-500/15 text-emerald-400 px-3 py-1 font-semibold hover:bg-emerald-500/25 transition-colors"
                >
                  <Smartphone className="size-3.5" />
                  Android
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Android Power Hub Modal */}
      <AndroidPowerHubModal
        isOpen={showAndroidHub}
        onClose={() => setShowAndroidHub(false)}
      />

      {/* Audio Quality & DSP Specs HUD Modal */}
      {showAudioHud && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-md animate-in fade-in duration-200"
          onClick={() => setShowAudioHud(false)}
        >
          <div
            className="relative w-full max-w-sm rounded-3xl bg-[#141720] p-6 shadow-2xl ring-1 ring-white/10 text-fg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="size-5 text-primary" />
                <h3 className="font-heading text-sm font-bold uppercase tracking-wider text-fg">Flow Hi-Fi Audio Engine</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAudioHud(false)}
                className="text-xs font-bold text-muted hover:text-fg"
              >
                Chiudi
              </button>
            </div>

            <div className="mt-4 space-y-2.5 text-xs">
              <div className="flex justify-between rounded-xl bg-surface/60 p-2.5">
                <span className="text-muted">Codec Audio</span>
                <span className="font-bold text-primary">Opus 48kHz (Stream Hi-Fi)</span>
              </div>
              <div className="flex justify-between rounded-xl bg-surface/60 p-2.5">
                <span className="text-muted">Bitrate Massimo</span>
                <span className="font-bold text-fg">320 kbps VBR Lossless Container</span>
              </div>
              <div className="flex justify-between rounded-xl bg-surface/60 p-2.5">
                <span className="text-muted">Profondità Campionamento</span>
                <span className="font-bold text-fg">24-bit / 48.000 Hz</span>
              </div>
              <div className="flex justify-between rounded-xl bg-surface/60 p-2.5">
                <span className="text-muted">Normalizzazione EBU R128</span>
                <span className="font-bold text-emerald-400">Attiva (-14 LUFS)</span>
              </div>
              <div className="flex justify-between rounded-xl bg-surface/60 p-2.5">
                <span className="text-muted">Preset Equalizzatore DSP</span>
                <span className="font-bold text-primary uppercase">{settings.eqPreset}</span>
              </div>
              <div className="flex justify-between rounded-xl bg-surface/60 p-2.5">
                <span className="text-muted">Crossfade Intelligente</span>
                <span className="font-bold text-fg">{settings.crossfade} secondi</span>
              </div>
            </div>

            <div className="mt-4 rounded-xl bg-primary/10 p-3 text-center text-[11px] text-primary font-medium">
              ✨ Motore DSP Web Audio a bassissima latenza con buffering dinamico
            </div>
          </div>
        </div>
      )}

      {/* Car Mode / Driving Interface */}
      {showCarMode && (
        <div className="fixed inset-0 z-50 flex flex-col justify-between bg-black p-6 text-fg animate-in zoom-in-95 duration-200 select-none">
          {/* Top Bar */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Car className="size-6 text-primary" />
              <span className="text-sm font-bold uppercase tracking-widest text-primary">Modalità Guida</span>
            </div>
            <button
              type="button"
              onClick={() => setShowCarMode(false)}
              className="rounded-full bg-surface/80 px-4 py-2 text-xs font-bold text-fg hover:bg-surface"
            >
              Esci dalla Guida
            </button>
          </div>

          {/* Song Info */}
          <div className="flex flex-col items-center text-center my-auto">
            <div className="size-48 overflow-hidden rounded-3xl bg-surface shadow-2xl ring-2 ring-white/10 mb-6">
              <TrackArt src={current.artwork} alt={current.title} />
            </div>
            <h2 className="text-2xl font-black text-fg max-w-sm truncate">{current.title}</h2>
            <p className="text-base font-bold text-muted mt-1 max-w-sm truncate">{current.artist}</p>
          </div>

          {/* Massive Driving Controls */}
          <div className="flex items-center justify-center gap-8 pb-8">
            <button
              type="button"
              onClick={prev}
              className="flex size-18 items-center justify-center rounded-full bg-surface text-fg hover:bg-elevated active:scale-90 transition-transform"
              aria-label="Precedente"
            >
              <SkipBack className="size-8 fill-current" />
            </button>

            <button
              type="button"
              onClick={togglePlay}
              className="flex size-24 items-center justify-center rounded-full bg-primary text-primary-fg shadow-2xl shadow-primary/30 hover:scale-105 active:scale-90 transition-transform"
              aria-label={isPlaying ? "Pausa" : "Riproduci"}
            >
              {isPlaying ? <Pause className="size-12 fill-current" /> : <Play className="size-12 fill-current ml-1" />}
            </button>

            <button
              type="button"
              onClick={next}
              className="flex size-18 items-center justify-center rounded-full bg-surface text-fg hover:bg-elevated active:scale-90 transition-transform"
              aria-label="Successivo"
            >
              <SkipForward className="size-8 fill-current" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
