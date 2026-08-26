import type { ReactNode } from "react";
import { Heart, Pause, Play, Radio } from "lucide-react";
import { FALLBACK_ART, type Track } from "@/lib/music/types";
import { cn, formatTime } from "@/lib/utils";
import { useFlowStore } from "@/stores/flow-store";

export function TrackArt({
  src,
  alt,
  className,
}: {
  src?: string;
  alt: string;
  className?: string;
}) {
  return (
    <img
      src={src || FALLBACK_ART}
      alt={alt}
      referrerPolicy="no-referrer"
      className={cn("size-full object-cover", className)}
      loading="lazy"
      decoding="async"
      onError={(e) => {
        const img = e.currentTarget;
        if (img.src.endsWith(FALLBACK_ART)) return;
        img.src = FALLBACK_ART;
      }}
    />
  );
}

export function PlayingBars({ className }: { className?: string }) {
  return (
    <span className={cn("flex h-3.5 items-end gap-0.5", className)} aria-hidden>
      <span className="eq-bar h-full w-0.5 rounded-full bg-primary" />
      <span className="eq-bar h-full w-0.5 rounded-full bg-primary" style={{ animationDelay: "0.18s" }} />
      <span className="eq-bar h-full w-0.5 rounded-full bg-primary" style={{ animationDelay: "0.32s" }} />
    </span>
  );
}

export function TrackRow({
  track,
  queue,
  index,
  showIndex,
}: {
  track: Track;
  queue?: Track[];
  index?: number;
  showIndex?: boolean;
}) {
  const current = useFlowStore((s) => s.current);
  const isPlaying = useFlowStore((s) => s.isPlaying);
  const playTrack = useFlowStore((s) => s.playTrack);
  const togglePlay = useFlowStore((s) => s.togglePlay);
  const toggleLike = useFlowStore((s) => s.toggleLike);
  const liked = useFlowStore((s) => s.liked.some((t) => t.id === track.id));
  const active = current?.id === track.id;

  const onPlay = () => {
    if (active) togglePlay();
    else playTrack(track, queue);
  };

  return (
    <div
      className={cn(
        "flex min-h-14 items-center gap-3 rounded-xl px-2 py-1.5 transition-colors duration-150",
        active ? "bg-elevated" : "hover:bg-elevated/70",
      )}
    >
      <button
        type="button"
        onClick={onPlay}
        className="flex min-w-0 flex-1 items-center gap-3 text-left"
        aria-label={active && isPlaying ? `Pausa ${track.title}` : `Riproduci ${track.title}`}
      >
        {showIndex ? (
          <span className="w-5 shrink-0 text-center text-xs font-medium tabular-nums text-subtle">
            {active && isPlaying ? <PlayingBars className="mx-auto" /> : (index ?? 0) + 1}
          </span>
        ) : null}
        <span className="relative size-12 shrink-0 overflow-hidden rounded-md bg-elevated">
          <TrackArt src={track.artwork} alt="" />
          {active && isPlaying ? (
            <span className="absolute inset-0 flex items-center justify-center bg-bg/55">
              <PlayingBars />
            </span>
          ) : null}
        </span>
        <span className="min-w-0 flex-1">
          <span className={cn("block truncate text-sm font-medium", active ? "text-primary" : "text-fg")}>
            {track.title}
          </span>
          <span className="mt-0.5 flex items-center gap-1.5 text-xs text-muted">
            {track.isLive ? <Radio className="size-3 shrink-0" /> : null}
            <span className="truncate">{track.artist}</span>
            {track.isPreview ? <span className="shrink-0 text-subtle">30s</span> : null}
          </span>
        </span>
      </button>
      {!track.isLive && track.duration > 0 ? (
        <span className="hidden w-10 text-right text-xs tabular-nums text-subtle sm:block">
          {formatTime(track.duration)}
        </span>
      ) : null}
      <button
        type="button"
        onClick={() => toggleLike(track)}
        className={cn(
          "flex size-11 shrink-0 items-center justify-center rounded-full",
          liked ? "text-primary" : "text-subtle",
        )}
        aria-label={liked ? "Rimuovi dai preferiti" : "Aggiungi ai preferiti"}
      >
        <Heart className={cn("size-4", liked && "fill-current")} />
      </button>
      <button
        type="button"
        onClick={onPlay}
        className="flex size-11 shrink-0 items-center justify-center rounded-full text-fg"
        aria-hidden
        tabIndex={-1}
      >
        {active && isPlaying ? <Pause className="size-4 fill-current" /> : <Play className="size-4 fill-current" />}
      </button>
    </div>
  );
}

export function TrackCard({ track, queue }: { track: Track; queue?: Track[] }) {
  const current = useFlowStore((s) => s.current);
  const isPlaying = useFlowStore((s) => s.isPlaying);
  const playTrack = useFlowStore((s) => s.playTrack);
  const togglePlay = useFlowStore((s) => s.togglePlay);
  const active = current?.id === track.id;

  return (
    <button
      type="button"
      onClick={() => (active ? togglePlay() : playTrack(track, queue))}
      className="group w-36 shrink-0 text-left sm:w-40"
    >
      <span className="relative block aspect-square overflow-hidden rounded-xl bg-elevated">
        <TrackArt src={track.artwork} alt="" className="transition-transform duration-300 group-hover:scale-105" />
        <span
          className={cn(
            "absolute right-2 bottom-2 flex size-10 items-center justify-center rounded-full bg-primary text-primary-fg shadow-md transition-opacity duration-150",
            active && isPlaying ? "opacity-100" : "opacity-0 group-hover:opacity-100",
          )}
        >
          {active && isPlaying ? <Pause className="size-4 fill-current" /> : <Play className="ml-0.5 size-4 fill-current" />}
        </span>
      </span>
      <span className={cn("mt-2 block truncate text-sm font-medium", active ? "text-primary" : "text-fg")}>
        {track.title}
      </span>
      <span className="mt-0.5 block truncate text-xs text-muted">{track.artist}</span>
    </button>
  );
}

export function SectionHeader({
  title,
  action,
  onAction,
}: {
  title: string;
  action?: string;
  onAction?: () => void;
}) {
  return (
    <div className="mb-3 flex items-end justify-between gap-3">
      <h2 className="text-lg font-semibold tracking-tight text-fg">{title}</h2>
      {action && onAction ? (
        <button type="button" onClick={onAction} className="text-xs font-medium text-primary">
          {action}
        </button>
      ) : null}
    </div>
  );
}

export function HScroll({ children }: { children: ReactNode }) {
  return (
    <div className="scrollbar-none -mx-4 flex gap-3 overflow-x-auto px-4 pb-1 sm:-mx-6 sm:px-6">{children}</div>
  );
}

export function QuickTile({ track, queue }: { track: Track; queue: Track[] }) {
  const current = useFlowStore((s) => s.current);
  const isPlaying = useFlowStore((s) => s.isPlaying);
  const playTrack = useFlowStore((s) => s.playTrack);
  const togglePlay = useFlowStore((s) => s.togglePlay);
  const active = current?.id === track.id;

  return (
    <button
      type="button"
      onClick={() => (active ? togglePlay() : playTrack(track, queue))}
      className="flex min-h-14 items-center gap-3 overflow-hidden rounded-xl bg-surface text-left ring-1 ring-border"
    >
      <span className="size-14 shrink-0 overflow-hidden bg-elevated">
        <TrackArt src={track.artwork} alt="" />
      </span>
      <span className="min-w-0 flex-1 pr-2">
        <span className={cn("block truncate text-sm font-medium", active ? "text-primary" : "text-fg")}>
          {track.title}
        </span>
      </span>
      {active && isPlaying ? <PlayingBars className="mr-3" /> : null}
    </button>
  );
}
