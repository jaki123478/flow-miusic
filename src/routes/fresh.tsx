import { useEffect, useMemo, useState } from "react";
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

  const artists = useMemo(() => {
    return [...followed, ...liked.map((t) => t.artist)]
      .map((a) => a.trim())
      .filter((a, i, arr) => a && arr.indexOf(a) === i)
      .slice(0, 10);
  }, [followed, liked]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    void getFreshTracks({ data: { artists } })
      .then((list) => {
        if (!cancelled) setTracks(list);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [artists]);

  const groups = useMemo(() => {
    const used = new Set<string>();
    const out: { artist: string; tracks: Track[] }[] = [];
    for (const artist of followed.length ? followed : artists) {
      const needle = artist.toLowerCase();
      const list = tracks.filter((t) => {
        const name = t.artist.toLowerCase();
        return name.includes(needle) || needle.includes(name);
      });
      if (!list.length) continue;
      out.push({ artist, tracks: list });
      for (const t of list) used.add(t.id);
    }
    const rest = tracks.filter((t) => !used.has(t.id));
    if (rest.length) out.push({ artist: "Altre novità", tracks: rest });
    return out;
  }, [tracks, followed, artists]);

  return (
    <div className="flow-enter space-y-6">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">Nuove uscite</h1>
        <p className="mt-1 text-sm text-muted">
          {followed.length
            ? `Brani recenti di ${followed.slice(0, 4).join(", ")}${followed.length > 4 ? "…" : ""}.`
            : "Segui un artista dal menu del brano. Intanto uso i tuoi preferiti."}
        </p>
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
          {groups.map((g) => (
            <section key={g.artist} className="space-y-1">
              <h2 className="px-1 text-sm font-bold text-muted">{g.artist}</h2>
              {g.tracks.map((t, i) => (
                <TrackRow key={t.id} track={t} queue={g.tracks} index={i} showIndex />
              ))}
            </section>
          ))}
        </>
      ) : (
        <p className="text-sm text-muted">Segui un artista (menu sul brano) per vedere le sue nuove uscite.</p>
      )}
    </div>
  );
}
