import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useCurrentUser } from "@/lib/auth/use-current-user";
import { addSharedTrack, followUser, getSharedPlaylist, type SharedPlaylist } from "@/lib/music/share";
import { useFlowStore } from "@/stores/flow-store";
import { TrackRow } from "@/components/flow/tracks";

export const Route = createFileRoute("/p/$id")({
  loader: async ({ params }) => getSharedPlaylist({ data: { id: params.id } }).catch(() => null),
  component: SharedPage,
});

function SharedPage() {
  const initial = Route.useLoaderData();
  const { id } = Route.useParams();
  const [pl, setPl] = useState<SharedPlaylist | null>(initial);
  const playQueue = useFlowStore((s) => s.playQueue);
  const current = useFlowStore((s) => s.current);
  const user = useCurrentUser();
  const createPlaylistWithTracks = useFlowStore((s) => s.createPlaylistWithTracks);

  useEffect(() => {
    setPl(initial);
  }, [initial]);

  if (!pl) {
    return (
      <div className="flow-enter py-16 text-center text-sm text-muted">
        Playlist non trovata. <Link to="/">Home</Link>
      </div>
    );
  }

  return (
    <div className="flow-enter space-y-5">
      <header>
        <p className="text-xs font-medium tracking-widest text-primary uppercase">Playlist condivisa</p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight">{pl.title}</h1>
        <p className="mt-1 text-sm text-muted">
          di{" "}
          <Link to="/u/$id" params={{ id: pl.userId }} className="hover:underline">
            {pl.ownerName}
          </Link>
          {pl.collab ? " · collaborativa" : ""}
        </p>
      </header>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => playQueue(pl.tracks, 0)}
          className="h-11 rounded-full bg-primary px-5 text-sm font-bold text-primary-fg"
        >
          Riproduci
        </button>
        <button
          type="button"
          onClick={() => createPlaylistWithTracks(pl.title, pl.tracks)}
          className="h-11 rounded-full bg-elevated px-4 text-sm font-medium"
        >
          Salva in libreria
        </button>
        {user && user.id !== pl.userId ? (
          <button
            type="button"
            onClick={() => void followUser({ data: { targetId: pl.userId } })}
            className="h-11 rounded-full bg-elevated px-4 text-sm font-medium"
          >
            Segui
          </button>
        ) : null}
        {pl.collab && current ? (
          <button
            type="button"
            onClick={() => {
              void addSharedTrack({ data: { id, track: current } }).then((res) => {
                if (res.ok) setPl({ ...pl, tracks: [...pl.tracks, current] });
              });
            }}
            className="h-11 rounded-full bg-elevated px-4 text-sm font-medium"
          >
            Aggiungi brano in play
          </button>
        ) : null}
      </div>
      {pl.tracks.map((t, i) => (
        <TrackRow key={t.id} track={t} queue={pl.tracks} index={i} showIndex />
      ))}
    </div>
  );
}
