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

export function AudioEngine() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const current = useFlowStore((s) => s.current);
  const isPlaying = useFlowStore((s) => s.isPlaying);
  const volume = useFlowStore((s) => s.volume);
  const isMuted = useFlowStore((s) => s.isMuted);
  const seekVersion = useFlowStore((s) => s.seekVersion);
  const currentTime = useFlowStore((s) => s.currentTime);
  const setCurrentTime = useFlowStore((s) => s.setCurrentTime);
  const setDuration = useFlowStore((s) => s.setDuration);
  const onEnded = useFlowStore((s) => s.onEnded);
  const lastSeek = useRef(0);
  const lastSrc = useRef("");
  const lastTick = useRef(0);

  const ytId = current?.source === "ytmusic" ? current.videoId : undefined;
  const radioSrc = current?.source === "radio" ? current.streamUrl : "";

  useEffect(() => {
    if (current?.duration && current.duration > 0) setDuration(current.duration);
  }, [current?.id, current?.duration, setDuration]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const src = radioSrc || (!ytId && current?.streamUrl) || "";
    if (!src) return;
    if (lastSrc.current === src) return;
    lastSrc.current = src;
    audio.src = src;
    audio.load();
    if (useFlowStore.getState().isPlaying) void audio.play().catch(() => {});
  }, [current?.id, radioSrc, ytId, current?.streamUrl]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (!radioSrc) return;
    if (isPlaying) void audio.play().catch(() => {});
    else audio.pause();
  }, [isPlaying, radioSrc]);

  useEffect(() => {
    const audio = audioRef.current;
    if (audio) audio.volume = isMuted ? 0 : volume;
  }, [volume, isMuted]);

  useEffect(() => {
    if (seekVersion === lastSeek.current) return;
    lastSeek.current = seekVersion;
    const audio = audioRef.current;
    if (audio && radioSrc && Math.abs(audio.currentTime - currentTime) > 0.4) {
      audio.currentTime = currentTime;
    }
  }, [seekVersion, currentTime, radioSrc]);

  useEffect(() => {
    if (!isPlaying || !current) return;
    lastTick.current = performance.now();
    const t = window.setInterval(() => {
      const s = useFlowStore.getState();
      if (!s.isPlaying || !s.current) return;
      const now = performance.now();
      const dt = Math.min(1, (now - lastTick.current) / 1000);
      lastTick.current = now;
      const next = s.currentTime + dt;
      if (s.duration > 1 && next >= s.duration - 0.05) {
        s.onEnded();
        return;
      }
      s.setCurrentTime(next);
    }, 250);
    return () => window.clearInterval(t);
  }, [isPlaying, current?.id]);

  return (
    <>
      <audio
        ref={audioRef}
        playsInline
        preload="auto"
        className="pointer-events-none fixed bottom-0 left-0 h-px w-px opacity-[0.01]"
        onTimeUpdate={(e) => {
          if (ytId) return;
          const t = e.currentTarget.currentTime;
          if (Number.isFinite(t) && t > 0) setCurrentTime(t);
        }}
        onDurationChange={(e) => {
          const d = e.currentTarget.duration;
          if (Number.isFinite(d) && d > 0) setDuration(d);
        }}
        onEnded={() => {
          if (!ytId) onEnded();
        }}
      />
      {ytId && isPlaying ? (
        <iframe
          key={ytId}
          title="player"
          src={`https://www.youtube.com/embed/${ytId}?autoplay=1&rel=0&modestbranding=1&playsinline=1&controls=0`}
          allow="autoplay; encrypted-media; picture-in-picture"
          className="pointer-events-none fixed right-3 bottom-[calc(6.5rem+env(safe-area-inset-bottom))] z-[55] size-[168px] rounded-lg border-0 opacity-90 md:bottom-[100px]"
        />
      ) : null}
    </>
  );
}

export function MiniPlayer() {
  const current = useFlowStore((s) => s.current);
  const isPlaying = useFlowStore((s) => s.isPlaying);
  const currentTime = useFlowStore((s) => s.currentTime);
  const duration = useFlowStore((s) => s.duration);
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

  return (
    <div className={cn("now-bar pointer-events-auto bg-elevated md:bg-bg", (!open || showFull) && "is-away")}>
      <div className="md:hidden">
        <div className="mx-2 mb-1 overflow-hidden rounded-lg bg-elevated">
          <div className="flex items-center gap-2 px-2 py-1.5">
            <button type="button" onClick={() => setShowFullPlayer(true)} className="flex min-w-0 flex-1 items-center gap-3 text-left">
              <span className="size-11 shrink-0 overflow-hidden rounded-md bg-surface">
                <TrackArt src={current.artwork} alt="" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium">{current.title}</span>
                <span className="block truncate text-xs text-muted">{current.artist}</span>
              </span>
            </button>
            <button type="button" onClick={togglePlay} className="flex size-11 items-center justify-center" aria-label="Play">
              {isPlaying ? <Pause className="size-5 fill-current" /> : <Play className="size-5 fill-current" />}
            </button>
          </div>
          <div className="h-0.5 w-full bg-subtle/40">
            <div className="h-full bg-primary" style={{ width: `${progress}%` }} />
          </div>
        </div>
      </div>
      <div className="hidden h-[90px] items-center gap-4 px-4 md:flex">
        <button type="button" onClick={() => setShowFullPlayer(true)} className="flex min-w-0 flex-1 items-center gap-3 text-left">
          <span className="size-14 shrink-0 overflow-hidden rounded bg-surface">
            <TrackArt src={current.artwork} alt="" />
          </span>
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
            <button type="button" onClick={toggleShuffle} className={cn("size-8", shuffle ? "text-primary" : "text-muted")}>
              <Shuffle className="size-4" />
            </button>
            <button type="button" onClick={prev} className="size-8 text-muted" aria-label="Prev">
              <SkipBack className="size-5 fill-current" />
            </button>
            <button type="button" onClick={togglePlay} className="flex size-10 items-center justify-center rounded-full bg-fg text-bg" aria-label="Play">
              {isPlaying ? <Pause className="size-4 fill-current" /> : <Play className="size-4 fill-current" />}
            </button>
            <button type="button" onClick={next} className="size-8 text-muted" aria-label="Next">
              <SkipForward className="size-5 fill-current" />
            </button>
            <button type="button" onClick={cycleRepeat} className={cn("size-8", repeat !== "off" ? "text-primary" : "text-muted")}>
              <RepeatIcon className="size-4" />
            </button>
          </div>
          <div className="flex w-full items-center gap-2">
            <span className="w-10 text-right text-[11px] tabular-nums text-subtle">{formatTime(currentTime)}</span>
            <input type="range" min={0} max={duration || 1} step={0.25} value={Math.min(currentTime, duration || 1)} onChange={(e) => seek(Number(e.target.value))} className="seek flex-1" />
            <span className="w-10 text-[11px] tabular-nums text-subtle">{formatTime(duration)}</span>
          </div>
        </div>
        <div className="flex flex-1 items-center justify-end gap-2">
          <button type="button" onClick={toggleMute} className="text-muted">
            {isMuted || volume === 0 ? <VolumeX className="size-4" /> : <Volume2 className="size-4" />}
          </button>
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

  return (
    <div className={cn("player-full fixed inset-0 z-50 flex h-dvh flex-col bg-bg pt-[env(safe-area-inset-top)]", open ? "is-open" : "is-closing")} role="dialog">
      <div className="flex items-center justify-between px-2 py-1">
        <button type="button" onClick={() => setShowFullPlayer(false)} className="flex size-11 items-center justify-center" aria-label="Chiudi">
          <ChevronDown className="size-6" />
        </button>
        <p className="text-xs font-medium tracking-wide text-muted uppercase">In riproduzione</p>
        <button type="button" onClick={() => setShowQueue(!showQueue)} className={cn("flex size-11 items-center justify-center", showQueue ? "text-primary" : "text-fg")}>
          <ListMusic className="size-5" />
        </button>
      </div>
      {showQueue ? (
        <div className="min-h-0 flex-1 overflow-y-auto px-3">
          {queue.map((t, i) => (
            <TrackRow key={`${t.id}-${i}`} track={t} queue={queue} index={i} showIndex />
          ))}
        </div>
      ) : (
        <div className="flex min-h-0 flex-1 flex-col px-6 pb-8">
          <div className="mx-auto mt-4 aspect-square w-[min(100%-2rem,22rem)] overflow-hidden rounded-xl bg-elevated">
            <TrackArt src={current.artwork} alt={current.title} />
          </div>
          <div className="mt-6 flex items-start gap-3">
            <div className="min-w-0 flex-1">
              <h1 className="truncate text-2xl font-semibold">{current.title}</h1>
              <p className="mt-1 truncate text-sm text-muted">{current.artist}</p>
            </div>
            <button type="button" onClick={() => toggleLike(current)} className={liked ? "text-primary" : "text-muted"}>
              <Heart className={cn("size-6", liked && "fill-current")} />
            </button>
          </div>
          <input
            type="range"
            min={0}
            max={duration || 1}
            step={0.25}
            value={Math.min(currentTime, duration || 1)}
            onChange={(e) => seek(Number(e.target.value))}
            className="mt-6 h-1.5 w-full appearance-none rounded-full bg-elevated"
            style={{ background: `linear-gradient(to right, var(--color-primary) ${progress}%, var(--color-elevated) ${progress}%)` }}
          />
          <div className="mt-1.5 flex justify-between text-xs tabular-nums text-subtle">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
          <div className="mt-4 flex items-center justify-center gap-6">
            <button type="button" onClick={prev} aria-label="Prev">
              <SkipBack className="size-7 fill-current" />
            </button>
            <button type="button" onClick={togglePlay} className="flex size-16 items-center justify-center rounded-full bg-primary text-primary-fg" aria-label="Play">
              {isPlaying ? <Pause className="size-7 fill-current" /> : <Play className="size-7 fill-current" />}
            </button>
            <button type="button" onClick={next} aria-label="Next">
              <SkipForward className="size-7 fill-current" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
