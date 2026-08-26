import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Copy, Heart, Play, Plus, Trash2 } from "lucide-react";
import { useFlowStore } from "@/stores/flow-store";
import { SectionHeader, TrackRow } from "@/components/flow/tracks";
import type { Track } from "@/lib/music/types";

export const Route = createFileRoute("/library")({ component: LibraryPage });

type Tab = "liked" | "recents" | "playlists";

function LibraryPage() {
  const liked = useFlowStore((s) => s.liked);
  const recents = useFlowStore((s) => s.recents);
  const playlists = useFlowStore((s) => s.playlists);
  const trackMap = useFlowStore((s) => s.trackMap);
  const playQueue = useFlowStore((s) => s.playQueue);
  const createPlaylist = useFlowStore((s) => s.createPlaylist);
  const removePlaylist = useFlowStore((s) => s.removePlaylist);
  const renamePlaylist = useFlowStore((s) => s.renamePlaylist);
  const duplicatePlaylist = useFlowStore((s) => s.duplicatePlaylist);
  const clearRecents = useFlowStore((s) => s.clearRecents);
  const [tab, setTab] = useState<Tab>("liked");
  const [title, setTitle] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);

  const openTracks: Track[] = useMemo(() => {
    if (!openId) return [];
    const pl = playlists.find((p) => p.id === openId);
    if (!pl) return [];
    return pl.trackIds.map((id) => trackMap[id]).filter(Boolean);
  }, [openId, playlists, trackMap]);

  const tabs: { id: Tab; label: string; count: number }[] = [
    { id: "liked", label: "Preferiti", count: liked.length },
    { id: "recents", label: "Recenti", count: recents.length },
    { id: "playlists", label: "Playlist", count: playlists.length },
  ];

  return (
    <div className="flow-enter space-y-6">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">La tua libreria</h1>
      </header>

      <div className="flex gap-2">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => {
              setTab(t.id);
              setOpenId(null);
            }}
            className={`chip h-10 rounded-full px-4 text-sm font-medium ${
              tab === t.id ? "bg-primary text-primary-fg" : "bg-surface text-fg ring-1 ring-border"
            }`}
          >
            {t.label}
            {t.count ? <span className="ml-1.5 text-xs opacity-70">{t.count}</span> : null}
          </button>
        ))}
      </div>

      {tab === "liked" ? (
        liked.length === 0 ? (
          <Empty text="I brani che ami compariranno qui. Tocca il cuore su un brano." />
        ) : (
          <>
            <div className="flex flex-col gap-6 sm:flex-row sm:items-end">
              <div className="liked-wash flex size-40 shrink-0 items-center justify-center rounded shadow-2xl sm:size-48">
                <Heart className="size-16 fill-current text-fg" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase">Playlist</p>
                <h2 className="mt-1 font-heading text-3xl font-bold tracking-tight sm:text-5xl">Brani che ti piacciono</h2>
                <p className="mt-2 text-sm text-muted">{liked.length} brani</p>
                <button
                  type="button"
                  onClick={() => playQueue(liked, 0)}
                  className="play-fab mt-4 flex size-14 items-center justify-center rounded-full bg-primary text-primary-fg"
                  aria-label="Riproduci"
                >
                  <Play className="ml-0.5 size-6 fill-current" />
                </button>
              </div>
            </div>
            {liked.map((t, i) => (
              <TrackRow key={t.id} track={t} queue={liked} index={i} showIndex />
            ))}
          </>
        )
      ) : null}

      {tab === "recents" ? (
        recents.length === 0 ? (
          <Empty text="La cronologia di ascolto è vuota." />
        ) : (
          <>
            <SectionHeader title="Ascoltati di recente" action="Cancella" onAction={clearRecents} />
            <button
              type="button"
              onClick={() => playQueue(recents, 0)}
              className="mb-3 h-11 rounded-full bg-primary px-5 text-sm font-semibold text-primary-fg"
            >
              Riproduci
            </button>
            {recents.map((t, i) => (
              <TrackRow key={t.id} track={t} queue={recents} index={i} />
            ))}
          </>
        )
      ) : null}

      {tab === "playlists" && !openId ? (
        <div className="space-y-4">
          <form
            className="flex gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              createPlaylist(title);
              setTitle("");
            }}
          >
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Nuova playlist"
              className="h-12 min-w-0 flex-1 rounded-lg bg-surface px-4 text-base ring-1 ring-border outline-none placeholder:text-subtle"
            />
            <button
              type="submit"
              className="flex size-12 items-center justify-center rounded-lg bg-primary text-primary-fg"
              aria-label="Crea playlist"
            >
              <Plus className="size-5" />
            </button>
          </form>
          {playlists.length === 0 ? (
            <Empty text="Crea una playlist e aggiungi brani dal menu di ogni traccia." />
          ) : (
            playlists.map((p) => (
              <div key={p.id} className="flex items-center gap-2 rounded-lg bg-surface px-3 py-2 ring-1 ring-border">
                <button type="button" onClick={() => setOpenId(p.id)} className="min-w-0 flex-1 text-left">
                  <p className="truncate text-sm font-medium">{p.title}</p>
                  <p className="text-xs text-muted">{p.trackIds.length} brani</p>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const tracks = p.trackIds.map((id) => trackMap[id]).filter(Boolean);
                    if (tracks.length) playQueue(tracks, 0);
                  }}
                  className="rounded-full px-3 py-2 text-xs font-medium text-muted"
                >
                  Play
                </button>
                <button
                  type="button"
                  onClick={() => duplicatePlaylist(p.id)}
                  className="flex size-11 items-center justify-center text-subtle"
                  aria-label="Duplica"
                >
                  <Copy className="size-4" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const next = window.prompt("Nome playlist", p.title);
                    if (next) renamePlaylist(p.id, next);
                  }}
                  className="rounded-full px-2 py-2 text-xs font-medium text-muted"
                >
                  Rinomina
                </button>
                <button
                  type="button"
                  onClick={() => removePlaylist(p.id)}
                  className="flex size-11 items-center justify-center text-subtle"
                  aria-label="Elimina playlist"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            ))
          )}
        </div>
      ) : null}

      {tab === "playlists" && openId ? (
        <div>
          <button type="button" onClick={() => setOpenId(null)} className="mb-3 text-sm text-muted hover:text-fg">
            Torna alle playlist
          </button>
          {openTracks.length === 0 ? (
            <Empty text="Playlist vuota. Aggiungi brani dal menu di una traccia." />
          ) : (
            <>
              <SectionHeader title="Playlist" action="Riproduci" onAction={() => playQueue(openTracks, 0)} />
              {openTracks.map((t, i) => (
                <TrackRow key={t.id} track={t} queue={openTracks} index={i} showIndex />
              ))}
            </>
          )}
        </div>
      ) : null}
    </div>
  );
}

function Empty({ text }: { text: string }) {
  return <p className="rounded-xl bg-surface px-4 py-10 text-center text-sm text-muted ring-1 ring-border">{text}</p>;
}
