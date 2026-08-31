import { useEffect, useRef, useState, type CSSProperties } from "react";
import {
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
  Share2,
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
import { getTrackLyrics, type LyricsPayload } from "@/lib/music/lyrics";
import { getRelatedTracks } from "@/lib/music/catalog";
import { averageArtworkColor, shareLyricsCard } from "@/lib/music/lyrics-share";

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

  const resumeElement = (audio: HTMLAudioElement | null) => {
    if (!audio) return;
    if (useFlowStore.getState().isPlaying && audio.paused) void audio.play().catch(() => {});
  };

  const applySrc = (audio: HTMLAudioElement, src: string, play: boolean, force = false) => {
    if (!src) return;
    if (lastSrc.current === src) {
      applyOutput(audio);
      if (play && audio.paused) void audio.play().catch(() => {});
      return;
    }
    const playing = !audio.paused && !audio.error;
    const blobUpgrade = src.startsWith("blob:") && lastSrc.current.includes("/api/stream");
    // Mid-play blob swap while playing interrupts playback and drops Chrome Android audio focus
    if (playing && blobUpgrade) return;
    if (document.hidden && playing && !force) return;

    lastSrc.current = src;
    audio.src = src;
    applyOutput(audio);
    if (play) {
      void audio.play().catch(() => {});
    }
  };

  const recover = (id: string, time: number) => {
    const audio = audioRef.current;
    if (!audio || recovering.current === id) return;
    if (document.hidden) {
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
        if (document.hidden) return;
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
    const el = audioRef.current;
    if (el) {
      el.setAttribute("playsinline", "true");
      el.setAttribute("webkit-playsinline", "true");
    }
    claimAudioFocus();
    bindLockScreenActions({
      play: () => {
        useFlowStore.getState().resume();
        void audioRef.current?.play().catch(() => {});
      },
      pause: () => {
        useFlowStore.getState().pause();
        audioRef.current?.pause();
      },
      prev: () => useFlowStore.getState().prev(),
      next: () => useFlowStore.getState().next(),
      seek: (t) => useFlowStore.getState().seek(t),
      skip: (d) => useFlowStore.getState().skipBy(d),
      stop: () => {
        useFlowStore.getState().pause();
        audioRef.current?.pause();
      },
    });
    return bindAudioFocus({
      onLost: () => {
        if (document.hidden) return;
        useFlowStore.getState().pause();
      },
      onGained: () => {
        if (!shouldResumeAfterFocus()) return;
        const s = useFlowStore.getState();
        if (s.current) s.resume();
        void audioRef.current?.play().catch(() => {});
      },
    });
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !current) return;
    recovering.current = "";
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
    const st = useFlowStore.getState();
    const nxt = st.queue[st.queueIndex + 1];
    if (nxt?.videoId && nxt.videoId !== current.videoId) prefetchAudio(nxt.videoId);
  }, [current?.id, current?.videoId, current?.streamUrl, setDuration]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    markPlayingForFocus(isPlaying);
    claimAudioFocus();
    applyOutput(audio);
    if (isPlaying) {
      void audio.play().catch(() => {});
    } else {
      audio.pause();
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
      if (document.hidden) {
        resumeElement(audio);
        return;
      }
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
    document.addEventListener("visibilitychange", kick);
    window.addEventListener("pageshow", kick);
    window.addEventListener("focus", kick);
    window.addEventListener("freeze", kick);
    window.addEventListener("resume", kick);
    const watchdog = window.setInterval(kick, 2000);
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
        recovering.current = "";
        const track = useFlowStore.getState().current;
        if (track) {
          markPlayingForFocus(true);
          pushLockScreen(track, true, audioRef.current?.currentTime || 0, audioRef.current?.duration || 0, 1);
        }
      }}
      onPause={() => {
        resumeElement(audioRef.current);
      }}
      onWaiting={() => {
        if (document.hidden) resumeElement(audioRef.current);
      }}
      onError={() => {
        const s = useFlowStore.getState();
        const id = s.current?.videoId;
        const audio = audioRef.current;
        if (!id || !audio) return;
        if (document.hidden) {
          resumeElement(audio);
          return;
        }
        const blob = cachedAudioUrl(id);
        if (blob) applySrc(audio, blob, s.isPlaying, true);
        else if (!audio.src.includes("/api/stream")) applySrc(audio, `/api/stream?v=${id}`, s.isPlaying, true);
        else if (s.isPlaying) recover(id, s.currentTime);
      }}
      onStalled={() => {
        if (document.hidden) resumeElement(audioRef.current);
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
  const notify = useFlowStore((s) => s.notify);

  const downloaded = useIsDownloaded(current?.videoId);
  const [busyDl, setBusyDl] = useState(false);
  const [busyQueue, setBusyQueue] = useState(false);
  const [queueProg, setQueueProg] = useState("");
  const [lyrics, setLyrics] = useState<LyricsPayload | null>(null);
  const [lyricsLoading, setLyricsLoading] = useState(false);
  const [glow, setGlow] = useState<string | null>(null);
  const [sharing, setSharing] = useState(false);
  const [showSleepMenu, setShowSleepMenu] = useState(false);
  const lyricsBox = useRef<HTMLDivElement | null>(null);

  const { mounted, open } = useOpenTransition(show, 260);

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
        videoId: current.videoId,
        title: current.title,
        artist: current.artist,
        album: current.album,
        duration: current.duration || duration || undefined,
      },
    })
      .then((res) => {
        if (cancelled) return;
        lyricsMem.set(key, res);
        setLyrics(res);
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
    if (!showLyrics || activeIdx < 0) return;
    const root = lyricsBox.current;
    const el = root?.querySelector(`[data-ly="${activeIdx}"]`);
    el?.scrollIntoView({ block: "center", behavior: "smooth" });
  }, [activeIdx, showLyrics]);

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
        notify("Radio avviata");
      }
    } catch {
      notify("Impossibile avviare la radio");
    }
  };

  return (
    <div
      className={cn("player-full fixed inset-0 z-50 flex h-dvh flex-col overflow-hidden bg-bg pt-[env(safe-area-inset-top)]", open ? "is-open" : "is-closing")}
      role="dialog"
      style={glow ? ({ ["--player-glow"]: glow } as CSSProperties) : undefined}
    >
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <img src={current.artwork} alt="" referrerPolicy="no-referrer" className="player-ambient size-full object-cover blur-3xl opacity-40 saturate-150" />
        <div
          className="absolute inset-0"
          style={{
            background: glow
              ? `linear-gradient(180deg, color-mix(in oklab, ${glow} 55%, transparent) 0%, rgb(0 0 0 / 0.55) 42%, rgb(0 0 0 / 0.88) 100%)`
              : "linear-gradient(180deg, rgb(0 0 0 / 0.28) 0%, rgb(0 0 0 / 0.82) 100%)",
          }}
        />
      </div>

      <div className="relative z-10 flex min-h-0 flex-1 flex-col">
        {/* Header Bar */}
        <div className="mx-2 mt-1 flex items-center justify-between rounded-2xl px-1 py-0.5 player-glass">
          <button type="button" onClick={() => setShowFullPlayer(false)} className="flex size-11 items-center justify-center rounded-full hover:bg-elevated/60" aria-label="Chiudi">
            <ChevronDown className="size-6" />
          </button>
          <p className="text-xs font-medium tracking-wide text-muted uppercase">In riproduzione</p>
          <div className="flex items-center">
            <button
              type="button"
              onClick={runShare}
              disabled={sharing}
              className={cn("flex size-11 items-center justify-center rounded-full transition-colors", sharing ? "text-primary" : "text-fg hover:text-primary")}
              aria-label="Condividi testo"
            >
              <Share2 className="size-5" />
            </button>
            <button
              type="button"
              onClick={() => {
                setShowQueue(false);
                setShowLyrics(!showLyrics);
              }}
              className={cn("flex size-11 items-center justify-center rounded-full transition-colors", showLyrics ? "text-primary" : "text-fg hover:text-primary")}
              aria-label="Testi"
            >
              <Mic2 className="size-5" />
            </button>
            <button
              type="button"
              onClick={() => {
                setShowLyrics(false);
                setShowQueue(!showQueue);
              }}
              className={cn("flex size-11 items-center justify-center rounded-full transition-colors", showQueue ? "text-primary" : "text-fg hover:text-primary")}
              aria-label="Coda"
            >
              <ListMusic className="size-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        {showQueue ? (
          <div className="min-h-0 flex-1 overflow-y-auto px-3 pb-8">
            <div className="sticky top-0 z-10 mb-2 mt-3 flex items-center justify-between rounded-2xl px-3 py-2 player-glass">
              <p className="text-sm font-medium">Coda · {queue.length} brani</p>
              <button
                type="button"
                disabled={busyQueue || !queue.some(canDownloadTrack)}
                onClick={() => {
                  setBusyQueue(true);
                  setQueueProg("");
                  void downloadTracks(queue, (done, total) => setQueueProg(`${done}/${total}`))
                    .then((r) => {
                      const saved = r.ok + r.skipped;
                      notify(r.fail ? `Salvati ${saved}, ${r.fail} errori` : `${saved} brani in cache`);
                    })
                    .catch(() => notify("Download coda non riuscito"))
                    .finally(() => {
                      setBusyQueue(false);
                      setQueueProg("");
                    });
                }}
                className="h-9 rounded-full bg-primary px-3 text-xs font-semibold text-primary-fg disabled:opacity-50"
              >
                {busyQueue ? queueProg || "Scarico…" : "Scarica coda"}
              </button>
            </div>
            {queue.map((t, i) => (
              <TrackRow key={`${t.id}-${i}`} track={t} queue={queue} index={i} showIndex />
            ))}
          </div>
        ) : (
          <div className="flex min-h-0 flex-1 flex-col px-6 pb-4">
            {showLyrics ? (
              <div ref={lyricsBox} className="player-glass mx-auto mt-3 min-h-0 w-full max-w-lg flex-1 overflow-y-auto rounded-2xl px-4 py-6 text-center space-y-4">
                {lyricsLoading ? (
                  <div className="flex flex-col items-center justify-center py-12 text-muted">
                    <div className="size-7 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                    <p className="mt-4 text-sm">Caricamento testi LRCLIB…</p>
                  </div>
                ) : !lyrics?.lines.length ? (
                  <div className="flex flex-col items-center justify-center py-12 text-muted">
                    <Mic2 className="size-12 opacity-25" />
                    <p className="mt-3 text-base font-semibold text-fg">Testo non disponibile</p>
                    <p className="mt-1 text-xs text-subtle">Nessun testo sincronizzato trovato per questo brano.</p>
                  </div>
                ) : (
                  lyrics.lines.map((line, i) => (
                    <button
                      key={`${line.timeMs}-${i}`}
                      type="button"
                      data-ly={i}
                      onClick={() => lyrics.synced && seek(line.timeMs / 1000)}
                      className={cn(
                        "block w-full py-2 text-center text-lg leading-snug transition-all rounded-lg cursor-pointer",
                        i === activeIdx
                          ? "scale-105 font-extrabold text-primary text-xl"
                          : i < activeIdx
                          ? "text-fg/80 font-medium text-base"
                          : "text-muted/60 text-base hover:text-fg/80",
                      )}
                    >
                      {line.text}
                    </button>
                  ))
                )}
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowLyrics(true)}
                className="player-art-float mx-auto mt-6 aspect-square w-[min(100%-2rem,22rem)] overflow-hidden rounded-3xl bg-elevated ring-1 ring-white/10"
                aria-label="Mostra testi"
              >
                <TrackArt src={current.artwork} alt={current.title} />
              </button>
            )}

            {/* Track Info & Action Bar */}
            <div className="player-glass mt-4 rounded-3xl px-4 py-4">
              <div className="flex items-start gap-3">
                <div className="min-w-0 flex-1">
                  <h1 className="truncate text-2xl font-bold tracking-tight">{current.title}</h1>
                  <p className="mt-1 truncate text-sm font-medium text-muted">{current.artist}</p>
                </div>
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
                    className={cn("size-10 flex items-center justify-center rounded-full text-muted hover:text-fg", downloaded && "text-primary")}
                    aria-label={downloaded ? "Rimuovi download" : "Scarica"}
                  >
                    <Download className="size-5" />
                  </button>
                ) : null}
                <button
                  type="button"
                  onClick={() => toggleLike(current)}
                  className={cn("size-10 flex items-center justify-center rounded-full", liked ? "text-primary" : "text-muted hover:text-fg")}
                  aria-label="Mi piace"
                >
                  <Heart className={cn("size-6", liked && "fill-current")} />
                </button>
              </div>

              {/* Seek Bar */}
              <input
                type="range"
                min={0}
                max={duration || 1}
                step={0.25}
                value={Math.min(currentTime, duration || 1)}
                onChange={(e) => seek(Number(e.target.value))}
                className="mt-5 h-1.5 w-full appearance-none rounded-full bg-elevated cursor-pointer accent-primary"
                style={{
                  background: `linear-gradient(to right, var(--color-primary) ${progress}%, rgb(255 255 255 / 0.18) ${progress}%)`,
                }}
              />
              <div className="mt-1.5 flex justify-between text-xs tabular-nums text-subtle">
                <span>{formatTime(currentTime)}</span>
                <span>{remainingTime ? `-${formatTime(rightTime)}` : formatTime(rightTime)}</span>
              </div>

              {/* Controls */}
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

              {/* Utility Row */}
              <div className="mt-3 flex items-center justify-between border-t border-border/30 pt-2 text-xs text-muted">
                <button
                  type="button"
                  onClick={cycleRate}
                  className="flex items-center gap-1 rounded-full bg-elevated/60 px-2.5 py-1 font-semibold hover:text-fg"
                >
                  <Gauge className="size-3.5" />
                  {playbackRate}x
                </button>

                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowSleepMenu(!showSleepMenu)}
                    className={cn("flex items-center gap-1 rounded-full bg-elevated/60 px-2.5 py-1 font-semibold hover:text-fg", sleepEndsAt && "text-primary")}
                  >
                    <Moon className="size-3.5" />
                    {sleepEndsAt ? "Timer attivo" : "Timer"}
                  </button>
                  {showSleepMenu ? (
                    <div className="absolute bottom-9 right-0 z-50 min-w-36 rounded-xl bg-elevated/95 p-2 shadow-2xl backdrop-blur-md ring-1 ring-border text-xs space-y-1">
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
        )}
      </div>
    </div>
  );
}
