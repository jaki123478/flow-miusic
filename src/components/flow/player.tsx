import { useEffect, useRef, useState } from "react";
import {
  ChevronDown,
  Clock,
  Heart,
  ListMusic,
  Mic2,
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
  X,
} from "lucide-react";
import { getTrackLyrics, type LyricLine } from "@/lib/music/lyrics";
import { cn, formatTime } from "@/lib/utils";
import { useFlowStore } from "@/stores/flow-store";
import { PlayingBars, TrackArt, TrackRow } from "./tracks";

type YTPlayer = {
  loadVideoById: (id: string) => void;
  cueVideoById: (id: string) => void;
  playVideo: () => void;
  pauseVideo: () => void;
  stopVideo: () => void;
  seekTo: (seconds: number, allowSeekAhead: boolean) => void;
  setVolume: (v: number) => void;
  mute: () => void;
  unMute: () => void;
  getCurrentTime: () => number;
  getDuration: () => number;
  setPlaybackRate: (r: number) => void;
  setSize: (w: number, h: number) => void;
  destroy: () => void;
};

type YTNamespace = {
  Player: new (
    el: HTMLElement | string,
    opts: {
      width?: number | string;
      height?: number | string;
      videoId?: string;
      host?: string;
      playerVars?: Record<string, string | number>;
      events?: {
        onReady?: (e: { target: YTPlayer }) => void;
        onStateChange?: (e: { data: number }) => void;
        onError?: (e: { data: number }) => void;
      };
    },
  ) => YTPlayer;
  PlayerState: { UNSTARTED: number; ENDED: number; PLAYING: number; PAUSED: number; BUFFERING: number; CUED: number };
};

declare global {
  interface Window {
    YT?: YTNamespace;
    onYouTubeIframeAPIReady?: () => void;
  }
}

function loadYouTubeApi(): Promise<YTNamespace> {
  if (typeof window === "undefined") return Promise.reject(new Error("ssr"));
  if (window.YT?.Player) return Promise.resolve(window.YT);
  return new Promise((resolve, reject) => {
    const prev = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      try {
        prev?.();
      } catch {
        /* ignore */
      }
      if (window.YT?.Player) resolve(window.YT);
      else reject(new Error("YT missing"));
    };
    if (!document.querySelector('script[src="https://www.youtube.com/iframe_api"]')) {
      const s = document.createElement("script");
      s.src = "https://www.youtube.com/iframe_api";
      s.async = true;
      s.onerror = () => reject(new Error("YT script"));
      document.head.appendChild(s);
    }
    window.setTimeout(() => {
      if (window.YT?.Player) resolve(window.YT);
    }, 10000);
  });
}

export function AudioEngine() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const hostRef = useRef<HTMLDivElement | null>(null);
  const ytRef = useRef<YTPlayer | null>(null);
  const ytReady = useRef(false);
  const ytVideo = useRef<string | null>(null);
  const current = useFlowStore((s) => s.current);
  const isPlaying = useFlowStore((s) => s.isPlaying);
  const volume = useFlowStore((s) => s.volume);
  const isMuted = useFlowStore((s) => s.isMuted);
  const playbackRate = useFlowStore((s) => s.playbackRate);
  const seekVersion = useFlowStore((s) => s.seekVersion);
  const currentTime = useFlowStore((s) => s.currentTime);
  const sleepEndsAt = useFlowStore((s) => s.sleepEndsAt);
  const showFullPlayer = useFlowStore((s) => s.showFullPlayer);
  const showQueue = useFlowStore((s) => s.showQueue);
  const showLyrics = useFlowStore((s) => s.showLyrics);
  const setCurrentTime = useFlowStore((s) => s.setCurrentTime);
  const setDuration = useFlowStore((s) => s.setDuration);
  const onEnded = useFlowStore((s) => s.onEnded);
  const pause = useFlowStore((s) => s.pause);
  const resume = useFlowStore((s) => s.resume);
  const next = useFlowStore((s) => s.next);
  const prev = useFlowStore((s) => s.prev);
  const lastSeek = useRef(0);
  const isYt = current?.source === "ytmusic" && Boolean(current.videoId);
  const hero = isYt && showFullPlayer && !showQueue && !showLyrics;

  useEffect(() => {
    if (!isYt || !hostRef.current) return;
    let cancelled = false;
    loadYouTubeApi()
      .then((YT) => {
        if (cancelled || !hostRef.current || ytRef.current) return;
        ytRef.current = new YT.Player(hostRef.current, {
          width: "100%",
          height: "100%",
          host: "https://www.youtube-nocookie.com",
          playerVars: {
            autoplay: 1,
            controls: 0,
            disablekb: 1,
            fs: 0,
            modestbranding: 1,
            rel: 0,
            iv_load_policy: 3,
            playsinline: 1,
            origin: window.location.origin,
            widget_referrer: window.location.origin,
          },
          events: {
            onReady: (e) => {
              ytReady.current = true;
              e.target.setVolume(isMuted ? 0 : Math.round(volume * 100));
              const id = useFlowStore.getState().current?.videoId;
              if (id) {
                ytVideo.current = id;
                e.target.loadVideoById(id);
              }
            },
            onStateChange: (e) => {
              const YT = window.YT;
              if (!YT) return;
              if (e.data === YT.PlayerState.ENDED) onEnded();
              if (e.data === YT.PlayerState.PLAYING) {
                const p = ytRef.current;
                if (p) {
                  const d = p.getDuration();
                  if (Number.isFinite(d) && d > 0) setDuration(d);
                }
              }
            },
            onError: () => {
              const cur = useFlowStore.getState().current;
              if (cur) onEnded();
            },
          },
        });
      })
      .catch(() => {
        const cur = useFlowStore.getState().current;
        if (cur?.source === "ytmusic") onEnded();
      });
    return () => {
      cancelled = true;
    };
  }, [isYt]);

  useEffect(() => {
    const id = current?.videoId;
    if (!isYt || !id || !ytReady.current || !ytRef.current) return;
    if (ytVideo.current === id) {
      if (isPlaying) ytRef.current.playVideo();
      return;
    }
    ytVideo.current = id;
    ytRef.current.loadVideoById(id);
  }, [current?.id, current?.videoId, isYt, isPlaying]);

  useEffect(() => {
    const audio = audioRef.current;
    if (isYt) {
      if (audio) {
        audio.pause();
        audio.removeAttribute("src");
      }
      return;
    }
    if (!audio) return;
    if (!current?.streamUrl) {
      audio.pause();
      audio.removeAttribute("src");
      return;
    }
    audio.src = current.streamUrl;
    audio.setAttribute("referrerpolicy", "no-referrer");
    audio.load();
    if (isPlaying) {
      void audio.play().catch(() => pause());
    }
  }, [current?.id, current?.streamUrl, isYt]);

  useEffect(() => {
    if (isYt) {
      const p = ytRef.current;
      if (!p || !ytReady.current) return;
      if (isPlaying) p.playVideo();
      else p.pauseVideo();
      return;
    }
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) void audio.play().catch(() => pause());
    else audio.pause();
  }, [isPlaying, isYt]);

  useEffect(() => {
    const p = ytRef.current;
    if (p && ytReady.current) {
      if (isMuted) p.mute();
      else {
        p.unMute();
        p.setVolume(Math.round(volume * 100));
      }
      try {
        p.setPlaybackRate(current?.isLive ? 1 : playbackRate);
      } catch {
        /* some videos reject rate */
      }
    }
    const audio = audioRef.current;
    if (audio) {
      audio.volume = isMuted ? 0 : volume;
      audio.playbackRate = current?.isLive ? 1 : playbackRate;
    }
  }, [volume, isMuted, playbackRate, current?.isLive]);

  useEffect(() => {
    if (seekVersion === lastSeek.current) return;
    lastSeek.current = seekVersion;
    if (current?.isLive) return;
    if (isYt && ytRef.current && ytReady.current) {
      ytRef.current.seekTo(currentTime, true);
      return;
    }
    const audio = audioRef.current;
    if (!audio) return;
    if (Math.abs(audio.currentTime - currentTime) > 0.35) {
      audio.currentTime = currentTime;
    }
  }, [seekVersion, currentTime, current?.isLive, isYt]);

  useEffect(() => {
    if (!isYt || !isPlaying) return;
    const t = window.setInterval(() => {
      const p = ytRef.current;
      if (!p || !ytReady.current) return;
      const time = p.getCurrentTime();
      const dur = p.getDuration();
      if (Number.isFinite(time)) setCurrentTime(time);
      if (Number.isFinite(dur) && dur > 0) setDuration(dur);
    }, 250);
    return () => window.clearInterval(t);
  }, [isYt, isPlaying, setCurrentTime, setDuration]);

  useEffect(() => {
    const host = hostRef.current;
    const p = ytRef.current;
    if (!host || !p || !ytReady.current) return;
    p.setSize(host.clientWidth, host.clientHeight);
  }, [showFullPlayer, isYt]);

  useEffect(() => {
    if (!sleepEndsAt) return;
    const wait = sleepEndsAt - Date.now();
    if (wait <= 0) {
      pause();
      useFlowStore.getState().setSleep(null);
      return;
    }
    const t = window.setTimeout(() => {
      pause();
      useFlowStore.getState().setSleep(null);
    }, wait);
    return () => window.clearTimeout(t);
  }, [sleepEndsAt, pause]);

  useEffect(() => {
    if (!current || typeof navigator === "undefined" || !("mediaSession" in navigator)) return;
    navigator.mediaSession.metadata = new MediaMetadata({
      title: current.title,
      artist: current.artist,
      album: current.album || "Flow",
      artwork: current.artwork ? [{ src: current.artwork, sizes: "512x512", type: "image/jpeg" }] : [],
    });
    navigator.mediaSession.playbackState = isPlaying ? "playing" : "paused";
    navigator.mediaSession.setActionHandler("play", () => resume());
    navigator.mediaSession.setActionHandler("pause", () => pause());
    navigator.mediaSession.setActionHandler("previoustrack", () => prev());
    navigator.mediaSession.setActionHandler("nexttrack", () => next());
    navigator.mediaSession.setActionHandler("seekto", (d) => {
      if (typeof d.seekTime === "number") useFlowStore.getState().seek(d.seekTime);
    });
  }, [current, isPlaying, resume, pause, prev, next]);

  return (
    <>
      <audio
        ref={audioRef}
        className="hidden"
        playsInline
        preload="metadata"
        onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
        onDurationChange={(e) => {
          const d = e.currentTarget.duration;
          if (Number.isFinite(d)) setDuration(d);
        }}
        onEnded={onEnded}
        onError={() => {
          if (current && current.source !== "ytmusic") onEnded();
        }}
      />
      <div
        className={cn(
          "overflow-hidden bg-black shadow-2xl ring-1 ring-border",
          !isYt && "pointer-events-none invisible absolute",
          isYt && hero
            ? "pointer-events-none fixed top-14 left-1/2 z-40 w-[min(100%-3rem,24rem)] -translate-x-1/2 rounded-2xl aspect-square"
            : isYt
              ? "pointer-events-auto fixed right-3 bottom-24 z-[60] size-[200px] rounded-xl md:bottom-8"
              : "hidden",
        )}
        aria-hidden={!isYt}
      >
        <div ref={hostRef} className="size-full" />
      </div>
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
  const setShowFullPlayer = useFlowStore((s) => s.setShowFullPlayer);
  if (!current) return null;
  const progress = duration > 0 ? Math.min(100, (currentTime / duration) * 100) : 0;

  return (
    <div className="pointer-events-auto mx-3 mb-2 overflow-hidden rounded-xl bg-elevated ring-1 ring-border md:mx-4">
      <div className="flex w-full items-center gap-3 px-3 py-2">
        <button
          type="button"
          onClick={() => setShowFullPlayer(true)}
          className="flex min-w-0 flex-1 items-center gap-3 text-left"
        >
          <span className="size-11 shrink-0 overflow-hidden rounded-md bg-surface">
            <TrackArt src={current.artwork} alt="" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-medium text-fg">{current.title}</span>
            <span className="block truncate text-xs text-muted">{current.artist}</span>
          </span>
          {isPlaying ? <PlayingBars className="mr-1 hidden sm:flex" /> : null}
        </button>
        <button
          type="button"
          onClick={togglePlay}
          className="flex size-11 items-center justify-center rounded-full text-fg"
          aria-label={isPlaying ? "Pausa" : "Riproduci"}
        >
          {isPlaying ? <Pause className="size-5 fill-current" /> : <Play className="size-5 fill-current" />}
        </button>
        <button
          type="button"
          onClick={next}
          className="hidden size-11 items-center justify-center rounded-full text-fg sm:flex"
          aria-label="Successivo"
        >
          <SkipForward className="size-5 fill-current" />
        </button>
      </div>
      {!current.isLive ? (
        <div className="h-0.5 bg-surface">
          <div className="h-full bg-primary" style={{ width: `${progress}%` }} />
        </div>
      ) : (
        <div className="flex items-center gap-1.5 px-3 pb-1.5 text-[10px] font-medium tracking-wide text-primary uppercase">
          <span className="size-1.5 rounded-full bg-primary" />
          Live
        </div>
      )}
    </div>
  );
}

export function FullPlayer() {
  const current = useFlowStore((s) => s.current);
  const isPlaying = useFlowStore((s) => s.isPlaying);
  const currentTime = useFlowStore((s) => s.currentTime);
  const duration = useFlowStore((s) => s.duration);
  const shuffle = useFlowStore((s) => s.shuffle);
  const repeat = useFlowStore((s) => s.repeat);
  const volume = useFlowStore((s) => s.volume);
  const isMuted = useFlowStore((s) => s.isMuted);
  const queue = useFlowStore((s) => s.queue);
  const showQueue = useFlowStore((s) => s.showQueue);
  const showLyrics = useFlowStore((s) => s.showLyrics);
  const sleepEndsAt = useFlowStore((s) => s.sleepEndsAt);
  const show = useFlowStore((s) => s.showFullPlayer);
  const togglePlay = useFlowStore((s) => s.togglePlay);
  const next = useFlowStore((s) => s.next);
  const prev = useFlowStore((s) => s.prev);
  const seek = useFlowStore((s) => s.seek);
  const toggleShuffle = useFlowStore((s) => s.toggleShuffle);
  const cycleRepeat = useFlowStore((s) => s.cycleRepeat);
  const toggleLike = useFlowStore((s) => s.toggleLike);
  const liked = useFlowStore((s) => (current ? s.liked.some((t) => t.id === current.id) : false));
  const setShowFullPlayer = useFlowStore((s) => s.setShowFullPlayer);
  const setShowQueue = useFlowStore((s) => s.setShowQueue);
  const setShowLyrics = useFlowStore((s) => s.setShowLyrics);
  const setVolume = useFlowStore((s) => s.setVolume);
  const toggleMute = useFlowStore((s) => s.toggleMute);
  const setSleep = useFlowStore((s) => s.setSleep);

  const [lyrics, setLyrics] = useState<LyricLine[]>([]);
  const lyricsRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!current || current.isLive) {
      setLyrics([]);
      return;
    }
    let cancelled = false;
    getTrackLyrics({ data: { videoId: current.videoId, title: current.title, artist: current.artist } }).then(
      (lines) => {
        if (!cancelled) setLyrics(lines);
      },
    );
    return () => {
      cancelled = true;
    };
  }, [current?.id]);

  const lyricIndex = lyrics.reduce((acc, line, i) => (line.timeMs <= currentTime * 1000 ? i : acc), -1);

  useEffect(() => {
    if (!showLyrics || lyricIndex < 0) return;
    const el = lyricsRef.current?.querySelector(`[data-i="${lyricIndex}"]`);
    el?.scrollIntoView({ block: "center", behavior: "smooth" });
  }, [lyricIndex, showLyrics]);

  if (!show || !current) return null;
  const progress = duration > 0 ? Math.min(100, (currentTime / duration) * 100) : 0;
  const RepeatIcon = repeat === "one" ? Repeat1 : Repeat;
  const ytPlaying = current.source === "ytmusic";

  return (
    <div
      className={cn(
        "fixed inset-0 z-50 flex flex-col pt-[env(safe-area-inset-top)]",
        ytPlaying && !showQueue && !showLyrics ? "bg-transparent" : "bg-bg",
      )}
      role="dialog"
      aria-modal="true"
      aria-label="Player"
    >
      <div className="relative z-[70] flex items-center justify-between bg-bg px-3 py-2">
        <button
          type="button"
          onClick={() => {
            if (showLyrics) setShowLyrics(false);
            else if (showQueue) setShowQueue(false);
            else setShowFullPlayer(false);
          }}
          className="flex size-11 items-center justify-center rounded-full text-fg"
          aria-label="Chiudi"
        >
          <ChevronDown className="size-6" />
        </button>
        <p className="text-xs font-medium tracking-wide text-muted uppercase">In riproduzione</p>
        <button
          type="button"
          onClick={() => setShowQueue(!showQueue)}
          className={cn("flex size-11 items-center justify-center rounded-full", showQueue ? "text-primary" : "text-fg")}
          aria-label="Coda"
        >
          <ListMusic className="size-5" />
        </button>
      </div>

      {showQueue ? (
        <div className="flex-1 overflow-y-auto px-3 pb-8">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-base font-semibold">Coda</h2>
            <button type="button" onClick={() => setShowQueue(false)} className="text-muted">
              <X className="size-5" />
            </button>
          </div>
          {queue.map((t, i) => (
            <TrackRow key={`${t.id}-${i}`} track={t} queue={queue} index={i} showIndex />
          ))}
        </div>
      ) : showLyrics ? (
        <div ref={lyricsRef} className="flex-1 overflow-y-auto px-6 pb-8">
          {lyrics.length === 0 ? (
            <p className="pt-16 text-center text-sm text-muted">Testi non disponibili per questo brano.</p>
          ) : (
            lyrics.map((line, i) => (
              <p
                key={`${line.timeMs}-${i}`}
                data-i={i}
                className={cn(
                  "py-2 text-center text-lg leading-snug transition-colors duration-150",
                  i === lyricIndex ? "font-semibold text-fg" : "text-subtle",
                )}
              >
                {line.text}
              </p>
            ))
          )}
        </div>
      ) : (
        <div className="flex flex-1 flex-col px-6 pb-4">
          <div
            className={cn(
              "mx-auto mt-2 aspect-square w-full max-w-sm overflow-hidden rounded-2xl shadow-2xl",
              ytPlaying ? "bg-transparent" : "bg-elevated",
            )}
          >
            {ytPlaying ? null : <TrackArt src={current.artwork} alt={current.title} />}
          </div>
          <div className="-mx-6 mt-0 flex-1 bg-bg px-6 pt-6">
          <div className="flex items-start gap-3">
            <div className="min-w-0 flex-1">
              <h1 className="truncate text-2xl font-semibold tracking-tight text-fg">{current.title}</h1>
              <p className="mt-1 truncate text-sm text-muted">{current.artist}</p>
              {current.isLive ? (
                <p className="mt-1 flex items-center gap-1.5 text-xs font-medium text-primary">
                  <Radio className="size-3.5" /> In diretta
                </p>
              ) : ytPlaying ? (
                <p className="mt-1 text-xs text-subtle">YouTube Music · testi SimpMusic</p>
              ) : null}
            </div>
            <button
              type="button"
              onClick={() => toggleLike(current)}
              className={cn("flex size-11 items-center justify-center rounded-full", liked ? "text-primary" : "text-muted")}
              aria-label="Preferito"
            >
              <Heart className={cn("size-6", liked && "fill-current")} />
            </button>
          </div>

          {!current.isLive ? (
            <div className="mt-6">
              <input
                type="range"
                min={0}
                max={duration || 30}
                step={0.25}
                value={Math.min(currentTime, duration || 30)}
                onChange={(e) => seek(Number(e.target.value))}
                className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-elevated accent-primary"
                aria-label="Posizione"
                style={{
                  background: `linear-gradient(to right, var(--color-primary) ${progress}%, var(--color-elevated) ${progress}%)`,
                }}
              />
              <div className="mt-1.5 flex justify-between text-xs tabular-nums text-subtle">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>
          ) : (
            <div className="mt-8 h-1.5 overflow-hidden rounded-full bg-elevated">
              <div className="h-full w-1/3 animate-pulse rounded-full bg-primary" />
            </div>
          )}

          <div className="mt-4 flex items-center justify-between">
            <button
              type="button"
              onClick={toggleShuffle}
              className={cn("flex size-11 items-center justify-center", shuffle ? "text-primary" : "text-muted")}
              aria-label="Shuffle"
            >
              <Shuffle className="size-5" />
            </button>
            <button type="button" onClick={prev} className="flex size-14 items-center justify-center text-fg" aria-label="Precedente">
              <SkipBack className="size-7 fill-current" />
            </button>
            <button
              type="button"
              onClick={togglePlay}
              className="flex size-16 items-center justify-center rounded-full bg-fg text-bg"
              aria-label={isPlaying ? "Pausa" : "Riproduci"}
            >
              {isPlaying ? <Pause className="size-7 fill-current" /> : <Play className="ml-0.5 size-7 fill-current" />}
            </button>
            <button type="button" onClick={next} className="flex size-14 items-center justify-center text-fg" aria-label="Successivo">
              <SkipForward className="size-7 fill-current" />
            </button>
            <button
              type="button"
              onClick={cycleRepeat}
              className={cn("flex size-11 items-center justify-center", repeat !== "off" ? "text-primary" : "text-muted")}
              aria-label="Ripeti"
            >
              <RepeatIcon className="size-5" />
            </button>
          </div>

          <div className="mt-5 hidden items-center gap-3 md:flex">
            <button type="button" onClick={toggleMute} className="text-muted" aria-label="Volume">
              {isMuted || volume === 0 ? <VolumeX className="size-4" /> : <Volume2 className="size-4" />}
            </button>
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={isMuted ? 0 : volume}
              onChange={(e) => setVolume(Number(e.target.value))}
              className="h-1 w-full appearance-none rounded-full bg-elevated accent-primary"
            />
          </div>

          <div className="mt-auto flex items-center justify-between pb-[env(safe-area-inset-bottom)] pt-4">
            <button
              type="button"
              onClick={() => {
                setShowLyrics(!showLyrics);
                setShowQueue(false);
              }}
              className={cn(
                "flex items-center gap-2 rounded-full px-3 py-2 text-xs font-medium",
                showLyrics ? "text-primary" : "text-muted",
              )}
            >
              <Mic2 className="size-4" />
              Testi
            </button>
            <div className="flex items-center gap-1">
              {[15, 30, 45].map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setSleep(sleepEndsAt ? null : m)}
                  className={cn(
                    "rounded-full px-2.5 py-1.5 text-[11px] font-medium",
                    sleepEndsAt ? "text-primary" : "text-muted",
                  )}
                >
                  {m}m
                </button>
              ))}
              <Clock className="ml-1 size-3.5 text-subtle" />
            </div>
          </div>
          </div>
        </div>
      )}
    </div>
  );
}
