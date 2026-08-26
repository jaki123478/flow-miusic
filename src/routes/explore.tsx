import { createFileRoute, Link } from "@tanstack/react-router";
import { getGenreMix } from "@/lib/music/catalog";
import { GENRES, MOODS } from "@/lib/music/types";
import { useFlowStore } from "@/stores/flow-store";
import { SectionHeader, TrackRow } from "@/components/flow/tracks";

export const Route = createFileRoute("/explore")({
  validateSearch: (search: Record<string, unknown>): { genre?: string } => ({
    genre: typeof search.genre === "string" ? search.genre : undefined,
  }),
  loaderDeps: ({ search }) => ({ genre: search.genre }),
  loader: async ({ deps }) => {
    const selected = GENRES.find((g) => g.id === deps.genre) || GENRES[0];
    try {
      return await getGenreMix({ data: { query: selected.query } });
    } catch {
      return [];
    }
  },
  component: ExplorePage,
});

function ExplorePage() {
  const { genre } = Route.useSearch();
  const selected = GENRES.find((g) => g.id === genre) || GENRES[0];
  const tracks = Route.useLoaderData();
  const playQueue = useFlowStore((s) => s.playQueue);

  return (
    <div className="flow-enter space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Esplora</h1>
        <p className="mt-1 text-sm text-muted">Generi, mood e scene da tutto il mondo.</p>
      </header>

      <section>
        <SectionHeader title="Mood" />
        <div className="flex flex-wrap gap-2">
          {MOODS.map((m) => (
            <Link
              key={m.id}
              to="/mix"
              search={{ mood: m.id }}
              className="chip rounded-full bg-elevated px-4 py-2 text-sm font-medium ring-1 ring-border"
            >
              {m.label}
            </Link>
          ))}
        </div>
      </section>

      <div className="scrollbar-none -mx-4 flex gap-2 overflow-x-auto px-4 sm:-mx-6 sm:px-6">
        {GENRES.map((g) => (
          <Link
            key={g.id}
            to="/explore"
            search={{ genre: g.id }}
            className={`chip shrink-0 rounded-full px-4 py-2 text-sm font-medium ${
              g.id === selected.id ? "bg-primary text-primary-fg" : "bg-surface text-fg ring-1 ring-border"
            }`}
          >
            {g.name}
          </Link>
        ))}
      </div>

      <section>
        <SectionHeader
          title={selected.name}
          action={tracks.length ? "Riproduci" : undefined}
          onAction={tracks.length ? () => playQueue(tracks, 0) : undefined}
        />
        {tracks.length === 0 ? (
          <p className="text-sm text-muted">Nessun brano per questo genere al momento.</p>
        ) : (
          tracks.map((t, i) => <TrackRow key={t.id} track={t} queue={tracks} index={i} showIndex />)
        )}
      </section>
    </div>
  );
}
