import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { getFreshTracks } from "@/lib/music/catalog";
import type { Track } from "@/lib/music/types";
import { useFlowStore } from "@/stores/flow-store";
import { TrackRow } from "@/components/flow/tracks";

export const Route = createFileRoute("/fresh")({ component: FreshPage });

function FreshPage() {
  const liked = useFlowStore((s) => s.liked);
  const followed = useFlowStore((s) => s.followedArtists);
  const playQueue = useFlowStore((s) => s.playQueue);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const artists = [...followed, ...liked.map((t) => t.artist)]
      .filter((a, i, arr) => a && arr.indexOf(a) === i)
      .slice(0, 5);
    void getFreshTracks({ data: { artists } })
      .then(setTracks)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="flow-enter space-y-6">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">Novità</h1>
        <p className="mt-1 text-sm text-muted">Nuove uscite e brani freschi dagli artisti che segui.</p>
      </header>
      {loading ? (
        <Loader2 className="size-6 animate-spin text-muted" />
      ) : tracks.length ? (
        <>
          <button
            type="button"
            onClick={() => playQueue(tracks, 0)}
            className="h-11 rounded-full bg-primary px-5 text-sm font-bold text-primary-fg"
          >
            Riproduci novità
          </button>
          {tracks.map((t, i) => (
            <TrackRow key={t.id} track={t} queue={tracks} index={i} showIndex />
          ))}
        </>
      ) : (
        <p className="text-sm text-muted">Segui un artista (menu brano) per vedere le novità.</p>
      )}
    </div>
  );
}
