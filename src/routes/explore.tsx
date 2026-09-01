import { createFileRoute, Link } from "@tanstack/react-router";
import { Compass, Flame, Music2, Play, Radio, Sparkles, Trophy } from "lucide-react";
import { getGenreMix } from "@/lib/music/catalog";
import { GENRES, MOODS } from "@/lib/music/types";
import { hashHue } from "@/lib/utils";
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
    <div className="flow-enter space-y-8 pb-8">
      <header className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Esplora & Mood</h1>
          <p className="mt-1 text-sm text-muted">Scopri nuove vibrazioni, generi e classifiche da tutto il mondo.</p>
        </div>
        <div className="flex gap-2">
          <Link
            to="/charts"
            className="pressable flex items-center gap-2 rounded-full bg-elevated px-4 py-2 text-xs font-semibold text-fg ring-1 ring-border hover:bg-highlight"
          >
            <Trophy className="size-4 text-amber-400" />
            Classifiche
          </Link>
          <Link
            to="/radio"
            className="pressable flex items-center gap-2 rounded-full bg-elevated px-4 py-2 text-xs font-semibold text-fg ring-1 ring-border hover:bg-highlight"
          >
            <Radio className="size-4 text-emerald-400" />
            Radio Live
          </Link>
        </div>
      </header>

      {/* Mood Selector Pills */}
      <section>
        <SectionHeader title="Mood & Atmosfere" />
        <div className="flex flex-wrap gap-2.5">
          {MOODS.map((m) => (
            <Link
              key={m.id}
              to="/mix"
              search={{ mood: m.id }}
              className="chip pressable flex items-center gap-2 rounded-full bg-surface px-4 py-2 text-xs font-semibold ring-1 ring-border hover:border-primary/50 hover:bg-elevated hover:text-fg"
            >
              <Sparkles className="size-3.5 text-primary" />
              {m.label}
            </Link>
          ))}
        </div>
      </section>

      {/* Visual Genre Cards Grid */}
      <section>
        <SectionHeader title="Tutti i Generi Musicali" />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {GENRES.map((g) => {
            const isCurrent = g.id === selected.id;
            const hue = hashHue(g.name);
            return (
              <Link
                key={g.id}
                to="/explore"
                search={{ genre: g.id }}
                style={{
                  background: `linear-gradient(135deg, hsl(${hue} 60% 22%), hsl(${hue} 70% 12%))`,
                }}
                className={`group relative flex h-24 flex-col justify-between overflow-hidden rounded-2xl p-3.5 transition-all hover:scale-[1.03] hover:shadow-lg ${
                  isCurrent ? "ring-2 ring-primary ring-offset-2 ring-offset-bg shadow-lg shadow-primary/20" : "ring-1 ring-white/10"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-heading text-sm font-bold text-fg drop-shadow">{g.name}</span>
                  <Music2 className="size-4 text-white/50 transition-transform group-hover:scale-110 group-hover:text-white" />
                </div>
                <span className="text-[11px] font-medium text-white/70">Esplora tracce</span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Selected Genre Tracklist */}
      <section className="rounded-2xl border border-border/60 bg-surface/40 p-4 sm:p-6 backdrop-blur-md">
        <SectionHeader
          title={`Brani in evidenza: ${selected.name}`}
          action={tracks.length ? "Riproduci Tutto" : undefined}
          onAction={tracks.length ? () => playQueue(tracks, 0) : undefined}
        />
        {tracks.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted">Caricamento tracce in corso...</p>
        ) : (
          <div className="mt-3 space-y-1">
            {tracks.map((t, i) => (
              <TrackRow key={t.id} track={t} queue={tracks} index={i} showIndex />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
