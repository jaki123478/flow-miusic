import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Copy, Heart, Play, Plus, Trash2 } from "lucide-react";
import { SignedOut } from "@/lib/auth/gates";
import { useCurrentUser } from "@/lib/auth/use-current-user";
import { importSpotify } from "@/lib/music/import-playlists";
import { publishPlaylist } from "@/lib/music/share";
import { removeDownload, useOfflineDownloads } from "@/lib/music/offline-audio";
import { useFlowStore } from "@/stores/flow-store";
import { SectionHeader, TrackRow } from "@/components/flow/tracks";
import type { Track } from "@/lib/music/types";

export const Route = createFileRoute("/library")({ component: LibraryPage });

type Tab = "liked" | "recents" | "playlists" | "downloads";

function LibraryPage() {
  const liked = useFlowStore((s) => s.liked);
  const recents = useFlowStore((s) => s.recents);
  const playlists = useFlowStore((s) => s.playlists);
  const trackMap = useFlowStore((s) => s.trackMap);
  const playQueue = useFlowStore((s) => s.playQueue);
  const createPlaylist = useFlowStore((s) => s.createPlaylist);
  const createPlaylistWithTracks = useFlowStore((s) => s.createPlaylistWithTracks);
  const removePlaylist = useFlowStore((s) => s.removePlaylist);
  const renamePlaylist = useFlowStore((s) => s.renamePlaylist);
  const duplicatePlaylist = useFlowStore((s) => s.duplicatePlaylist);
  const setPlaylistFolder = useFlowStore((s) => s.setPlaylistFolder);
  const setPlaylistPublic = useFlowStore((s) => s.setPlaylistPublic);
  const clearRecents = useFlowStore((s) => s.clearRecents);
  const user = useCurrentUser();
  const downloads = useOfflineDownloads();
  const notify = useFlowStore((s) => s.notify);
  const [tab, setTab] = useState<Tab>("liked");
  const [title, setTitle] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);
  const [spotUrl, setSpotUrl] = useState("");
  const [importing, setImporting] = useState(false);
  const [importMsg, setImportMsg] = useState<string | null>(null);

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
    { id: "downloads", label: "Scaricati", count: downloads.length },
  ];

  return (
    <div className="flow-enter space-y-6">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">La tua libreria</h1>
        <div className="mt-2 flex flex-wrap gap-3 text-sm">
          <Link to="/stats" className="text-muted hover:text-fg">
            Stats
          </Link>
          <Link to="/friends" className="text-muted hover:text-fg">
            Amici
          </Link>
          <Link to="/fresh" className="text-muted hover:text-fg">
            Novità
          </Link>
        </div>
        <SignedOut>
          <p className="mt-2 text-sm text-muted">
            <Link to="/login" search={{ mode: "up" }} className="font-semibold text-primary">
              Registrati
            </Link>{" "}
            per salvare playlist e preferiti sul tuo account.
          </p>
        </SignedOut>
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


      {tab === "downloads" ? (
        downloads.length === 0 ? (
          <Empty text="Nessun brano salvato offline. Dal menu di una traccia scegli Scarica offline." />
        ) : (
          <>
            <SectionHeader
              title="Scaricati"
              action="Riproduci"
              onAction={() => playQueue(downloads, 0)}
            />
            {downloads.map((t, i) => (
              <div key={t.id} className="flex items-center gap-1">
                <div className="min-w-0 flex-1">
                  <TrackRow track={t} queue={downloads} index={i} />
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (!t.videoId) return;
                    void removeDownload(t.videoId).then(() => notify("Download rimosso"));
                  }}
                  className="flex size-11 shrink-0 items-center justify-center text-subtle"
                  aria-label="Rimuovi download"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
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
          <form
            className="space-y-2 rounded-lg bg-surface p-3 ring-1 ring-border"
            onSubmit={(e) => {
              e.preventDefault();
              if (!spotUrl.trim() || importing) return;
              setImporting(true);
              setImportMsg(null);
              void importSpotify({ data: { url: spotUrl } })
                .then((res) => {
                  if (res.error || !res.tracks.length) {
                    setImportMsg(res.error || "Nessun brano importato");
                    return;
                  }
                  const id = createPlaylistWithTracks(res.title, res.tracks);
                  setSpotUrl("");
                  setImportMsg(
                    res.missing
                      ? `Importate ${res.tracks.length} tracce (${res.missing} non trovate)`
                      : `Importate ${res.tracks.length} tracce`,
                  );
                  if (id) setOpenId(id);
                })
                .catch(() => setImportMsg("Import non riuscito"))
                .finally(() => setImporting(false));
            }}
          >
            <p className="text-sm font-medium">Importa playlist</p>
            <p className="text-xs text-muted">
              Link Spotify, YouTube, Apple Music, oppure una lista «Artista – Titolo» (anche CSV).
            </p>
            <div className="flex gap-2">
              <input
                value={spotUrl}
                onChange={(e) => setSpotUrl(e.target.value)}
                placeholder="https://open.spotify.com/playlist/…  o  https://youtube.com/playlist?list="
                className="h-11 min-w-0 flex-1 rounded-lg bg-elevated px-3 text-sm outline-none ring-1 ring-border"
              />
              <button
                type="submit"
                disabled={importing}
                className="h-11 rounded-full bg-fg px-4 text-sm font-bold text-bg disabled:opacity-60"
              >
                {importing ? "Importo…" : "Importa"}
              </button>
            </div>
            {importMsg ? <p className="text-xs text-muted">{importMsg}</p> : null}
          </form>
          {playlists.length === 0 ? (
            <Empty text="Crea una playlist e aggiungi brani dal menu di ogni traccia." />
          ) : (
            playlists.map((p) => (
              <div key={p.id} className="flex items-center gap-2 rounded-lg bg-surface px-3 py-2 ring-1 ring-border">
                <button type="button" onClick={() => setOpenId(p.id)} className="min-w-0 flex-1 text-left">
                  <p className="truncate text-sm font-medium">{p.title}</p>
                  <p className="text-xs text-muted">
                    {p.trackIds.length} brani
                    {p.folder ? ` · ${p.folder}` : ""}
                    {p.publicId ? " · pubblica" : ""}
                  </p>
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
          {openId ? (
            <PlaylistTools
              id={openId}
              tracks={openTracks}
              userName={user?.displayName ?? user?.primaryEmail ?? "Utente"}
              signedIn={Boolean(user)}
              setPlaylistFolder={setPlaylistFolder}
              setPlaylistPublic={setPlaylistPublic}
            />
          ) : null}
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

function download(name: string, body: string) {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([body], { type: "text/plain" }));
  a.download = name;
  a.click();
}

function PlaylistTools({
  id,
  tracks,
  userName,
  signedIn,
  setPlaylistFolder,
  setPlaylistPublic,
}: {
  id: string;
  tracks: Track[];
  userName: string;
  signedIn: boolean;
  setPlaylistFolder: (id: string, folder: string) => void;
  setPlaylistPublic: (id: string, publicId: string, collab: boolean) => void;
}) {
  const pl = useFlowStore((s) => s.playlists.find((p) => p.id === id));
  const notify = useFlowStore((s) => s.notify);
  if (!pl) return null;
  return (
    <div className="mb-4 flex flex-wrap gap-2">
      <button
        type="button"
        onClick={() => {
          const folder = window.prompt("Cartella", pl.folder || "") || "";
          setPlaylistFolder(id, folder);
        }}
        className="h-9 rounded-full bg-elevated px-3 text-xs font-medium"
      >
        Cartella
      </button>
      <button
        type="button"
        onClick={() => {
          const m3u = ["#EXTM3U", ...tracks.map((t) => `#EXTINF:${t.duration},${t.artist} - ${t.title}\nhttps://www.youtube.com/watch?v=${t.videoId || t.id}`)].join(
            "\n",
          );
          download(`${pl.title}.m3u`, m3u);
        }}
        className="h-9 rounded-full bg-elevated px-3 text-xs font-medium"
      >
        Esporta M3U
      </button>
      <button
        type="button"
        onClick={() => download(`${pl.title}.json`, JSON.stringify(tracks, null, 2))}
        className="h-9 rounded-full bg-elevated px-3 text-xs font-medium"
      >
        Esporta JSON
      </button>
      {signedIn ? (
        <button
          type="button"
          onClick={() => {
            const collab = window.confirm("Vuoi renderla anche collaborativa (chi ha il link può aggiungere brani)?");
            void publishPlaylist({
              data: {
                title: pl.title,
                tracks,
                collab,
                ownerName: userName,
                id: pl.publicId,
              },
            }).then((res) => {
              setPlaylistPublic(id, res.id, collab);
              const url = `${window.location.origin}/p/${res.id}`;
              void navigator.clipboard?.writeText(url);
              notify("Playlist pubblica — link copiato");
            });
          }}
          className="h-9 rounded-full bg-primary px-3 text-xs font-bold text-primary-fg"
        >
          {pl.publicId ? "Aggiorna pubblica" : "Rendi pubblica"}
        </button>
      ) : (
        <Link to="/login" search={{ mode: "up" }} className="h-9 rounded-full bg-elevated px-3 text-xs font-medium leading-9">
          Accedi per pubblicare
        </Link>
      )}
      {pl.publicId ? (
        <Link to="/p/$id" params={{ id: pl.publicId }} className="h-9 rounded-full px-3 text-xs font-medium leading-9 text-primary">
          Apri link
        </Link>
      ) : null}
    </div>
  );
}
