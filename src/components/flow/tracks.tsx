import { useRef, useState, type ReactNode } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  Disc3,
  Download,
  Heart,
  ListMusic,
  ListPlus,
  MoreHorizontal,
  Pause,
  Play,
  Radio,
  Search,
  User,
  Share2,
  QrCode,
  SkipForward,
  X,
} from "lucide-react";
import { FALLBACK_ART, type Track } from "@/lib/music/types";
import { getRelatedTracks } from "@/lib/music/catalog";
import { downloadTrack, prefetchAudio, removeDownload, useIsDownloaded } from "@/lib/music/offline-audio";
import { directPlayTrack } from "@/lib/music/native-audio";
import { cn, formatTime, useOpenTransition } from "@/lib/utils";
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

export async function shareTrack(track: Track) {
  const url = `${window.location.origin}/t/${track.videoId || track.id}`;
  const text = `${track.title} — ${track.artist}`;
  try {
    if (navigator.share) {
      await navigator.share({ title: track.title, text, url });
      return;
    }
  } catch {
    return;
  }
  try {
    await navigator.clipboard.writeText(`${text} ${url}`);
  } catch {
    /* ignore */
  }
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
  const setActionTrack = useFlowStore((s) => s.setActionTrack);
  const liked = useFlowStore((s) => s.liked.some((t) => t.id === track.id));
  const active = current?.id === track.id;

  const onPlay = () => {
    directPlayTrack(track);
    if (active) togglePlay();
    else playTrack(track, queue);
  };

  const prewarm = () => {
    if (track.videoId) void prefetchAudio(track.videoId);
  };

  return (
    <div
      className={cn(
        "list-row flex min-h-14 items-center gap-3 rounded-md px-2 py-2",
        active ? "bg-highlight" : "hover:bg-highlight",
      )}
      onMouseEnter={prewarm}
      onPointerDown={prewarm}
    >
      <button
        type="button"
        onClick={onPlay}
        onPointerDown={prewarm}
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
            {track.isLive || track.source === "radio" || track.artist === "Artista" ? (
              <span className="truncate">{track.artist}</span>
            ) : (
              <Link
                to="/a/$name"
                params={{ name: track.artist }}
                onClick={(e) => e.stopPropagation()}
                className="truncate hover:underline"
              >
                {track.artist}
              </Link>
            )}
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
        <Heart className={cn("heart-icon size-4", liked && "is-on fill-current")} />
      </button>
      <button
        type="button"
        onClick={() => setActionTrack(track)}
        className="flex size-11 shrink-0 items-center justify-center rounded-full text-subtle"
        aria-label="Altre azioni"
      >
        <MoreHorizontal className="size-4" />
      </button>
    </div>
  );
}

export function TrackCard({ track, queue }: { track: Track; queue?: Track[] }) {
  const current = useFlowStore((s) => s.current);
  const isPlaying = useFlowStore((s) => s.isPlaying);
  const playTrack = useFlowStore((s) => s.playTrack);
  const togglePlay = useFlowStore((s) => s.togglePlay);
  const setActionTrack = useFlowStore((s) => s.setActionTrack);
  const active = current?.id === track.id;

  return (
    <div className="spot-card group relative w-44 shrink-0 sm:w-48">
      <button
        type="button"
        onClick={() => (active ? togglePlay() : playTrack(track, queue))}
        className="w-full text-left"
      >
        <span className="art-shadow relative block aspect-square overflow-hidden rounded-md bg-elevated">
          <TrackArt src={track.artwork} alt="" className="art-zoom group-hover:scale-[1.04]" />
          <span
            className={cn(
              "play-fab absolute right-2 bottom-2 flex size-12 items-center justify-center rounded-full bg-primary text-primary-fg",
              active && isPlaying ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2 group-hover:translate-y-0 group-hover:opacity-100",
            )}
          >
            {active && isPlaying ? <Pause className="size-5 fill-current" /> : <Play className="ml-0.5 size-5 fill-current" />}
          </span>
        </span>
        <span className={cn("mt-3 block truncate text-sm font-bold", active ? "text-primary" : "text-fg")}>
          {track.title}
        </span>
      </button>
      {track.source !== "radio" && track.artist && track.artist !== "Artista" ? (
        <Link
          to="/a/$name"
          params={{ name: track.artist }}
          className="mt-1 block truncate text-sm text-muted hover:underline"
        >
          {track.artist}
        </Link>
      ) : (
        <span className="mt-1 block truncate text-sm text-muted">{track.artist}</span>
      )}
      <button
        type="button"
        onClick={() => setActionTrack(track)}
          className="absolute top-2 right-2 flex size-8 items-center justify-center rounded-full bg-bg/70 text-fg opacity-0 transition-[opacity,transform] duration-200 group-hover:opacity-100"
        aria-label="Altre azioni"
      >
        <MoreHorizontal className="size-4" />
      </button>
    </div>
  );
}

export function CollectionCard({
  title,
  subtitle,
  artwork,
  onPlay,
  onOpen,
}: {
  title: string;
  subtitle: string;
  artwork?: string;
  onPlay: () => void;
  onOpen?: () => void;
}) {
  return (
    <div className="spot-card group relative w-44 shrink-0 sm:w-48">
      <button type="button" onClick={onOpen || onPlay} className="w-full text-left">
        <span className="art-shadow relative block aspect-square overflow-hidden rounded-md bg-elevated">
          {artwork ? (
            <TrackArt src={artwork} alt="" className="art-zoom group-hover:scale-[1.04]" />
          ) : (
            <span className="liked-wash flex size-full items-center justify-center">
              <Heart className="size-12 fill-current text-fg" />
            </span>
          )}
          <span
            role="button"
            tabIndex={0}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onPlay();
            }}
            className="play-fab absolute right-2 bottom-2 flex size-12 translate-y-2 items-center justify-center rounded-full bg-primary text-primary-fg opacity-0 group-hover:translate-y-0 group-hover:opacity-100"
          >
            <Play className="ml-0.5 size-5 fill-current" />
          </span>
        </span>
        <span className="mt-3 block truncate text-sm font-bold">{title}</span>
        <span className="mt-1 block truncate text-sm text-muted">{subtitle}</span>
      </button>
    </div>
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
      <h2 className="text-xl font-bold tracking-tight text-fg">{title}</h2>
      {action && onAction ? (
        <button type="button" onClick={onAction} className="text-sm font-bold text-muted hover:text-fg">
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
      className="quick-tile group flex min-h-[64px] items-center gap-3 overflow-hidden rounded-md bg-fg/10 text-left hover:bg-fg/20"
    >
      <span className="size-16 shrink-0 overflow-hidden bg-surface">
        <TrackArt src={track.artwork} alt="" />
      </span>
      <span className="min-w-0 flex-1 pr-2">
        <span className={cn("block truncate text-sm font-bold", active ? "text-primary" : "text-fg")}>
          {track.title}
        </span>
      </span>
      {active && isPlaying ? (
        <PlayingBars className="mr-3" />
      ) : (
        <span className="play-fab mr-3 hidden size-8 items-center justify-center rounded-full bg-primary text-primary-fg group-hover:flex">
          <Play className="ml-0.5 size-3.5 fill-current" />
        </span>
      )}
    </button>
  );
}

export function ActionSheet() {
  const navigate = useNavigate();
  const track = useFlowStore((s) => s.actionTrack);
  const setActionTrack = useFlowStore((s) => s.setActionTrack);
  const playTrack = useFlowStore((s) => s.playTrack);
  const playNext = useFlowStore((s) => s.playNext);
  const addToQueue = useFlowStore((s) => s.addToQueue);
  const toggleLike = useFlowStore((s) => s.toggleLike);
  const liked = useFlowStore((s) => (track ? s.liked.some((t) => t.id === track.id) : false));
  const playlists = useFlowStore((s) => s.playlists);
  const addToPlaylist = useFlowStore((s) => s.addToPlaylist);
  const startStation = useFlowStore((s) => s.startStation);
  const toggleFollowArtist = useFlowStore((s) => s.toggleFollowArtist);
  const following = useFlowStore((s) =>
    s.actionTrack ? s.followedArtists.includes(s.actionTrack.artist) : false,
  );
  const createPlaylist = useFlowStore((s) => s.createPlaylist);
  const setQrTarget = useFlowStore((s) => s.setQrTarget);
  const [picking, setPicking] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const last = useRef(track);
  if (track) last.current = track;
  const { mounted, open } = useOpenTransition(Boolean(track), 200);
  const view = track || last.current;

  if (!mounted || !view) return null;

  const close = () => {
    setPicking(false);
    setNewTitle("");
    setActionTrack(null);
  };

  return (
    <div
      className={cn(
        "sheet-backdrop fixed inset-0 z-[80] flex items-end justify-center bg-bg/70 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] md:items-center",
        open ? "is-open" : "is-closing",
      )}
    >
      <button type="button" className="absolute inset-0" aria-label="Chiudi" onClick={close} />
      <div
        className={cn(
          "sheet-panel relative w-full max-w-md overflow-hidden rounded-2xl bg-elevated ring-1 ring-border",
          open ? "is-open" : "is-closing",
        )}
      >
        <div className="flex items-center gap-3 border-b border-border px-4 py-3">
          <span className="size-12 overflow-hidden rounded-md bg-surface">
            <TrackArt src={view.artwork} alt="" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{view.title}</p>
            <p className="truncate text-xs text-muted">{view.artist}</p>
          </div>
          <button type="button" onClick={close} className="pressable flex size-11 items-center justify-center text-muted" aria-label="Chiudi">
            <X className="size-5" />
          </button>
        </div>
        {picking ? (
          <div className="max-h-72 space-y-1 overflow-y-auto p-3">
            <form
              className="mb-2 flex gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                if (!newTitle.trim()) return;
                createPlaylist(newTitle);
                setNewTitle("");
              }}
            >
              <input
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Nuova playlist"
                className="h-11 min-w-0 flex-1 rounded-lg bg-surface px-3 text-base outline-none ring-1 ring-border"
              />
              <button type="submit" className="h-11 rounded-lg bg-primary px-3 text-sm font-medium text-primary-fg">
                Crea
              </button>
            </form>
            {playlists.length === 0 ? (
              <p className="px-2 py-6 text-center text-sm text-muted">Nessuna playlist. Creane una.</p>
            ) : (
              playlists.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => {
                    addToPlaylist(p.id, view);
                    close();
                  }}
                  className="flex w-full items-center justify-between rounded-lg px-3 py-3 text-left text-sm hover:bg-surface"
                >
                  <span>{p.title}</span>
                  <span className="text-xs text-subtle">{p.trackIds.length}</span>
                </button>
              ))
            )}
          </div>
        ) : (
          <div className="p-2">
            <SheetBtn icon={Play} label="Riproduci" onClick={() => { playTrack(view); close(); }} />
            <SheetBtn icon={SkipForward} label="Riproduci dopo" onClick={() => { playNext(view); close(); }} />
            <SheetBtn icon={ListMusic} label="Aggiungi in coda" onClick={() => { addToQueue(view); close(); }} />
            <SheetBtn
              icon={Heart}
              label={liked ? "Rimuovi dai preferiti" : "Aggiungi ai preferiti"}
              onClick={() => toggleLike(view)}
            />
            <SheetBtn icon={ListPlus} label="Aggiungi a playlist" onClick={() => setPicking(true)} />
            {view.videoId && !view.isLive && view.source !== "radio" ? (
              <DownloadSheetBtn track={view} onDone={close} />
            ) : null}
            <SheetBtn
              icon={QrCode}
              label="Condividi con QR Code"
              onClick={() => {
                setQrTarget({
                  title: view.title,
                  subtitle: view.artist,
                  url: `${window.location.origin}/?track=${view.videoId || view.id}`,
                  artwork: view.artwork,
                });
                close();
              }}
            />
            <SheetBtn icon={Share2} label="Condividi" onClick={() => { void shareTrack(view); close(); }} />
            <SheetBtn
              icon={User}
              label="Vai all'artista"
              onClick={() => {
                close();
                void navigate({ to: "/a/$name", params: { name: view.artist } });
              }}
            />
            {view.albumId ? (
              <SheetBtn
                icon={Disc3}
                label="Vai all'album"
                onClick={() => {
                  close();
                  void navigate({ to: "/al/$id", params: { id: view.albumId! } });
                }}
              />
            ) : null}
            <SheetBtn
              icon={Radio}
              label="Radio da questo brano"
              onClick={() => {
                close();
                void getRelatedTracks({
                  data: { artist: view.artist, title: view.title, excludeId: view.id, videoId: view.videoId },
                }).then((tracks) => startStation(view, tracks));
              }}
            />
            <SheetBtn
              icon={Search}
              label={following ? "Non seguire artista" : "Segui artista"}
              onClick={() => {
                toggleFollowArtist(view.artist);
                close();
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}


function DownloadSheetBtn({ track, onDone }: { track: Track; onDone: () => void }) {
  const downloaded = useIsDownloaded(track.videoId);
  const notify = useFlowStore((s) => s.notify);
  const [busy, setBusy] = useState(false);
  return (
    <SheetBtn
      icon={Download}
      label={busy ? "Attendi…" : downloaded ? "Rimuovi download" : "Scarica offline"}
      onClick={() => {
        if (!track.videoId || busy) return;
        setBusy(true);
        const op = downloaded ? removeDownload(track.videoId) : downloadTrack(track);
        void op
          .then(() => {
            notify(downloaded ? "Download rimosso" : "Brano salvato offline");
            onDone();
          })
          .catch(() => notify("Download non riuscito"))
          .finally(() => setBusy(false));
      }}
    />
  );
}

function SheetBtn({
  icon: Icon,
  label,
  onClick,
}: {
  icon: typeof Play;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex h-12 w-full items-center gap-3 rounded-lg px-3 text-sm font-medium transition-colors duration-150 hover:bg-surface"
    >
      <Icon className="size-4 text-muted" />
      {label}
    </button>
  );
}
