import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Compass, Pause, Play, Sparkles, Trophy } from "lucide-react";
import { getHomeFeed, stationToTrack } from "@/lib/music/catalog";
import { GENRES } from "@/lib/music/types";
import { greetingIt } from "@/lib/utils";
import { useFlowStore } from "@/stores/flow-store";
import { HScroll, QuickTile, SectionHeader, TrackArt, TrackCard, TrackRow } from "@/components/flow/tracks";

export const Route = createFileRoute("/")({
  loader: async () => {
    try {
      return await getHomeFeed();
    } catch {
      return { trending: [], hitsMix: [], independent: [], radios: [] };
    }
  },
  component: Home,
});

function Home() {
  const { trending, hitsMix, independent, radios } = Route.useLoaderData();
  const [hello, setHello] = useState("Ciao");
  useEffect(() => {
    setHello(greetingIt());
  }, []);
  const recents = useFlowStore((s) => s.recents);
  const playTrack = useFlowStore((s) => s.playTrack);
  const playQueue = useFlowStore((s) => s.playQueue);
  const current = useFlowStore((s) => s.current);
  const isPlaying = useFlowStore((s) => s.isPlaying);
  const togglePlay = useFlowStore((s) => s.togglePlay);

  const hero = trending[0];
  const quick = (recents.length ? recents : trending).slice(0, 6);
  const radioTracks = radios.map(stationToTrack);

  return (
    <div className="flow-enter space-y-8">
      <header>
        <p className="text-sm text-muted">{hello}</p>
        <h1 className="mt-0.5 text-2xl font-semibold tracking-tight md:text-3xl">Cosa vuoi ascoltare?</h1>
        <p className="mt-1 text-xs text-subtle">YouTube Music · testi SimpMusic</p>
      </header>

      {hero ? (
        <section className="relative overflow-hidden rounded-2xl bg-surface ring-1 ring-border">
          <div className="flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:p-7">
            <div className="size-36 shrink-0 overflow-hidden rounded-xl bg-elevated shadow-lg sm:size-44">
              <TrackArt src={hero.artwork} alt={hero.title} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-medium tracking-widest text-primary uppercase">In primo piano</p>
              <h2 className="mt-2 text-xl font-semibold tracking-tight sm:text-3xl">{hero.title}</h2>
              <p className="mt-1 text-sm text-muted">{hero.artist}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => (current?.id === hero.id ? togglePlay() : playTrack(hero, trending))}
                  className="inline-flex h-11 items-center gap-2 rounded-full bg-primary px-5 text-sm font-semibold text-primary-fg"
                >
                  {current?.id === hero.id && isPlaying ? (
                    <>
                      <Pause className="size-4 fill-current" /> In riproduzione
                    </>
                  ) : (
                    <>
                      <Play className="size-4 fill-current" /> Riproduci
                    </>
                  )}
                </button>
                <Link
                  to="/charts"
                  className="inline-flex h-11 items-center gap-2 rounded-full bg-elevated px-4 text-sm font-medium text-fg"
                >
                  <Trophy className="size-4" /> Classifiche
                </Link>
              </div>
            </div>
          </div>
        </section>
      ) : (
        <p className="rounded-2xl bg-surface px-4 py-8 text-center text-sm text-muted ring-1 ring-border">
          Catalogo in aggiornamento. Prova Radio o Cerca.
        </p>
      )}

      {quick.length > 0 ? (
        <section>
          <SectionHeader title="Accesso rapido" />
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
            {quick.map((t) => (
              <QuickTile key={t.id} track={t} queue={quick} />
            ))}
          </div>
        </section>
      ) : null}

      {trending.length > 0 ? (
        <section>
          <SectionHeader title="Tendenze del momento" action="Riproduci" onAction={() => playQueue(trending, 0)} />
          <HScroll>
            {trending.map((t) => (
              <TrackCard key={t.id} track={t} queue={trending} />
            ))}
          </HScroll>
        </section>
      ) : null}

      {radioTracks.length > 0 ? (
        <section>
          <SectionHeader title="Radio dal mondo" />
          <HScroll>
            {radioTracks.map((t) => (
              <TrackCard key={t.id} track={t} queue={radioTracks} />
            ))}
          </HScroll>
        </section>
      ) : null}

      {hitsMix.length > 0 ? (
        <section>
          <SectionHeader title="In evidenza" action="Riproduci" onAction={() => playQueue(hitsMix, 0)} />
          <div className="rounded-2xl bg-surface p-2 ring-1 ring-border sm:p-3">
            {hitsMix.slice(0, 6).map((t, i) => (
              <TrackRow key={t.id} track={t} queue={hitsMix} index={i} showIndex />
            ))}
          </div>
        </section>
      ) : null}

      {independent.length > 0 ? (
        <section>
          <SectionHeader title="Nuove uscite" />
          <HScroll>
            {independent.map((t) => (
              <TrackCard key={t.id} track={t} queue={independent} />
            ))}
          </HScroll>
        </section>
      ) : null}

      <section>
        <SectionHeader title="Generi" />
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
          {GENRES.slice(0, 8).map((g) => (
            <Link
              key={g.id}
              to="/explore"
              search={{ genre: g.id }}
              className="flex h-20 items-end rounded-xl bg-elevated p-3 ring-1 ring-border"
            >
              <span className="text-sm font-semibold">{g.name}</span>
            </Link>
          ))}
        </div>
      </section>

      <div className="grid gap-3 sm:grid-cols-2">
        <Link to="/mix" className="flex items-center gap-3 rounded-2xl bg-surface p-4 ring-1 ring-border">
          <span className="flex size-11 items-center justify-center rounded-xl bg-elevated text-primary">
            <Sparkles className="size-5" />
          </span>
          <span>
            <span className="block text-sm font-semibold">Mix intelligente</span>
            <span className="text-xs text-muted">Un mix su misura per il tuo umore</span>
          </span>
        </Link>
        <Link to="/explore" className="flex items-center gap-3 rounded-2xl bg-surface p-4 ring-1 ring-border">
          <span className="flex size-11 items-center justify-center rounded-xl bg-elevated text-primary">
            <Compass className="size-5" />
          </span>
          <span>
            <span className="block text-sm font-semibold">Esplora</span>
            <span className="text-xs text-muted">Mood, generi e scene dal mondo</span>
          </span>
        </Link>
      </div>
    </div>
  );
}
