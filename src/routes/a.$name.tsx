import { createFileRoute, Link } from "@tanstack/react-router";
import { Play } from "lucide-react";
import { getArtistPage } from "@/lib/music/catalog";
import { FALLBACK_ART } from "@/lib/music/types";
import { useFlowStore } from "@/stores/flow-store";
import { CollectionCard, HScroll, SectionHeader, TrackArt, TrackRow } from "@/components/flow/tracks";

export const Route = createFileRoute("/a/$name")({
  loader: async ({ params }) => {
    const name = decodeURIComponent(params.name || "").trim();
    try {
      return await getArtistPage({ data: { name } });
    } catch {
      return { name: name || "Artista", artwork: FALLBACK_ART, songs: [], albums: [], similar: [] };
    }
  },
  component: ArtistPage,
});

function ArtistPage() {
  const page = Route.useLoaderData();
  const playQueue = useFlowStore((s) => s.playQueue);
  const followed = useFlowStore((s) => s.followedArtists);
  const toggleFollowArtist = useFlowStore((s) => s.toggleFollowArtist);
  const following = followed.some((a) => a.toLowerCase() === page.name.toLowerCase());

  return (
    <div className="flow-enter space-y-8 pb-4">
      <header className="flex items-end gap-4">
        <div className="size-28 shrink-0 overflow-hidden rounded-2xl bg-elevated sm:size-36">
          <TrackArt src={page.artwork} alt={page.name} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-bold tracking-widest text-muted uppercase">Artista</p>
          <h1 className="mt-1 truncate text-3xl font-bold tracking-tight">{page.name}</h1>
          <div className="mt-4 flex flex-wrap gap-2">
            {page.songs.length ? (
              <button
                type="button"
                onClick={() => playQueue(page.songs, 0)}
                className="inline-flex h-11 items-center gap-2 rounded-full bg-primary px-5 text-sm font-bold text-primary-fg"
              >
                <Play className="size-4 fill-current" />
                Riproduci
              </button>
            ) : null}
            <button
              type="button"
              onClick={() => toggleFollowArtist(page.name)}
              className="h-11 rounded-full bg-elevated px-5 text-sm font-bold"
            >
              {following ? "Non seguire" : "Segui"}
            </button>
          </div>
        </div>
      </header>

      {page.songs.length ? (
        <section>
          <SectionHeader title="Brani in evidenza" action="Riproduci" onAction={() => playQueue(page.songs, 0)} />
          <div className="rounded-md bg-elevated/50 p-2">
            {page.songs.slice(0, 12).map((t, i) => (
              <TrackRow key={t.id} track={t} queue={page.songs} index={i} showIndex />
            ))}
          </div>
        </section>
      ) : (
        <p className="text-sm text-muted">Nessun brano trovato per questo artista.</p>
      )}

      {page.albums.length ? (
        <section>
          <SectionHeader title="Album" />
          <HScroll>
            {page.albums.map((al) => (
              <CollectionCard
                key={al.id}
                title={al.title}
                subtitle={al.year ? `${al.year} · ${al.tracks.length} brani` : `${al.tracks.length} brani`}
                artwork={al.artwork}
                onPlay={() => al.tracks.length && playQueue(al.tracks, 0)}
              />
            ))}
          </HScroll>
        </section>
      ) : null}

      {page.similar.length ? (
        <section>
          <SectionHeader title="Artisti simili" />
          <HScroll>
            {page.similar.map((a) => (
              <Link
                key={a.name}
                to="/a/$name"
                params={{ name: a.name }}
                className="spot-card w-36 shrink-0 sm:w-40"
              >
                <span className="block aspect-square overflow-hidden rounded-full bg-elevated">
                  <TrackArt src={a.artwork} alt="" />
                </span>
                <span className="mt-3 block truncate text-center text-sm font-bold">{a.name}</span>
              </Link>
            ))}
          </HScroll>
        </section>
      ) : null}
    </div>
  );
}
