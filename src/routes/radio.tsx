import { useMemo } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { getCountryRadios, getTopRadios, stationToTrack } from "@/lib/music/catalog";
import { RADIO_COUNTRIES } from "@/lib/music/types";
import { useFlowStore } from "@/stores/flow-store";
import { SectionHeader, TrackCard, HScroll, TrackRow } from "@/components/flow/tracks";

export const Route = createFileRoute("/radio")({
  validateSearch: (search: Record<string, unknown>): { c?: string } => ({
    c: typeof search.c === "string" ? search.c : undefined,
  }),
  loaderDeps: ({ search }) => ({ c: search.c || "IT" }),
  loader: async ({ deps }) => {
    const [top, country] = await Promise.all([
      getTopRadios().catch(() => []),
      getCountryRadios({ data: { countryCode: deps.c } }).catch(() => []),
    ]);
    return { top, country };
  },
  component: RadioPage,
});

function RadioPage() {
  const { c } = Route.useSearch();
  const navigate = Route.useNavigate();
  const { top, country } = Route.useLoaderData();
  const playQueue = useFlowStore((s) => s.playQueue);
  const code = (c || "IT").toUpperCase();
  const topTracks = useMemo(() => top.map(stationToTrack), [top]);
  const countryTracks = useMemo(() => country.map(stationToTrack), [country]);
  const countryName = RADIO_COUNTRIES.find((x) => x.code === code)?.name || code;

  return (
    <div className="flow-enter space-y-7">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Radio dal mondo</h1>
        <p className="mt-1 text-sm text-muted">Emittenti live da ogni continente, pronte per iPhone e Android.</p>
      </header>

      {topTracks.length > 0 ? (
        <section>
          <SectionHeader title="Più ascoltate" action="Riproduci" onAction={() => playQueue(topTracks, 0)} />
          <HScroll>
            {topTracks.slice(0, 16).map((t) => (
              <TrackCard key={t.id} track={t} queue={topTracks} />
            ))}
          </HScroll>
        </section>
      ) : null}

      <section>
        <SectionHeader title="Per paese" />
        <div className="scrollbar-none -mx-4 flex gap-2 overflow-x-auto px-4 sm:-mx-6 sm:px-6">
          {RADIO_COUNTRIES.map((item) => (
            <button
              key={item.code}
              type="button"
              onClick={() => void navigate({ search: { c: item.code } })}
              className={`h-11 shrink-0 rounded-full px-4 text-sm font-medium ${
                item.code === code ? "bg-primary text-primary-fg" : "bg-surface text-fg ring-1 ring-border"
              }`}
            >
              {item.name}
            </button>
          ))}
        </div>
      </section>

      <section>
        <SectionHeader
          title={countryName}
          action={countryTracks.length ? "Riproduci" : undefined}
          onAction={countryTracks.length ? () => playQueue(countryTracks, 0) : undefined}
        />
        {countryTracks.length === 0 ? (
          <p className="text-sm text-muted">Nessuna emittente disponibile al momento.</p>
        ) : (
          countryTracks.map((t, i) => <TrackRow key={t.id} track={t} queue={countryTracks} index={i} showIndex />)
        )}
      </section>
    </div>
  );
}
