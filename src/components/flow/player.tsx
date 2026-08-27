import { useEffect, useRef, useState } from "react";
import {
  ChevronDown,
  Clock,
  Gauge,
  Heart,
  ListMusic,
  ListPlus,
  Mic2,
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
  Volume2,
  VolumeX,
} from "lucide-react";
import { getTrackLyrics, type LyricLine } from "@/lib/music/lyrics";
import { clearAndroidNowPlaying, showAndroidNowPlaying } from "@/lib/music/android-bg";
import { bindLockScreenActions, isAndroid, isAppleMobile, prefersNativeYtAudio, pushLockScreen } from "@/lib/music/lock-screen";
import { cachedAudioUrl, loadLocalAudio, prefetchAudio } from "@/lib/music/offline-audio";
import { cn, formatTime, useOpenTransition } from "@/lib/utils";
import { useFlowStore } from "@/stores/flow-store";
import { PlayingBars, shareTrack, TrackArt, TrackRow } from "./tracks";

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

const RATES = [0.75, 1, 1.25, 1.5, 2];

function IconSwap({
  on,
  onIcon: OnIcon,
  offIcon: OffIcon,
  iconClass,
}: {
  on: boolean;
  onIcon: typeof Pause;
  offIcon: typeof Play;
  iconClass?: string;
}) {
  return (
    <span className="relative inline-flex size-7 items-center justify-center">
      <OnIcon
        className={cn(
          "icon-swap absolute",
          iconClass,
          on ? "scale-100 opacity-100 blur-none" : "scale-[0.25] opacity-0 blur-[4px]",
        )}
      />
      <OffIcon
        className={cn(
          "icon-swap",
          iconClass,
          on ? "scale-[0.25] opacity-0 blur-[4px]" : "scale-100 opacity-100 blur-none",
        )}
      />
    </span>
  );
}

export function AudioEngine() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const keepAliveRef = useRef<HTMLAudioElement | null>(null);
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
  const duration = useFlowStore((s) => s.duration);
  const sleepEndsAt = useFlowStore((s) => s.sleepEndsAt);
  const showFullPlayer = useFlowStore((s) => s.showFullPlayer);
  const showQueue = useFlowStore((s) => s.showQueue);
  const showLyrics = useFlowStore((s) => s.showLyrics);
  const hideVideo = useFlowStore((s) => s.hideVideo);
  const setCurrentTime = useFlowStore((s) => s.setCurrentTime);
  const setDuration = useFlowStore((s) => s.setDuration);
  const onEnded = useFlowStore((s) => s.onEnded);
  const pause = useFlowStore((s) => s.pause);
  const resume = useFlowStore((s) => s.resume);
  const next = useFlowStore((s) => s.next);
  const prev = useFlowStore((s) => s.prev);
  const lastSeek = useRef(0);
  const eqRef = useRef<{
    ctx: AudioContext;
    bass: BiquadFilterNode;
    treble: BiquadFilterNode;
  } | null>(null);
  const lastUi = useRef(0);
  const settings = useFlowStore((s) => s.settings);
  const isYt = current?.source === "ytmusic" && Boolean(current.videoId);
  const [ytNative, setYtNative] = useState(() => prefersNativeYtAudio());
  const hero = isYt && !ytNative && showFullPlayer && !showQueue && !showLyrics && !hideVideo;

  useEffect(() => {
    if (!isYt || ytNative || !hostRef.current) return;
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
              const host = hostRef.current;
              const iframe = host?.querySelector("iframe") ?? (host instanceof HTMLIFrameElement ? host : null);
              if (iframe) {
                iframe.setAttribute("playsinline", "1");
                iframe.setAttribute("webkit-playsinline", "1");
                iframe.setAttribute(
                  "allow",
                  "autoplay; encrypted-media; picture-in-picture; fullscreen; accelerometer",
                );
              }
              e.target.setVolume(isMuted ? 0 : Math.round(volume * 100));
              const id = useFlowStore.getState().current?.videoId;
              if (id) {
                ytVideo.current = id;
                e.target.loadVideoById(id);
                if (useFlowStore.getState().isPlaying) e.target.playVideo();
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
  }, [isYt, ytNative]);

  useEffect(() => {
    const id = current?.videoId;
    if (ytNative || !isYt || !id || !ytReady.current || !ytRef.current) return;
    if (ytVideo.current === id) {
      if (isPlaying) ytRef.current.playVideo();
      return;
    }
    ytVideo.current = id;
    ytRef.current.loadVideoById(id);
  }, [current?.id, current?.videoId, isYt, isPlaying, ytNative]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    let cancelled = false;

    const applySrc = (src: string) => {
      if (cancelled || !src) return;
      if (audio.dataset.src === src) return;
      audio.dataset.src = src;
      delete audio.dataset.retried;
      audio.setAttribute("referrerpolicy", "no-referrer");
      audio.setAttribute("playsinline", "true");
      audio.setAttribute("webkit-playsinline", "true");
      audio.src = src;
      audio.load();
      if (useFlowStore.getState().isPlaying) {
        void audio.play().catch(() => {
          window.setTimeout(() => {
            void audio.play().catch(() => {
              if (isYt && !document.hidden) setYtNative(false);
              else if (!isYt) pause();
            });
          }, 800);
        });
      }
    };

    if (isYt && !ytNative) {
      audio.pause();
      audio.removeAttribute("src");
      delete audio.dataset.src;
      return;
    }

    if (isYt && current?.videoId) {
      const id = current.videoId;
      const local = cachedAudioUrl(id);
      if (local) applySrc(local);
      else if (!prefersNativeYtAudio()) applySrc(`/api/stream?v=${id}`);
      void loadLocalAudio(id)
        .then((url) => {
          if (cancelled || !audioRef.current) return;
          if (useFlowStore.getState().current?.videoId !== id) return;
          const el = audioRef.current;
          if (el.dataset.src === url) {
            if (useFlowStore.getState().isPlaying) void el.play().catch(() => {});
            return;
          }
          const t = el.currentTime;
          const should = useFlowStore.getState().isPlaying;
          el.dataset.src = url;
          el.src = url;
          el.load();
          const onMeta = () => {
            el.removeEventListener("loadedmetadata", onMeta);
            if (t > 0 && Number.isFinite(t)) el.currentTime = t;
            if (should) void el.play().catch(() => {});
          };
          el.addEventListener("loadedmetadata", onMeta);
        })
        .catch(() => {
          if (!cancelled && !document.hidden && !prefersNativeYtAudio()) setYtNative(false);
        });
      const q = useFlowStore.getState();
      const upcoming = q.queue.slice(q.queueIndex + 1, q.queueIndex + 3);
      for (const t of upcoming) {
        if (t.videoId) prefetchAudio(t.videoId);
      }
      return () => {
        cancelled = true;
      };
    }

    const src = current?.streamUrl || "";
    if (!src) {
      audio.pause();
      audio.removeAttribute("src");
      delete audio.dataset.src;
      return;
    }
    applySrc(src);
    return () => {
      cancelled = true;
    };
  }, [current?.id, current?.streamUrl, current?.videoId, isYt, ytNative]);

  useEffect(() => {
    if (isYt && !ytNative) {
      const p = ytRef.current;
      if (!p || !ytReady.current) return;
      if (isPlaying) p.playVideo();
      else p.pauseVideo();
      return;
    }
    if (isYt && ytNative && ytRef.current && ytReady.current) {
      ytRef.current.pauseVideo();
      ytRef.current.mute();
    }
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) void audio.play().catch(() => pause());
    else audio.pause();
  }, [isPlaying, isYt, ytNative]);

  useEffect(() => {
    const p = ytRef.current;
    let gain = isMuted ? 0 : volume;
    if (settings.normalize) gain *= 0.9;
    if (!prefersNativeYtAudio() && !isYt && settings.crossfade > 0 && duration > 0) {
      const left = duration - currentTime;
      if (left >= 0 && left < settings.crossfade) gain *= left / settings.crossfade;
    }
    gain = Math.min(1, Math.max(0, gain));
    if (!ytNative && p && ytReady.current) {
      if (isMuted) p.mute();
      else {
        p.unMute();
        p.setVolume(Math.round(gain * 100));
      }
      try {
        p.setPlaybackRate(current?.isLive ? 1 : playbackRate);
      } catch {
        /* some videos reject rate */
      }
    }
    const audio = audioRef.current;
    if (audio) {
      audio.volume = gain;
      audio.playbackRate = current?.isLive ? 1 : playbackRate;
    }
  }, [volume, isMuted, playbackRate, current?.isLive, settings.normalize, settings.crossfade, isYt, ytNative, duration]);

  useEffect(() => {
    if (prefersNativeYtAudio()) return;
    const audio = audioRef.current;
    if (!audio || eqRef.current) return;
    try {
      const ctx = new AudioContext();
      const src = ctx.createMediaElementSource(audio);
      const bass = ctx.createBiquadFilter();
      bass.type = "lowshelf";
      bass.frequency.value = 180;
      const treble = ctx.createBiquadFilter();
      treble.type = "highshelf";
      treble.frequency.value = 4500;
      src.connect(bass);
      bass.connect(treble);
      treble.connect(ctx.destination);
      eqRef.current = { ctx, bass, treble };
    } catch {
      /* Web Audio not available */
    }
  }, []);

  useEffect(() => {
    const eq = eqRef.current;
    if (!eq) return;
    eq.bass.gain.value = settings.eqBass;
    eq.treble.gain.value = settings.eqTreble;
    void eq.ctx.resume();
  }, [settings.eqBass, settings.eqTreble]);

  useEffect(() => {
    if (seekVersion === lastSeek.current) return;
    lastSeek.current = seekVersion;
    if (current?.isLive) return;
    if (isYt && !ytNative && ytRef.current && ytReady.current) {
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
    if (!isYt || ytNative || !isPlaying) return;
    const t = window.setInterval(() => {
      const p = ytRef.current;
      if (!p || !ytReady.current) return;
      const time = p.getCurrentTime();
      const dur = p.getDuration();
      if (Number.isFinite(time) && !document.hidden) setCurrentTime(time);
      if (Number.isFinite(dur) && dur > 0) setDuration(dur);
      const cur = useFlowStore.getState().current;
      if (cur) {
        pushLockScreen(cur, true, time, dur, useFlowStore.getState().playbackRate);
      }
    }, document.hidden ? 2000 : 500);
    return () => window.clearInterval(t);
  }, [isYt, ytNative, isPlaying, setCurrentTime, setDuration]);

  useEffect(() => {
    const host = hostRef.current;
    const p = ytRef.current;
    if (!host || !p || !ytReady.current) return;
    p.setSize(host.clientWidth, host.clientHeight);
  }, [showFullPlayer, isYt, hideVideo, showQueue, showLyrics]);

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
    if (!current || typeof navigator === "undefined") return;
    pushLockScreen(current, isPlaying, currentTime, current.isLive ? 0 : duration, current.isLive ? 1 : playbackRate);
    bindLockScreenActions({
      play: () => {
        resume();
        void audioRef.current?.play().catch(() => {});
        if (!ytNative && ytRef.current && ytReady.current) ytRef.current.playVideo();
      },
      pause: () => pause(),
      prev: () => prev(),
      next: () => next(),
      seek: (time) => useFlowStore.getState().seek(time),
      skip: (delta) => useFlowStore.getState().skipBy(delta),
      stop: () => pause(),
    });
  }, [current, isPlaying, duration, playbackRate, resume, pause, prev, next]);

  useEffect(() => {
    if (!isAndroid()) return;
    if (isPlaying && current) showAndroidNowPlaying(current);
    else clearAndroidNowPlaying();
  }, [isPlaying, current?.id, current?.title, current?.artist]);

  useEffect(() => {
    const keep = keepAliveRef.current;
    if (!keep) return;
    const apple = isAppleMobile();
    if (isYt && isPlaying && !ytNative && !apple && !isAndroid()) {
      if (keep.paused) void keep.play().catch(() => {});
    } else if (!keep.paused) {
      keep.pause();
    }
  }, [isYt, isPlaying, ytNative]);

  useEffect(() => {
    if (!isPlaying || !current) return;
    if (isAndroid() && typeof Notification !== "undefined" && Notification.permission === "default") {
      void Notification.requestPermission().catch(() => {});
    }
    const onVis = () => {
      if (!useFlowStore.getState().isPlaying) return;
      const audio = audioRef.current;
      const id = useFlowStore.getState().current?.videoId;
      if (document.hidden && id && audio) {
        const local = cachedAudioUrl(id);
        if (local && audio.dataset.src !== local) {
          const t = audio.currentTime;
          audio.dataset.src = local;
          audio.src = local;
          audio.load();
          audio.addEventListener(
            "loadedmetadata",
            () => {
              if (t > 0) audio.currentTime = t;
              void audio.play().catch(() => {});
            },
            { once: true },
          );
        }
      }
      if (audio?.paused && (ytNative || !isYt)) void audio.play().catch(() => {});
      if (!ytNative && isYt && ytRef.current && ytReady.current) {
        try {
          ytRef.current.playVideo();
        } catch {
          /* ignore */
        }
      }
    };
    document.addEventListener("visibilitychange", onVis);
    window.addEventListener("pageshow", onVis);
    return () => {
      document.removeEventListener("visibilitychange", onVis);
      window.removeEventListener("pageshow", onVis);
    };
  }, [isPlaying, current?.id, isYt, ytNative]);

  useEffect(() => {
    const unlock = () => {
      const el = audioRef.current;
      if (el) {
        void el
          .play()
          .then(() => {
            if (!useFlowStore.getState().isPlaying) el.pause();
          })
          .catch(() => {});
      }
      const keep = keepAliveRef.current;
      if (keep) {
        void keep.play().then(() => keep.pause()).catch(() => {});
      }
    };
    window.addEventListener("touchstart", unlock, { once: true, passive: true });
    window.addEventListener("pointerdown", unlock, { once: true, passive: true });
    return () => {
      window.removeEventListener("touchstart", unlock);
      window.removeEventListener("pointerdown", unlock);
    };
  }, []);

  return (
    <>
      <audio
        ref={audioRef}
        className="pointer-events-none fixed bottom-0 left-0 h-px w-px opacity-[0.01]"
        playsInline
        preload="auto"
        controls={false}
        onTimeUpdate={(e) => {
          const t = e.currentTarget.currentTime;
          const now = performance.now();
          const gap = document.hidden ? 2000 : 400;
          if (now - lastUi.current >= gap) {
            lastUi.current = now;
            setCurrentTime(t);
          }
          const cur = useFlowStore.getState().current;
          if (cur && (cur.source !== "ytmusic" || ytNative)) {
            pushLockScreen(cur, !e.currentTarget.paused, t, e.currentTarget.duration, e.currentTarget.playbackRate);
          }
        }}
        onDurationChange={(e) => {
          const d = e.currentTarget.duration;
          if (Number.isFinite(d)) setDuration(d);
        }}
        onEnded={onEnded}
        onPause={(e) => {
          const el = e.currentTarget;
          window.setTimeout(() => {
            if (!useFlowStore.getState().isPlaying) return;
            if (el.paused) void el.play().catch(() => {});
          }, 350);
        }}
        onError={() => {
          const audio = audioRef.current;
          const cur = useFlowStore.getState().current;
          if (cur?.source === "ytmusic" && ytNative && cur.videoId && audio && audio.dataset.retried !== "1") {
            audio.dataset.retried = "1";
            void loadLocalAudio(cur.videoId)
              .then((url) => {
                if (!audioRef.current) return;
                audioRef.current.src = url;
                audioRef.current.dataset.src = url;
                audioRef.current.load();
                if (useFlowStore.getState().isPlaying) void audioRef.current.play().catch(() => {});
              })
              .catch(() => {
                if (!document.hidden) setYtNative(false);
              });
            return;
          }
          if (document.hidden) return;
          if (isYt && ytNative) {
            setYtNative(false);
            return;
          }
          if (cur && cur.source !== "ytmusic") onEnded();
        }}
      />
      <audio
        ref={keepAliveRef}
        src="/silence.wav"
        loop
        playsInline
        preload="auto"
        className="pointer-events-none fixed bottom-0 left-1 h-px w-px opacity-[0.01]"
      />
      <div
        className={cn(
          "overflow-hidden bg-bg ring-1 ring-border yt-dock",
          !isYt || ytNative ? "pointer-events-none invisible absolute" : hero
            ? "pointer-events-none fixed top-[calc(4.5rem+env(safe-area-inset-top))] left-1/2 z-40 w-[min(100%-2rem,22rem)] -translate-x-1/2 rounded-xl aspect-square"
            : isYt && hideVideo
              ? "pointer-events-none fixed right-2 bottom-[max(0.5rem,env(safe-area-inset-bottom))] z-10 size-[120px] rounded-lg opacity-20 md:size-[200px]"
              : isYt
                ? "pointer-events-auto fixed right-3 z-[60] size-[132px] rounded-lg bottom-[calc(7.25rem+env(safe-area-inset-bottom))] md:bottom-[92px] md:size-[200px]"
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
  const setShowQueue = useFlowStore((s) => s.setShowQueue);
  const setShowLyrics = useFlowStore((s) => s.setShowLyrics);
  const setVolume = useFlowStore((s) => s.setVolume);
  const toggleMute = useFlowStore((s) => s.toggleMute);
  const showFull = useFlowStore((s) => s.showFullPlayer);
  const { mounted, open } = useOpenTransition(Boolean(current), 280);
  if (!mounted || !current) return null;
  const progress = duration > 0 ? Math.min(100, (currentTime / duration) * 100) : 0;
  const RepeatIcon = repeat === "one" ? Repeat1 : Repeat;

  return (
    <div
      className={cn(
        "now-bar pointer-events-auto bg-elevated md:bg-bg",
        (!open || showFull) && "is-away",
      )}
    >
      <div className="md:hidden">
        <div className="mx-2 mb-1 overflow-hidden rounded-lg bg-elevated">
          <div className="flex items-center gap-2 px-2 py-1.5">
            <button
              type="button"
              onClick={() => setShowFullPlayer(true)}
              className="flex min-w-0 flex-1 items-center gap-3 text-left"
            >
              <span className="size-11 shrink-0 overflow-hidden rounded-md bg-surface">
                <TrackArt src={current.artwork} alt="" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium">{current.title}</span>
                <span className="block truncate text-xs text-muted">{current.artist}</span>
              </span>
            </button>
            <button
              type="button"
              onClick={() => toggleLike(current)}
              className={cn("flex size-11 items-center justify-center", liked ? "text-primary" : "text-fg")}
              aria-label="Preferito"
            >
              <Heart className={cn("heart-icon size-5", liked && "is-on fill-current")} />
            </button>
            <button
              type="button"
              onClick={togglePlay}
              className="pressable flex size-11 items-center justify-center text-fg"
              aria-label={isPlaying ? "Pausa" : "Riproduci"}
            >
              <IconSwap on={isPlaying} onIcon={Pause} offIcon={Play} iconClass="size-5 fill-current" />
            </button>
          </div>
          {!current.isLive ? (
            <div
              className="h-0.5 w-full bg-subtle/40"
              aria-hidden
            >
              <div className="h-full bg-primary" style={{ width: `${progress}%` }} />
            </div>
          ) : (
            <div className="h-0.5 w-full bg-primary" />
          )}
        </div>
      </div>

      <div className="hidden h-[90px] items-center gap-4 px-4 md:flex">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <button type="button" onClick={() => setShowFullPlayer(true)} className="flex min-w-0 items-center gap-3 text-left">
            <span className="size-14 shrink-0 overflow-hidden rounded bg-surface">
              <TrackArt src={current.artwork} alt="" />
            </span>
            <span className="min-w-0">
              <span className="block max-w-[14rem] truncate text-sm font-medium">{current.title}</span>
              <span className="block max-w-[14rem] truncate text-xs text-muted">{current.artist}</span>
            </span>
          </button>
          <button
            type="button"
            onClick={() => toggleLike(current)}
            className={cn("flex size-8 items-center justify-center", liked ? "text-primary" : "text-muted hover:text-fg")}
            aria-label="Preferito"
          >
            <Heart className={cn("heart-icon size-4", liked && "is-on fill-current")} />
          </button>
        </div>

        <div className="flex w-[42%] max-w-xl min-w-[22rem] flex-col items-center gap-2">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={toggleShuffle}
              className={cn("pressable flex size-8 items-center justify-center", shuffle ? "text-primary" : "text-muted hover:text-fg")}
              aria-label="Shuffle"
            >
              <Shuffle className="size-4" />
            </button>
            <button type="button" onClick={prev} className="pressable flex size-8 items-center justify-center text-muted hover:text-fg" aria-label="Precedente">
              <SkipBack className="size-5 fill-current" />
            </button>
            <button
              type="button"
              onClick={togglePlay}
              className="play-fab flex size-10 items-center justify-center rounded-full bg-fg text-bg"
              aria-label={isPlaying ? "Pausa" : "Riproduci"}
            >
              <IconSwap on={isPlaying} onIcon={Pause} offIcon={Play} iconClass="size-4 fill-current" />
            </button>
            <button type="button" onClick={next} className="pressable flex size-8 items-center justify-center text-muted hover:text-fg" aria-label="Successivo">
              <SkipForward className="size-5 fill-current" />
            </button>
            <button
              type="button"
              onClick={cycleRepeat}
              className={cn("pressable flex size-8 items-center justify-center", repeat !== "off" ? "text-primary" : "text-muted hover:text-fg")}
              aria-label="Ripeti"
            >
              <RepeatIcon className="size-4" />
            </button>
          </div>
          {current.isLive ? (
            <p className="flex items-center gap-1.5 text-xs font-medium text-primary">
              <span className="live-dot size-1.5 rounded-full bg-primary" />
              In diretta
            </p>
          ) : (
            <div className="flex w-full items-center gap-2">
              <span className="w-10 text-right text-[11px] tabular-nums text-subtle">{formatTime(currentTime)}</span>
              <input
                type="range"
                min={0}
                max={duration || 1}
                step={0.25}
                value={Math.min(currentTime, duration || 1)}
                onChange={(e) => seek(Number(e.target.value))}
                className="seek flex-1"
                aria-label="Posizione"
                style={{
                  background: `linear-gradient(to right, var(--color-primary) ${progress}%, var(--color-elevated) ${progress}%)`,
                }}
              />
              <span className="w-10 text-[11px] tabular-nums text-subtle">{formatTime(duration)}</span>
            </div>
          )}
        </div>

        <div className="flex flex-1 items-center justify-end gap-1">
          <button
            type="button"
            onClick={() => {
              setShowFullPlayer(true);
              setShowLyrics(true);
            }}
            className="pressable flex size-8 items-center justify-center text-muted hover:text-fg"
            aria-label="Testi"
          >
            <Mic2 className="size-4" />
          </button>
          <button
            type="button"
            onClick={() => {
              setShowFullPlayer(true);
              setShowQueue(true);
            }}
            className="pressable flex size-8 items-center justify-center text-muted hover:text-fg"
            aria-label="Coda"
          >
            <ListMusic className="size-4" />
          </button>
          <button type="button" onClick={toggleMute} className="pressable flex size-8 items-center justify-center text-muted hover:text-fg" aria-label="Volume">
            {isMuted || volume === 0 ? <VolumeX className="size-4" /> : <Volume2 className="size-4" />}
          </button>
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={isMuted ? 0 : volume}
            onChange={(e) => setVolume(Number(e.target.value))}
            className="seek w-24"
            aria-label="Volume"
            style={{
              background: `linear-gradient(to right, var(--color-fg) ${(isMuted ? 0 : volume) * 100}%, var(--color-elevated) ${(isMuted ? 0 : volume) * 100}%)`,
            }}
          />
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
  const shuffle = useFlowStore((s) => s.shuffle);
  const repeat = useFlowStore((s) => s.repeat);
  const volume = useFlowStore((s) => s.volume);
  const isMuted = useFlowStore((s) => s.isMuted);
  const queue = useFlowStore((s) => s.queue);
  const queueIndex = useFlowStore((s) => s.queueIndex);
  const showQueue = useFlowStore((s) => s.showQueue);
  const showLyrics = useFlowStore((s) => s.showLyrics);
  const sleepEndsAt = useFlowStore((s) => s.sleepEndsAt);
  const playbackRate = useFlowStore((s) => s.playbackRate);
  const hideVideo = useFlowStore((s) => s.hideVideo);
  const show = useFlowStore((s) => s.showFullPlayer);
  const playlists = useFlowStore((s) => s.playlists);
  const togglePlay = useFlowStore((s) => s.togglePlay);
  const next = useFlowStore((s) => s.next);
  const prev = useFlowStore((s) => s.prev);
  const seek = useFlowStore((s) => s.seek);
  const skipBy = useFlowStore((s) => s.skipBy);
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
  const setPlaybackRate = useFlowStore((s) => s.setPlaybackRate);
  const setHideVideo = useFlowStore((s) => s.setHideVideo);
  const moveQueue = useFlowStore((s) => s.moveQueue);
  const stationOn = useFlowStore((s) => s.stationOn);
  const clearQueue = useFlowStore((s) => s.clearQueue);
  const addToPlaylist = useFlowStore((s) => s.addToPlaylist);
  const createPlaylist = useFlowStore((s) => s.createPlaylist);
  const remainingTime = useFlowStore((s) => s.settings.remainingTime);

  const [lyrics, setLyrics] = useState<LyricLine[]>([]);
  const [showSleep, setShowSleep] = useState(false);
  const [showRate, setShowRate] = useState(false);
  const [showPl, setShowPl] = useState(false);
  const [plTitle, setPlTitle] = useState("");
  const [leftSleep, setLeftSleep] = useState(0);
  const lyricsRef = useRef<HTMLDivElement | null>(null);
  const { mounted, open } = useOpenTransition(show, 260);

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

  useEffect(() => {
    if (!sleepEndsAt) {
      setLeftSleep(0);
      return;
    }
    const tick = () => setLeftSleep(Math.max(0, sleepEndsAt - Date.now()));
    tick();
    const t = window.setInterval(tick, 1000);
    return () => window.clearInterval(t);
  }, [sleepEndsAt]);

  if (!mounted || !current) return null;
  const progress = duration > 0 ? Math.min(100, (currentTime / duration) * 100) : 0;
  const RepeatIcon = repeat === "one" ? Repeat1 : Repeat;
  const ytPlaying = current.source === "ytmusic";
  const upcoming = queue.slice(queueIndex + 1);

  return (
    <div
      className={cn(
        "player-full fixed inset-0 z-50 flex h-dvh flex-col overflow-hidden pt-[env(safe-area-inset-top)]",
        ytPlaying && !showQueue && !showLyrics ? "bg-transparent" : "bg-bg",
        open ? "is-open" : "is-closing",
      )}
      role="dialog"
      aria-modal="true"
      aria-label="Player"
    >
      {!(ytPlaying && !showQueue && !showLyrics) ? (
        <div className="pointer-events-none absolute inset-0 overflow-hidden opacity-35">
          <img
            src={current.artwork}
            alt=""
            referrerPolicy="no-referrer"
            className="size-full scale-125 object-cover blur-3xl"
          />
          <div className="absolute inset-0 bg-bg/80" />
        </div>
      ) : null}

      <div className="relative z-[70] flex items-center justify-between bg-bg/90 px-2 py-1 backdrop-blur-md">
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
        <p className="text-xs font-medium tracking-wide text-muted uppercase">
          {showQueue ? "Coda" : showLyrics ? "Testi" : "In riproduzione"}
        </p>
        <button
          type="button"
          onClick={() => setShowQueue(!showQueue)}
          className={cn("flex size-11 items-center justify-center rounded-full", showQueue ? "text-primary" : "text-fg")}
          aria-label="Coda"
        >
          <ListMusic className="size-5" />
        </button>
      </div>

      <div className="relative z-10 min-h-0 flex-1">
        <div className={cn("player-panel absolute inset-0 overflow-y-auto px-3 pb-8", showQueue ? "is-on" : "is-off")}>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-base font-semibold">
              In arrivo · {upcoming.length}
              {stationOn ? <span className="ml-2 text-xs font-medium text-primary">Radio</span> : null}
            </h2>
            <button type="button" onClick={clearQueue} className="text-xs font-medium text-muted">
              Svuota
            </button>
          </div>
          {queue.map((t, i) => (
            <div
              key={`${t.id}-${i}`}
              draggable
              onDragStart={(e) => {
                e.dataTransfer.setData("text/plain", String(i));
                e.dataTransfer.effectAllowed = "move";
              }}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const from = Number(e.dataTransfer.getData("text/plain"));
                if (Number.isFinite(from) && from !== i) moveQueue(from, i);
              }}
              className="flex items-center gap-1"
            >
              <button
                type="button"
                className="flex size-8 shrink-0 cursor-grab items-center justify-center text-subtle"
                aria-label="Sposta"
                onClick={() => {
                  if (i > 0) moveQueue(i, i - 1);
                }}
              >
                <span className="text-xs">☰</span>
              </button>
              <div className="min-w-0 flex-1">
                <TrackRow track={t} queue={queue} index={i} showIndex />
              </div>
            </div>
          ))}
        </div>
        <div
          ref={lyricsRef}
          className={cn("player-panel absolute inset-0 overflow-y-auto px-6 pb-8", showLyrics ? "is-on" : "is-off")}
        >
          {lyrics.length === 0 ? (
            <p className="pt-16 text-center text-sm text-muted">Testi non disponibili per questo brano.</p>
          ) : (
            lyrics.map((line, i) => (
              <button
                key={`${line.timeMs}-${i}`}
                type="button"
                data-i={i}
                onClick={() => seek(line.timeMs / 1000)}
                className={cn(
                  "block w-full py-2 text-center text-lg leading-snug transition-colors duration-150",
                  i === lyricIndex ? "font-semibold text-fg" : "text-subtle",
                )}
              >
                {line.text}
              </button>
            ))
          )}
        </div>
        <div
          className={cn(
            "player-panel absolute inset-0 flex flex-col overflow-hidden",
            !showQueue && !showLyrics ? "is-on" : "is-off",
          )}
        >
          <div
            className={cn(
              "player-stagger player-stagger-1 mx-auto mt-2 aspect-square w-[min(100%-3rem,22rem)] overflow-hidden rounded-xl shadow-2xl",
              ytPlaying && !hideVideo ? "bg-transparent" : "bg-elevated",
            )}
          >
            {ytPlaying && !hideVideo ? (
              <div className="flex size-full items-end justify-end p-3">
                <button
                  type="button"
                  onClick={() => setHideVideo(true)}
                  className="relative z-[80] rounded-full bg-bg/80 px-3 py-1 text-xs text-fg"
                >
                  Nascondi video
                </button>
              </div>
            ) : (
              <TrackArt src={current.artwork} alt={current.title} />
            )}
          </div>

          <div className="-mx-0 mt-0 flex-1 bg-bg px-6 pt-4 pb-4">

          {isPlaying ? (
            <div className="mx-auto mt-4 flex h-8 items-end gap-1">
              {Array.from({ length: 16 }).map((_, i) => (
                <span
                  key={i}
                  className="eq-bar w-1 rounded-full bg-primary/80"
                  style={{
                    height: `${28 + ((i * 17 + Math.floor(currentTime * 10)) % 72)}%`,
                    animationDelay: `${(i % 5) * 0.12}s`,
                  }}
                />
              ))}
            </div>
          ) : null}

          <div className="player-stagger player-stagger-2 mt-5 flex items-start gap-3">
            <div className="min-w-0 flex-1">
              <h1 className="truncate text-2xl font-semibold tracking-tight text-fg">{current.title}</h1>
              <p className="mt-1 truncate text-sm text-muted">{current.artist}</p>
              {current.isLive ? (
                <p className="mt-1 flex items-center gap-1.5 text-xs font-medium text-primary">
                  <Radio className="size-3.5" /> In diretta
                </p>
              ) : hideVideo && ytPlaying ? (
                <button type="button" onClick={() => setHideVideo(false)} className="mt-1 text-xs text-muted">
                  Mostra video
                </button>
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
            <div className="mt-5">
              <input
                type="range"
                min={0}
                max={duration || 30}
                step={0.25}
                value={Math.min(currentTime, duration || 30)}
                onChange={(e) => seek(Number(e.target.value))}
                className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-elevated"
                aria-label="Posizione"
                style={{
                  background: `linear-gradient(to right, var(--color-primary) ${progress}%, var(--color-elevated) ${progress}%)`,
                }}
              />
              <div className="mt-1.5 flex justify-between text-xs tabular-nums text-subtle">
                <span>{remainingTime && duration > 0 ? `-${formatTime(Math.max(0, duration - currentTime))}` : formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>
          ) : (
            <div className="mt-8 h-1.5 overflow-hidden rounded-full bg-elevated">
              <div className="h-full w-1/3 animate-pulse rounded-full bg-primary" />
            </div>
          )}

          <div className="player-stagger player-stagger-3 mt-3 flex items-center justify-between">
            <button
              type="button"
              onClick={toggleShuffle}
              className={cn("flex size-11 items-center justify-center", shuffle ? "text-primary" : "text-muted")}
              aria-label="Casuale"
            >
              <Shuffle className="size-5" />
            </button>
            <button
              type="button"
              onClick={() => skipBy(-10)}
              className="pressable flex size-11 items-center justify-center text-fg"
              aria-label="Indietro 10 secondi"
            >
              <RotateCcw className="size-5" />
            </button>
            <button type="button" onClick={prev} className="pressable flex size-12 items-center justify-center text-fg" aria-label="Precedente">
              <SkipBack className="size-7 fill-current" />
            </button>
            <button
              type="button"
              onClick={togglePlay}
              className="pressable flex size-16 items-center justify-center rounded-full bg-primary text-primary-fg"
              aria-label={isPlaying ? "Pausa" : "Riproduci"}
            >
              <IconSwap on={isPlaying} onIcon={Pause} offIcon={Play} iconClass="size-7 fill-current" />
            </button>
            <button type="button" onClick={next} className="pressable flex size-12 items-center justify-center text-fg" aria-label="Successivo">
              <SkipForward className="size-7 fill-current" />
            </button>
            <button
              type="button"
              onClick={() => skipBy(10)}
              className="pressable flex size-11 items-center justify-center text-fg"
              aria-label="Avanti 10 secondi"
            >
              <RotateCw className="size-5" />
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

          <div className="mt-4 flex items-center gap-3">
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
              className="h-1 w-full appearance-none rounded-full bg-elevated"
              aria-label="Volume"
            />
            <span className="w-8 text-right text-xs tabular-nums text-subtle">{Math.round((isMuted ? 0 : volume) * 100)}</span>
          </div>

          <div className="player-stagger player-stagger-4 mt-auto flex flex-wrap items-center justify-between gap-2 pb-[env(safe-area-inset-bottom)] pt-4">
            <button
              type="button"
              onClick={() => setShowLyrics(!showLyrics)}
              className={cn(
                "flex items-center gap-2 rounded-full px-3 py-2 text-xs font-medium",
                showLyrics ? "text-primary" : "text-muted",
              )}
            >
              <Mic2 className="size-4" />
              Testi
            </button>
            <button
              type="button"
              onClick={() => setShowPl((v) => !v)}
              className="flex items-center gap-2 rounded-full px-3 py-2 text-xs font-medium text-muted"
            >
              <ListPlus className="size-4" />
              Playlist
            </button>
            <button
              type="button"
              onClick={() => void shareTrack(current)}
              className="flex items-center gap-2 rounded-full px-3 py-2 text-xs font-medium text-muted"
            >
              <Share2 className="size-4" />
              Condividi
            </button>
            <button
              type="button"
              onClick={() => {
                setShowRate((v) => !v);
                setShowSleep(false);
              }}
              className="flex items-center gap-2 rounded-full px-3 py-2 text-xs font-medium text-muted"
            >
              <Gauge className="size-4" />
              {playbackRate}x
            </button>
            <button
              type="button"
              onClick={() => {
                setShowSleep((v) => !v);
                setShowRate(false);
              }}
              className={cn(
                "flex items-center gap-2 rounded-full px-3 py-2 text-xs font-medium",
                sleepEndsAt ? "text-primary" : "text-muted",
              )}
            >
              <Clock className="size-4" />
              {sleepEndsAt ? formatTime(leftSleep / 1000) : "Timer"}
            </button>
          </div>

          {showRate ? (
            <div className="flex justify-center gap-2 pb-3">
              {RATES.map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => {
                    setPlaybackRate(r);
                    setShowRate(false);
                  }}
                  className={cn(
                    "rounded-full px-3 py-1.5 text-xs font-medium",
                    playbackRate === r ? "bg-primary text-primary-fg" : "bg-surface text-fg",
                  )}
                >
                  {r}x
                </button>
              ))}
            </div>
          ) : null}

          {showSleep ? (
            <div className="flex justify-center gap-2 pb-3">
              {[15, 30, 45, 60].map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => {
                    setSleep(m);
                    setShowSleep(false);
                  }}
                  className="rounded-full bg-surface px-3 py-1.5 text-xs font-medium text-fg"
                >
                  {m} min
                </button>
              ))}
              <button
                type="button"
                onClick={() => {
                  setSleep(null);
                  setShowSleep(false);
                }}
                className="rounded-full px-3 py-1.5 text-xs font-medium text-muted"
              >
                Off
              </button>
            </div>
          ) : null}

          {showPl ? (
            <div className="mb-2 max-h-40 overflow-y-auto rounded-lg bg-elevated p-2 ring-1 ring-border">
              <form
                className="mb-1 flex gap-2"
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!plTitle.trim()) return;
                  createPlaylist(plTitle);
                  setPlTitle("");
                }}
              >
                <input
                  value={plTitle}
                  onChange={(e) => setPlTitle(e.target.value)}
                  placeholder="Nuova playlist"
                  className="h-10 min-w-0 flex-1 rounded-md bg-surface px-3 text-sm outline-none"
                />
                <button type="submit" className="text-xs font-medium text-primary">
                  Crea
                </button>
              </form>
              {playlists.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => {
                    addToPlaylist(p.id, current);
                    setShowPl(false);
                  }}
                  className="flex h-10 w-full items-center justify-between rounded-md px-2 text-sm hover:bg-surface"
                >
                  <span>{p.title}</span>
                  <span className="text-xs text-subtle">{p.trackIds.length}</span>
                </button>
              ))}
              {playlists.length === 0 ? <p className="px-2 py-3 text-xs text-muted">Crea una playlist per salvare il brano.</p> : null}
            </div>
          ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
