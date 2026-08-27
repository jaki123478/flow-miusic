import { useEffect, useRef } from "react";
import {
  ChevronDown,
  Heart,
  ListMusic,
  Pause,
  Play,
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
import { cachedAudioUrl, loadLocalAudio } from "@/lib/music/offline-audio";
import { resolveDirectUrl } from "@/lib/music/play-src";

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

  const applySrc = (audio: HTMLAudioElement, src: string, play: boolean) => {
    if (!src) return;
    if (lastSrc.current !== src) {
      lastSrc.current = src;
      audio.src = src;
      audio.load();
    }
    applyOutput(audio);
    if (play) void audio.play().catch(() => {});
  };

  const recover = (id: string, time: number) => {
    const audio = audioRef.current;
    if (!audio || recovering.current === id) return;
    recovering.current = id;
    void loadLocalAudio(id)
      .then((url) => {
        if (useFlowStore.getState().current?.videoId !== id) return;
        applySrc(audio, url, true);
        const jump = () => {
          try {
            if (time > 0) audio.currentTime = time;
          } catch {
            /* ignore */
          }
          if (useFlowStore.getState().isPlaying) void audio.play().catch(() => {});
        };
        audio.addEventListener("loadedmetadata", jump, { once: true });
      })
      .catch(() => {
        if (recovering.current === id) recovering.current = "";
      });
  };

  useEffect(() => {
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
    let cancelled = false;
    recovering.current = "";
    lastMove.current = Date.now();
    lastPos.current = 0;
    if (current.duration && current.duration > 0) setDuration(current.duration);
    else setDuration(0);
    const wantPlay = useFlowStore.getState().isPlaying;
    applySrc(audio, fallbackSrc(current), wantPlay);
    claimAudioFocus();
    if (wantPlay) {
      markPlayingForFocus(true);
      showAndroidNowPlaying(current);
    }
    pushLockScreen(current, wantPlay, 0, current.duration || 0, 1);

    if (current.videoId && !cachedAudioUrl(current.videoId)) {
      const id = current.videoId;
      void resolveDirectUrl(id).then((url) => {
        if (cancelled || !url) return;
        if (useFlowStore.getState().current?.videoId !== id) return;
        applySrc(audio, url, useFlowStore.getState().isPlaying);
      });
    }

    return () => {
      cancelled = true;
    };
  }, [current?.id, current?.videoId, current?.streamUrl, setDuration]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    markPlayingForFocus(isPlaying);
    claimAudioFocus();
    applyOutput(audio);
    if (isPlaying) void audio.play().catch(() => {});
    else audio.pause();
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
      if (audio.paused) void audio.play().catch(() => {});
      const t = audio.currentTime || 0;
      if (t > lastPos.current + 0.15) {
        lastPos.current = t;
        lastMove.current = Date.now();
        return;
      }
      if (Date.now() - lastMove.current > 3500 && s.current.videoId && !String(audio.src).startsWith("blob:")) {
        recover(s.current.videoId, t || s.currentTime);
      }
    };
    document.addEventListener("visibilitychange", kick);
    window.addEventListener("pageshow", kick);
    window.addEventListener("focus", kick);
    const watchdog = window.setInterval(kick, 2000);
    return () => {
      document.removeEventListener("visibilitychange", kick);
      window.removeEventListener("pageshow", kick);
      window.removeEventListener("focus", kick);
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
        }
      }}
      onPause={() => {
        const s = useFlowStore.getState();
        if (s.isPlaying) void audioRef.current?.play().catch(() => {});
      }}
      onError={() => {
        const s = useFlowStore.getState();
        const id = s.current?.videoId;
        const audio = audioRef.current;
        if (!id || !audio) return;
        const proxy = `/api/stream?v=${id}`;
        if (!audio.src.includes("/api/stream")) applySrc(audio, proxy, s.isPlaying);
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

export function FullPlayer() {
  const current = useFlowStore((s) => s.current);
  const isPlaying = useFlowStore((s) => s.isPlaying);
  const currentTime = useFlowStore((s) => s.currentTime);
  const duration = useFlowStore((s) => s.duration);
  const remainingTime = useFlowStore((s) => s.settings.remainingTime);
  const queue = useFlowStore((s) => s.queue);
  const show = useFlowStore((s) => s.showFullPlayer);
  const showQueue = useFlowStore((s) => s.showQueue);
  const togglePlay = useFlowStore((s) => s.togglePlay);
  const next = useFlowStore((s) => s.next);
  const prev = useFlowStore((s) => s.prev);
  const seek = useFlowStore((s) => s.seek);
  const toggleLike = useFlowStore((s) => s.toggleLike);
  const liked = useFlowStore((s) => (current ? s.liked.some((t) => t.id === current.id) : false));
  const setShowFullPlayer = useFlowStore((s) => s.setShowFullPlayer);
  const setShowQueue = useFlowStore((s) => s.setShowQueue);
  const { mounted, open } = useOpenTransition(show, 260);
  if (!mounted || !current) return null;
  const progress = duration > 0 ? Math.min(100, (currentTime / duration) * 100) : 0;
  const rightTime = remainingTime && duration > 0 ? Math.max(0, duration - currentTime) : duration;
  return (
    <div className={cn("player-full fixed inset-0 z-50 flex h-dvh flex-col bg-bg pt-[env(safe-area-inset-top)]", open ? "is-open" : "is-closing")} role="dialog">
      <div className="flex items-center justify-between px-2 py-1">
        <button type="button" onClick={() => setShowFullPlayer(false)} className="flex size-11 items-center justify-center" aria-label="Chiudi"><ChevronDown className="size-6" /></button>
        <p className="text-xs font-medium tracking-wide text-muted uppercase">In riproduzione</p>
        <button type="button" onClick={() => setShowQueue(!showQueue)} className={cn("flex size-11 items-center justify-center", showQueue ? "text-primary" : "text-fg")}><ListMusic className="size-5" /></button>
      </div>
      {showQueue ? (
        <div className="min-h-0 flex-1 overflow-y-auto px-3">{queue.map((t, i) => <TrackRow key={`${t.id}-${i}`} track={t} queue={queue} index={i} showIndex />)}</div>
      ) : (
        <div className="flex min-h-0 flex-1 flex-col px-6 pb-8">
          <div className="mx-auto mt-4 aspect-square w-[min(100%-2rem,22rem)] overflow-hidden rounded-xl bg-elevated"><TrackArt src={current.artwork} alt={current.title} /></div>
          <div className="mt-6 flex items-start gap-3">
            <div className="min-w-0 flex-1">
              <h1 className="truncate text-2xl font-semibold">{current.title}</h1>
              <p className="mt-1 truncate text-sm text-muted">{current.artist}</p>
            </div>
            <button type="button" onClick={() => toggleLike(current)} className={liked ? "text-primary" : "text-muted"}><Heart className={cn("size-6", liked && "fill-current")} /></button>
          </div>
          <input type="range" min={0} max={duration || 1} step={0.25} value={Math.min(currentTime, duration || 1)} onChange={(e) => seek(Number(e.target.value))} className="mt-6 h-1.5 w-full appearance-none rounded-full bg-elevated" style={{ background: `linear-gradient(to right, var(--color-primary) ${progress}%, var(--color-elevated) ${progress}%)` }} />
          <div className="mt-1.5 flex justify-between text-xs tabular-nums text-subtle"><span>{formatTime(currentTime)}</span><span>{remainingTime ? `-${formatTime(rightTime)}` : formatTime(rightTime)}</span></div>
          <div className="mt-4 flex items-center justify-center gap-6">
            <button type="button" onClick={prev} aria-label="Prev"><SkipBack className="size-7 fill-current" /></button>
            <button type="button" onClick={togglePlay} className="flex size-16 items-center justify-center rounded-full bg-primary text-primary-fg" aria-label="Play">{isPlaying ? <Pause className="size-7 fill-current" /> : <Play className="size-7 fill-current" />}</button>
            <button type="button" onClick={next} aria-label="Next"><SkipForward className="size-7 fill-current" /></button>
          </div>
        </div>
      )}
    </div>
  );
}
