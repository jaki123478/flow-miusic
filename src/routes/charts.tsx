import { createFileRoute } from "@tanstack/react-router";
import { getChartTracks } from "@/lib/music/catalog";
import { CHARTS } from "@/lib/music/types";
import { useFlowStore } from "@/stores/flow-store";
import { SectionHeader, TrackRow } from "@/components/flow/tracks";

export const Route = createFileRoute("/charts")({
  validateSearch: (search: Record<string, unknown>): { id?: string } => ({
    id: typeof search.id === "string" ? search.id : undefined,
  }),
  loaderDeps: ({ search }) => ({ id: search.id }),
  loader: async ({ deps }) => {
    const chart = CHARTS.find((c) => c.id === deps.id) || CHARTS[0];
    try {
      return await getChartTracks({ data: { query: chart.query, playlistId: chart.playlistId } });
    } catch {
      return [];
    }
  },
  component: ChartsPage,
});

function ChartsPage() {
  const { id = "global" } = Route.useSearch();
  const navigate = Route.useNavigate();
  const chart = CHARTS.find((c) => c.id === id) || CHARTS[0];
  const tracks = Route.useLoaderData();
  const playQueue = useFlowStore((s) => s.playQueue);

  return (
    <div className="flow-enter space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Classifiche</h1>
        <p className="mt-1 text-sm text-muted">Hits da YouTube Music, aggiornate in tempo reale.</p>
      </header>

      <div className="scrollbar-none -mx-4 flex gap-2 overflow-x-auto px-4 sm:-mx-6 sm:px-6">
        {CHARTS.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => void navigate({ search: { id: c.id } })}
            className={`h-11 shrink-0 rounded-full px-4 text-sm font-medium ${
              c.id === chart.id ? "bg-primary text-primary-fg" : "bg-surface text-fg ring-1 ring-border"
            }`}
          >
            {c.title}
          </button>
        ))}
      </div>

      <section>
        <SectionHeader
          title={chart.title}
          action={tracks.length ? "Riproduci" : undefined}
          onAction={tracks.length ? () => playQueue(tracks, 0) : undefined}
        />
        {tracks.length === 0 ? (
          <p className="text-sm text-muted">Classifica non disponibile al momento.</p>
        ) : (
          tracks.map((t, i) => <TrackRow key={t.id} track={t} queue={tracks} index={i} showIndex />)
        )}
      </section>
    </div>
  );
}
