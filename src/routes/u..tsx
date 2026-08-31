import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Heart,
  ListMusic,
  Clock,
  Play,
  Share2,
  Sliders,
  Sparkles,
  Download,
  User,
  Edit2,
  Check,
} from "lucide-react";
import { useCurrentUser } from "@/lib/auth/use-current-user";
import { followUser, listUserPlaylists } from "@/lib/music/share";
import { useFlowStore } from "@/stores/flow-store";
import { TrackRow } from "@/components/flow/tracks";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/u/")({
  loader: async ({ params }) => listUserPlaylists({ data: { userId: params.id } }),
  component: ProfilePage,
});

function ProfilePage() {
  const cloudPlaylists = Route.useLoaderData();
  const { id } = Route.useParams();
  const user = useCurrentUser();

  const profileName = useFlowStore((s) => s.profileName);
  const setProfileName = useFlowStore((s) => s.setProfileName);
  const liked = useFlowStore((s) => s.liked);
  const recents = useFlowStore((s) => s.recents);
  const localPlaylists = useFlowStore((s) => s.playlists);
  const listenMs = useFlowStore((s) => s.listenMs);
  const playQueue = useFlowStore((s) => s.playQueue);
  const notify = useFlowStore((s) => s.notify);

  const [tab, setTab] = useState<"liked" | "playlists" | "recents">("liked");
  const [editingName, setEditingName] = useState(false);
  const [tempName, setTempName] = useState(profileName || "Flow User");

  const isMe = !user || user.id === id || id === "me";
  const displayName = isMe
    ? user?.displayName || user?.primaryEmail || profileName || "Flow User"
    : cloudPlaylists[0]?.ownerName || "Utente Flow";

  const hours = Math.round(listenMs / 360000) / 10;
  const minutes = Math.round(listenMs / 60000);
  const timeLabel = hours >= 1 ? `${hours} ore` : `${minutes} min`;

  const handleSaveName = () => {
    if (tempName.trim()) {
      setProfileName(tempName.trim());
      notify(`Nome aggiornato in "${tempName.trim()}"`);
    }
    setEditingName(false);
  };

  return (
    <div className="flow-enter mx-auto max-w-4xl space-y-6 pb-12">
      {/* 1. Hero Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-surface to-elevated p-6 md:p-8 shadow-xl ring-1 ring-white/10">
        <div className="flex flex-col md:flex-row items-center gap-6 text-center md:text-left">
          {/* Avatar */}
          <div className="relative size-24 md:size-28 shrink-0 overflow-hidden rounded-full bg-gradient-to-tr from-primary via-emerald-400 to-teal-300 p-1 shadow-lg ring-4 ring-primary/20">
            {user?.profileImageUrl ? (
              <img
                src={user.profileImageUrl}
                alt={displayName}
                className="size-full rounded-full object-cover"
              />
            ) : (
              <div className="flex size-full items-center justify-center rounded-full bg-[#14171E] text-3xl font-black text-primary">
                {displayName.charAt(0).toUpperCase()}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="min-w-0 flex-1 space-y-2">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
              {editingName ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={tempName}
                    onChange={(e) => setTempName(e.target.value)}
                    className="h-9 rounded-xl bg-bg px-3 text-lg font-bold text-fg ring-1 ring-primary focus:outline-none"
                    autoFocus
                    onKeyDown={(e) => e.key === "Enter" && handleSaveName()}
                  />
                  <button
                    type="button"
                    onClick={handleSaveName}
                    className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-fg"
                  >
                    <Check className="size-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl md:text-3xl font-black tracking-tight text-fg">
                    {displayName}
                  </h1>
                  {isMe && (
                    <button
                      type="button"
                      onClick={() => {
                        setTempName(displayName);
                        setEditingName(true);
                      }}
                      className="rounded-full p-1 text-muted hover:text-fg hover:bg-white/10 transition-colors"
                      title="Modifica nome"
                    >
                      <Edit2 className="size-3.5" />
                    </button>
                  )}
                </div>
              )}
              <span className="rounded-full bg-primary/20 px-2.5 py-0.5 text-[10px] font-bold text-primary uppercase tracking-wider">
                Flow Hi-Fi
              </span>
            </div>

            <p className="text-xs text-muted">
              Profilo attivo · Statistiche e sincronizzazione in tempo reale
            </p>

            {/* Actions */}
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 pt-1">
              {liked.length > 0 && (
                <button
                  type="button"
                  onClick={() => playQueue(liked, 0)}
                  className="flex h-9 items-center gap-2 rounded-full bg-primary px-4 text-xs font-bold text-primary-fg shadow-lg shadow-primary/25 hover:opacity-90 active:scale-95 transition-all"
                >
                  <Play className="size-3.5 fill-current" />
                  Riproduci Preferiti ({liked.length})
                </button>
              )}
              <Link
                to="/library"
                className="flex h-9 items-center gap-2 rounded-full bg-surface px-4 text-xs font-bold text-fg ring-1 ring-white/10 hover:bg-elevated transition-colors"
              >
                <ListMusic className="size-3.5" />
                Libreria Completa
              </Link>
            </div>
          </div>
        </div>

        {/* 2. Stats Row */}
        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3 border-t border-white/10 pt-5 text-center">
          <div className="rounded-2xl bg-surface/50 p-3 ring-1 ring-white/5">
            <p className="text-[11px] font-medium text-muted">Ascolto</p>
            <p className="mt-1 text-lg font-black text-fg">{timeLabel}</p>
          </div>
          <div className="rounded-2xl bg-surface/50 p-3 ring-1 ring-white/5">
            <p className="text-[11px] font-medium text-muted">Brani Preferiti</p>
            <p className="mt-1 text-lg font-black text-primary">{liked.length}</p>
          </div>
          <div className="rounded-2xl bg-surface/50 p-3 ring-1 ring-white/5">
            <p className="text-[11px] font-medium text-muted">Le Mie Playlist</p>
            <p className="mt-1 text-lg font-black text-fg">{localPlaylists.length + cloudPlaylists.length}</p>
          </div>
          <div className="rounded-2xl bg-surface/50 p-3 ring-1 ring-white/5">
            <p className="text-[11px] font-medium text-muted">Recenti</p>
            <p className="mt-1 text-lg font-black text-fg">{recents.length}</p>
          </div>
        </div>
      </div>

      {/* 3. Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-border pb-3">
        <button
          type="button"
          onClick={() => setTab("liked")}
          className={cn(
            "flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold transition-all",
            tab === "liked"
              ? "bg-primary text-primary-fg shadow-md"
              : "bg-surface text-muted hover:text-fg"
          )}
        >
          <Heart className="size-3.5" />
          Preferiti ({liked.length})
        </button>

        <button
          type="button"
          onClick={() => setTab("playlists")}
          className={cn(
            "flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold transition-all",
            tab === "playlists"
              ? "bg-primary text-primary-fg shadow-md"
              : "bg-surface text-muted hover:text-fg"
          )}
        >
          <ListMusic className="size-3.5" />
          Playlist ({localPlaylists.length + cloudPlaylists.length})
        </button>

        <button
          type="button"
          onClick={() => setTab("recents")}
          className={cn(
            "flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold transition-all",
            tab === "recents"
              ? "bg-primary text-primary-fg shadow-md"
              : "bg-surface text-muted hover:text-fg"
          )}
        >
          <Clock className="size-3.5" />
          Cronologia ({recents.length})
        </button>
      </div>

      {/* 4. Tab Content */}
      <div className="space-y-2">
        {tab === "liked" && (
          <div>
            {liked.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center text-muted">
                <Heart className="size-12 opacity-20 mb-3 text-primary" />
                <p className="text-base font-bold text-fg">Nessun brano preferito</p>
                <p className="mt-1 text-xs text-muted max-w-sm">
                  Tocca il cuore su qualsiasi canzone per salvarla direttamente qui nel tuo profilo.
                </p>
                <Link
                  to="/discover"
                  className="mt-4 inline-flex h-9 items-center rounded-full bg-primary px-4 text-xs font-bold text-primary-fg"
                >
                  Esplora Brani
                </Link>
              </div>
            ) : (
              <div className="space-y-1">
                {liked.map((track, i) => (
                  <TrackRow key={`${track.id}-${i}`} track={track} queue={liked} index={i} showIndex />
                ))}
              </div>
            )}
          </div>
        )}

        {tab === "playlists" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {localPlaylists.length === 0 && cloudPlaylists.length === 0 ? (
              <div className="col-span-full flex flex-col items-center justify-center py-16 text-center text-muted">
                <ListMusic className="size-12 opacity-20 mb-3 text-primary" />
                <p className="text-base font-bold text-fg">Nessuna playlist creata</p>
                <p className="mt-1 text-xs text-muted max-w-sm">
                  Crea le tue playlist o importale da Spotify e YouTube nella sezione Libreria.
                </p>
                <Link
                  to="/library"
                  className="mt-4 inline-flex h-9 items-center rounded-full bg-primary px-4 text-xs font-bold text-primary-fg"
                >
                  Vai a Libreria
                </Link>
              </div>
            ) : (
              <>
                {localPlaylists.map((p) => (
                  <Link
                    key={p.id}
                    to="/p/$id"
                    params={{ id: p.id }}
                    className="group flex items-center justify-between rounded-2xl bg-surface p-4 ring-1 ring-white/5 hover:bg-elevated transition-all"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold text-fg group-hover:text-primary transition-colors">
                        {p.title}
                      </p>
                      <p className="text-xs text-muted mt-0.5">{p.trackIds.length} brani</p>
                    </div>
                    <span className="flex size-8 items-center justify-center rounded-full bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-fg transition-colors">
                      <Play className="size-3.5 fill-current ml-0.5" />
                    </span>
                  </Link>
                ))}
                {cloudPlaylists.map((p) => (
                  <Link
                    key={p.id}
                    to="/p/$id"
                    params={{ id: p.id }}
                    className="group flex items-center justify-between rounded-2xl bg-surface p-4 ring-1 ring-white/5 hover:bg-elevated transition-all"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold text-fg group-hover:text-primary transition-colors">
                        {p.title}
                      </p>
                      <p className="text-xs text-muted mt-0.5">{p.tracks.length} brani · Cloud</p>
                    </div>
                    <span className="flex size-8 items-center justify-center rounded-full bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-fg transition-colors">
                      <Play className="size-3.5 fill-current ml-0.5" />
                    </span>
                  </Link>
                ))}
              </>
            )}
          </div>
        )}

        {tab === "recents" && (
          <div>
            {recents.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center text-muted">
                <Clock className="size-12 opacity-20 mb-3 text-primary" />
                <p className="text-base font-bold text-fg">Nessuna cronologia</p>
                <p className="mt-1 text-xs text-muted max-w-sm">
                  I brani che ascolti appariranno automaticamente qui.
                </p>
              </div>
            ) : (
              <div className="space-y-1">
                {recents.map((track, i) => (
                  <TrackRow key={`${track.id}-${i}`} track={track} queue={recents} index={i} showIndex />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}