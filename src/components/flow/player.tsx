import { useEffect, useMemo, useRef, useState } from "react";
import {
  ChevronDown,
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
  Shuffle,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
} from "lucide-react";
import { cn, formatTime, useOpenTransition } from "@/lib/utils";
import { useFlowStore } from "@/stores/flow-store";
import { TrackArt, TrackRow } from "./tracks";
import { bindLockScreenActions, pushLockScreen } from "@/lib/music/lock-screen";
import { bindAudioFocus, claimAudioFocus, markPlayingForFocus } from "@/lib/music/audio-focus";
import { showAndroidNowPlaying } from "@/lib/music/android-bg";
import { cachedAudioUrl, loadLocalAudio, prefetchAudio } from "@/lib/music/offline-audio";
import { getTrackLyrics, type LyricLine } from "@/lib/music/lyrics";
import { getRelatedTracks } from "@/lib/music/catalog";
import type { Track } from "@/lib/music/types";

function fallbackSrc(track: { source?: string; videoId?: string; streamUrl?: string }) {
  if (track.source === "radio" && track.streamUrl) return track.streamUrl;
  if (track.videoId) return cachedAudioUrl(track.videoId) || `/api/stream?v=${track.videoId}`;
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
  const primed = useRef("");
  const wakeRef = useRef<WakeLockSentinel | null>(null);

  const applySrc = (audio: HTMLAudioElement, src: string, play: boolean, force = false) => {
    if (!src) return;
    const going = !audio.paused && audio.currentTime > 0.4;
    const toBlob = src.startsWith("blob:");
    const fromNet = lastSrc.current.includes("/api/stream");
    if (!force && going && lastSrc.current && lastSrc.current !== src && !(toBlob && fromNet)) return;
    if (lastSrc.current !== src) {
      const keep = audio.currentTime || 0;
      lastSrc.current = src;
      audio.src = src;
      audio.load();
      if (keep > 0.4) {
        audio.addEventListener(
          "loadedmetadata",
          () => {
            try {
              audio.currentTime = keep;
            } catch {
              /* ignore */
            }
            if (play || useFlowStore.getState().isPlaying) void audio.play().catch(() => {});
          },
          { once: true },
        );
      }
    }
    applyOutput(audio);
    if (play) void audio.play().catch(() => {});
  };

  const armLocal = (id: string) => {
    if (!id || primed.current === id) return;
    primed.current = id;
    void loadLocalAudio(id)
      .then((url) => {
        const audio = audioRef.current;
        const s = useFlowStore.getState();
        if (!audio || s.current?.videoId !== id) return;
        if (String(audio.src).startsWith("blob:")) return;
        applySrc(audio, url, s.isPlaying, true);
      })
      .catch(() => {
        if (primed.current === id) primed.current = "";
      });
  };

  const recover = (id: string, time: number) => {
    const audio = audioRef.current;
    if (!audio || recovering.current === id) return;
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
    claimAudioFocus();
    bindLockScreenActions({
      play: () => useFlowStore.getState().resume(),
      pause: () => useFlowStore.getState().pause(),
      prev: () => useFlowStore.getState().prev(),
      next: () => useFlowStore.getState().next(),
      seek: (t) => useFlowStore.getState().seek(t),
      skip: (d) => useFlowStore.getState().skipBy(d),
      stop: () => useFlowStore.getState().pause(),
    });
    return bindAudioFocus({
      onLost: () => {
        if (document.hidden) return;
        useFlowStore.getState().pause();
      },
      onGained: () => {
        const s = useFlowStore.getState();
        if (s.current) s.resume();
      },
    });
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !current) return;
    recovering.current = "";
    primed.current = "";
    lastMove.current = Date.now();
    lastPos.current = 0;
    if (current.duration && current.duration > 0) setDuration(current.duration);
    else setDuration(0);
    const wantPlay = useFlowStore.getState().isPlaying;
    applySrc(audio, fallbackSrc(current), wantPlay, true);
    claimAudioFocus();
    if (wantPlay) {
      markPlayingForFocus(true);
      showAndroidNowPlaying(current);
    }
    pushLockScreen(current, wantPlay, 0, current.duration || 0, 1);
    if (current.videoId) armLocal(current.videoId);
    const nxt = useFlowStore.getState().queue[1];
    if (nxt?.videoId) prefetchAudio(nxt.videoId);
  }, [current?.id, current?.videoId, current?.streamUrl, setDuration]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    markPlayingForFocus(isPlaying);
    claimAudioFocus();
    applyOutput(audio);
    if (isPlaying) {
      void audio.play().catch(() => {});
      if (current?.videoId) armLocal(current.videoId);
      if ("wakeLock" in navigator) {
        void navigator.wakeLock.request("screen").then((lock) => {
          wakeRef.current = lock;
        }).catch(() => {});
      }
    } else {
      audio.pause();
      void wakeRef.current?.release().catch(() => {});
      wakeRef.current = null;
    }
    if (current) pushLockScreen(current, isPlaying, audio.currentTime || 0, audio.duration || 0, 1);
  }, [isPlaying, current]);

  useEffect(() => {
    const audio = audioRef.current;
    if (audio) applyOutput(audio);
  }, [volume, isMuted, voiceDuck, playbackRate, normalize]);

  useEffect(() => {
    if (seekVersion === lastSeek.current) return;
    lastSeek.current = seekVersion;
    const audio = audioRef.current;
    if (!audio) return;
    if (Math.abs(audio.currentTime - currentTime) > 0.4) audio.currentTime = currentTime;
  }, [seekVersion, currentTime]);

  useEffect(() => {
    const kick = () => {
      const audio = audioRef.current;
      const s = useFlowStore.getState();
      if (!audio || !s.isPlaying || !s.current) return;
      claimAudioFocus();
      if (document.hidden && s.current.videoId) {
        const blob = cachedAudioUrl(s.current.videoId);
        if (blob && !String(audio.src).startsWith("blob:")) applySrc(audio, blob, true, true);
      }
      if (audio.paused) void audio.play().catch(() => {});
      const t = audio.currentTime || 0;
      if (t > lastPos.current + 0.15) {
        lastPos.current = t;
        lastMove.current = Date.now();
        if (s.current.videoId) armLocal(s.current.videoId);
        return;
      }
      if (Date.now() - lastMove.current > 2500 && s.current.videoId && !String(audio.src).startsWith("blob:")) {
        recover(s.current.videoId, t || s.currentTime);
      }
    };
    document.addEventListener("visibilitychange", kick);
    window.addEventListener("pageshow", kick);
    window.addEventListener("focus", kick);
    window.addEventListener("freeze", kick);
    window.addEventListener("resume", kick);
    const watchdog = window.setInterval(kick, 1500);
    return () => {
      document.removeEventListener("visibilitychange", kick);
      window.removeEventListener("pageshow", kick);
      window.removeEventListener("focus", kick);
      window.removeEventListener("freeze", kick);
      window.removeEventListener("resume", kick);
      window.clearInterval(watchdog);
    };
  }, []);

  return (
    <audio
      ref={audioRef}
      playsInline
      preload="auto"
      className="pointer-events-none fixed bottom-0 left-0 h-px w-px opacity-[0.01]"
      onTimeUpdate={(e) => {
        const el = e.currentTarget;
        const t = el.currentTime;
        if (!Number.isFinite(t)) return;
        setCurrentTime(t);
        if (t > lastPos.current) {
          lastPos.current = t;
          lastMove.current = Date.now();
        }
        const track = useFlowStore.getState().current;
        if (track) pushLockScreen(track, !el.paused, t, el.duration || 0, 1);
      }}
      onDurationChange={(e) => {
        const d = e.currentTarget.duration;
        if (Number.isFinite(d) && d > 0) setDuration(d);
      }}
      onPlaying={() => {
        lastMove.current = Date.now();
        const track = useFlowStore.getState().current;
        if (track) {
          markPlayingForFocus(true);
          pushLockScreen(track, true, audioRef.current?.currentTime || 0, audioRef.current?.duration || 0, 1);
          if (track.videoId) armLocal(track.videoId);
        }
      }}
      onPause={() => {
        const s = useFlowStore.getState();
        if (s.isPlaying) void audioRef.current?.play().catch(() => {});
      }}
      onWaiting={() => {
        const s = useFlowStore.getState();
        if (s.isPlaying && s.current?.videoId) recover(s.current.videoId, audioRef.current?.currentTime || s.currentTime);
      }}
      onError={() => {
        const s = useFlowStore.getState();
        const id = s.current?.videoId;
        const audio = audioRef.current;
        if (!id || !audio) return;
        const blob = cachedAudioUrl(id);
        if (blob) applySrc(audio, blob, s.isPlaying, true);
        else if (!audio.src.includes("/api/stream")) applySrc(audio, `/api/stream?v=${id}`, s.isPlaying, true);
        else if (s.isPlaying) recover(id, s.currentTime);
      }}
      onStalled={() => {
        const s = useFlowStore.getState();
        if (s.isPlaying && s.current?.videoId) recover(s.current.videoId, audioRef.current?.currentTime || s.currentTime);
      }}
      onEnded={onEnded}
    />
  );
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
    <div className={cn("now-bar pointer-events-auto bg-elevated md:bg-bg", (!open || showFull) && "is-away")}>
      <div className="md:hidden">
        <div className="mx-2 mb-1 overflow-hidden rounded-lg bg-elevated">
          <div className="flex items-center gap-2 px-2 py-1.5">
            <button type="button" onClick={() => setShowFullPlayer(true)} className="flex min-w-0 flex-1 items-center gap-3 text-left">
              <span className="size-11 shrink-0 overflow-hidden rounded-md bg-surface"><TrackArt src={current.artwork} alt="" /></span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium">{current.title}</span>
                <span className="block truncate text-xs text-muted">{current.artist}</span>
              </span>
            </button>
            <button type="button" onClick={togglePlay} className="flex size-11 items-center justify-center" aria-label="Play">
              {isPlaying ? <Pause className="size-5 fill-current" /> : <Play className="size-5 fill-current" />}
            </button>
          </div>
          <div className="h-0.5 w-full bg-subtle/40"><div className="h-full bg-primary" style={{ width: `${progress}%` }} /></div>
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

function LyricsView({
  track,
  currentTime,
  onSeek,
}: {
  track: Track;
  currentTime: number;
  onSeek: (time: number) => void;
}) {
  const [lyrics, setLyrics] = useState<LyricLine[] | null>(null);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const activeLineRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    let unmounted = false;
    setLoading(true);
    setLyrics(null);
    getTrackLyrics({
      data: {
        title: track.title,
        artist: track.artist,
        duration: track.duration,
        videoId: track.videoId,
      },
    })
      .then((res) => {
        if (!unmounted) {
          setLyrics(res && res.length ? res : []);
          setLoading(false);
        }
      })
      .catch(() => {
        if (!unmounted) {
          setLyrics([]);
          setLoading(false);
        }
      });
    return () => {
      unmounted = true;
    };
  }, [track.id, track.title, track.artist, track.duration, track.videoId]);

  const currentMs = currentTime * 1000;
  const activeIndex = useMemo(() => {
    if (!lyrics || !lyrics.length) return -1;
    let idx = -1;
    for (let i = 0; i < lyrics.length; i++) {
      if (lyrics[i].timeMs <= currentMs + 250) {
        idx = i;
      } else {
        break;
      }
    }
    return idx;
  }, [lyrics, currentMs]);

  useEffect(() => {
    if (activeLineRef.current && scrollRef.current) {
      activeLineRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [activeIndex]);

  if (loading) {
    return (
      <div className="flex min-h-0 flex-1 flex-col items-center justify-center p-6 text-center text-muted">
        <div className="size-7 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        <p className="mt-4 text-sm font-medium">Caricamento testi sincronizzati (LRCLIB)…</p>
      </div>
    );
  }

  if (!lyrics || !lyrics.length) {
    return (
      <div className="flex min-h-0 flex-1 flex-col items-center justify-center p-6 text-center text-muted">
        <Mic2 className="size-14 opacity-25" />
        <p className="mt-3 text-base font-semibold text-fg">Testo non disponibile</p>
        <p className="mt-1 max-w-xs text-xs text-subtle">
          Nessun testo trovato per questo brano. Riprova più tardi o cerca un'altra versione.
        </p>
      </div>
    );
  }

  return (
    <div ref={scrollRef} className="scrollbar-none min-h-0 flex-1 overflow-y-auto px-4 py-8 space-y-5 text-center">
      {lyrics.map((line, idx) => {
        const isActive = idx === activeIndex;
        const isPast = idx < activeIndex;
        return (
          <button
            key={`${line.timeMs}-${idx}`}
            ref={isActive ? activeLineRef : undefined}
            type="button"
            onClick={() => onSeek(line.timeMs / 1000)}
            className={cn(
              "block w-full py-2 transition-all rounded-lg cursor-pointer text-center select-none",
              isActive
                ? "scale-105 text-primary text-xl font-extrabold"
                : isPast
                ? "text-fg/80 text-base font-medium"
                : "text-muted/50 text-base hover:text-fg/80"
            )}
          >
            {line.text}
          </button>
        );
      })}
    </div>
  );
}

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
  const togglePlay = useFlowStore((s) => s.togglePlay);
  const next = useFlowStore((s) => s.next);
  const prev = useFlowStore((s) => s.prev);
  const seek = useFlowStore((s) => s.seek);
  const toggleShuffle = useFlowStore((s) => s.toggleShuffle);
  const cycleRepeat = useFlowStore((s) => s.cycleRepeat);
  const setPlaybackRate = useFlowStore((s) => s.setPlaybackRate);
  const setSleep = useFlowStore((s) => s.setSleep);
  const toggleLike = useFlowStore((s) => s.toggleLike);
  const playQueue = useFlowStore((s) => s.playQueue);
  const liked = useFlowStore((s) => (current ? s.liked.some((t) => t.id === current.id) : false));
  const setShowFullPlayer = useFlowStore((s) => s.setShowFullPlayer);
  const setShowQueue = useFlowStore((s) => s.setShowQueue);
  const setShowLyrics = useFlowStore((s) => s.setShowLyrics);
  const [showSleepMenu, setShowSleepMenu] = useState(false);

  const { mounted, open } = useOpenTransition(show, 260);
  if (!mounted || !current) return null;

  const progress = duration > 0 ? Math.min(100, (currentTime / duration) * 100) : 0;
  const rightTime = remainingTime && duration > 0 ? Math.max(0, duration - currentTime) : duration;
  const RepeatIcon = repeat === "one" ? Repeat1 : Repeat;

  const cycleRate = () => {
    const rates = [1, 1.25, 1.5, 0.8];
    const curIdx = rates.indexOf(playbackRate);
    const nextRate = rates[(curIdx + 1) % rates.length];
    setPlaybackRate(nextRate);
  };

  const startRadioMix = async () => {
    if (!current) return;
    try {
      const related = await getRelatedTracks({
        data: { artist: current.artist, title: current.title, excludeId: current.id },
      });
      if (related && related.length) {
        playQueue([current, ...related], 0);
      }
    } catch {
      /* ignore */
    }
  };

  return (
    <div
      className={cn(
        "player-full fixed inset-0 z-50 flex h-dvh flex-col bg-bg pt-[env(safe-area-inset-top)] overflow-hidden",
        open ? "is-open" : "is-closing"
      )}
      role="dialog"
    >
      {/* Material You Ambient Background Wash */}
      {current.artwork ? (
        <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden opacity-30">
          <img
            src={current.artwork}
            alt=""
            referrerPolicy="no-referrer"
            className="size-full scale-125 object-cover blur-3xl saturate-150"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-bg/60 via-bg/85 to-bg" />
        </div>
      ) : null}

      {/* Top Bar */}
      <div className="flex items-center justify-between px-3 py-2">
        <button
          type="button"
          onClick={() => setShowFullPlayer(false)}
          className="flex size-11 items-center justify-center rounded-full hover:bg-elevated/60 active:scale-95"
          aria-label="Chiudi"
        >
          <ChevronDown className="size-6" />
        </button>

        {/* View Switcher Chips */}
        <div className="flex items-center gap-1 rounded-full bg-elevated/70 p-0.5 backdrop-blur-md">
          <button
            type="button"
            onClick={() => {
              setShowQueue(false);
              setShowLyrics(false);
            }}
            className={cn(
              "rounded-full px-3 py-1 text-xs font-semibold transition-all",
              !showQueue && !showLyrics ? "bg-fg text-bg" : "text-muted hover:text-fg"
            )}
          >
            Brano
          </button>
          <button
            type="button"
            onClick={() => {
              setShowQueue(false);
              setShowLyrics(true);
            }}
            className={cn(
              "flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold transition-all",
              showLyrics ? "bg-fg text-bg" : "text-muted hover:text-fg"
            )}
          >
            <Mic2 className="size-3" />
            Testi
          </button>
          <button
            type="button"
            onClick={() => {
              setShowLyrics(false);
              setShowQueue(true);
            }}
            className={cn(
              "flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold transition-all",
              showQueue ? "bg-fg text-bg" : "text-muted hover:text-fg"
            )}
          >
            <ListMusic className="size-3" />
            Coda
          </button>
        </div>

        <div className="relative">
          <button
            type="button"
            onClick={() => setShowSleepMenu(!showSleepMenu)}
            className={cn(
              "flex size-11 items-center justify-center rounded-full transition-colors hover:bg-elevated/60",
              sleepEndsAt ? "text-primary font-bold" : "text-muted"
            )}
            aria-label="Sleep timer"
          >
            <Moon className="size-5" />
          </button>

          {showSleepMenu ? (
            <div className="absolute right-0 top-12 z-50 min-w-36 rounded-xl bg-elevated/95 p-2 shadow-2xl backdrop-blur-md ring-1 ring-border text-xs space-y-1">
              <p className="px-2 py-1 font-bold text-muted uppercase tracking-wider text-[10px]">Timer sonno</p>
              {[
                [null, "Disattivato"],
                [15, "15 minuti"],
                [30, "30 minuti"],
                [45, "45 minuti"],
                [60, "1 ora"],
              ].map(([mins, label]) => (
                <button
                  key={String(mins)}
                  type="button"
                  onClick={() => {
                    setSleep(mins as number | null);
                    setShowSleepMenu(false);
                  }}
                  className="block w-full rounded-lg px-2 py-1.5 text-left font-medium hover:bg-surface active:bg-primary active:text-primary-fg"
                >
                  {label}
                </button>
              ))}
            </div>
          ) : null}
        </div>
      </div>

      {/* Main Content View */}
      {showLyrics ? (
        <LyricsView track={current} currentTime={currentTime} onSeek={seek} />
      ) : showQueue ? (
        <div className="min-h-0 flex-1 overflow-y-auto px-3">
          <div className="mb-2 px-2 pt-2 text-xs font-semibold text-muted uppercase tracking-wider">
            In coda ({queue.length} brani)
          </div>
          {queue.map((t, i) => (
            <TrackRow key={`${t.id}-${i}`} track={t} queue={queue} index={i} showIndex />
          ))}
        </div>
      ) : (
        <div className="flex min-h-0 flex-1 flex-col justify-center px-6 pb-2">
          <div className="mx-auto aspect-square w-[min(100%-2rem,22rem)] overflow-hidden rounded-2xl bg-elevated shadow-2xl ring-1 ring-white/10">
            <TrackArt src={current.artwork} alt={current.title} />
          </div>
          <div className="mt-6 flex items-start gap-3">
            <div className="min-w-0 flex-1">
              <h1 className="truncate text-2xl font-bold tracking-tight">{current.title}</h1>
              <p className="mt-1 truncate text-sm font-medium text-muted">{current.artist}</p>
            </div>
            <button
              type="button"
              onClick={() => toggleLike(current)}
              className={cn("size-10 flex items-center justify-center rounded-full", liked ? "text-primary" : "text-muted hover:text-fg")}
              aria-label="Mi piace"
            >
              <Heart className={cn("size-6", liked && "fill-current")} />
            </button>
          </div>
        </div>
      )}

      {/* Bottom Controls Area */}
      <div className="px-6 pb-6 pt-2">
        {/* Seek Bar */}
        <input
          type="range"
          min={0}
          max={duration || 1}
          step={0.25}
          value={Math.min(currentTime, duration || 1)}
          onChange={(e) => seek(Number(e.target.value))}
          className="h-1.5 w-full appearance-none rounded-full bg-elevated/80 cursor-pointer accent-primary"
          style={{
            background: `linear-gradient(to right, var(--color-primary) ${progress}%, var(--color-elevated) ${progress}%)`,
          }}
        />
        <div className="mt-1.5 flex justify-between text-xs tabular-nums text-subtle">
          <span>{formatTime(currentTime)}</span>
          <span>{remainingTime ? `-${formatTime(rightTime)}` : formatTime(rightTime)}</span>
        </div>

        {/* Primary Playback Controls */}
        <div className="mt-3 flex items-center justify-between">
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
            onClick={prev}
            className="size-12 flex items-center justify-center rounded-full text-fg hover:bg-elevated/50 active:scale-95"
            aria-label="Brano precedente"
          >
            <SkipBack className="size-7 fill-current" />
          </button>

          <button
            type="button"
            onClick={togglePlay}
            className="flex size-16 items-center justify-center rounded-full bg-primary text-primary-fg shadow-lg transition-transform active:scale-95 hover:scale-105"
            aria-label="Play/Pausa"
          >
            {isPlaying ? <Pause className="size-7 fill-current" /> : <Play className="size-7 fill-current ml-0.5" />}
          </button>

          <button
            type="button"
            onClick={next}
            className="size-12 flex items-center justify-center rounded-full text-fg hover:bg-elevated/50 active:scale-95"
            aria-label="Brano successivo"
          >
            <SkipForward className="size-7 fill-current" />
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

        {/* Secondary Utility Pills */}
        <div className="mt-4 flex items-center justify-between border-t border-border/40 pt-3 text-xs text-muted">
          <button
            type="button"
            onClick={cycleRate}
            className="flex items-center gap-1 rounded-full bg-elevated/60 px-2.5 py-1 font-semibold hover:text-fg"
          >
            <Gauge className="size-3.5" />
            {playbackRate}x
          </button>

          <button
            type="button"
            onClick={() => void startRadioMix()}
            className="flex items-center gap-1 rounded-full bg-elevated/60 px-2.5 py-1 font-semibold hover:text-fg"
          >
            <Radio className="size-3.5 text-primary" />
            Radio brano
          </button>
        </div>
      </div>
    </div>
  );
}
