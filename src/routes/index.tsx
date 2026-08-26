import { useEffect, useMemo, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Compass, Pause, Play, Sparkles } from "lucide-react";
import { getHomeFeed, stationToTrack } from "@/lib/music/catalog";
import { GENRES, MOODS } from "@/lib/music/types";
import { cn, greetingIt, hashHue } from "@/lib/utils";
import { useFlowStore } from "@/stores/flow-store";
import { CollectionCard, HScroll, QuickTile, SectionHeader, TrackArt, TrackCard, TrackRow } from "@/components/flow/tracks";

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
  const liked = useFlowStore((s) => s.liked);
  const playTrack = useFlowStore((s) => s.playTrack);
  const playQueue = useFlowStore((s) => s.playQueue);
  const current = useFlowStore((s) => s.current);
  const isPlaying = useFlowStore((s) => s.isPlaying);
  const togglePlay = useFlowStore((s) => s.togglePlay);

  const playlists = useFlowStore((s) => s.playlists);
  const trackMap = useFlowStore((s) => s.trackMap);
  const navigate = useNavigate();
  const [filter, setFilter] = useState<"all" | "music" | "radio">("all");

  const hero = trending[0];
  const quick = (recents.length ? recents : trending).slice(0, 6);
  const radioTracks = radios.map(stationToTrack);
  const daily = useMemo(() => {
    const pool = [...recents, ...liked, ...trending, ...hitsMix];
    const seen = new Set<string>();
    const out = [];
    for (const t of pool) {
      if (seen.has(t.id)) continue;
      seen.add(t.id);
      out.push(t);
      if (out.length >= 12) break;
    }
    return out;
  }, [recents, liked, trending, hitsMix]);

  return (
    <div className="flow-enter space-y-8 pb-4">
      <header className="pt-2">
        <h1 className="text-3xl font-bold tracking-tight md:text-4xl">{hello}</h1>
        <div className="mt-4 flex gap-2">
          {(
            [
              ["all", "Tutto"],
              ["music", "Musica"],
              ["radio", "Radio"],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setFilter(id)}
              className={cn(
                "chip h-8 rounded-full px-4 text-sm font-medium",
                filter === id ? "bg-fg text-bg" : "bg-elevated text-fg",
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </header>

      {filter !== "radio" && quick.length > 0 ? (
        <section>
          <div className="grid grid-cols-2 gap-2 xl:grid-cols-3">
            {quick.map((t) => (
              <QuickTile key={t.id} track={t} queue={quick} />
            ))}
          </div>
        </section>
      ) : null}

      {filter !== "radio" ? (
        <section>
          <SectionHeader title="Fatto per te" />
          <HScroll>
            <CollectionCard
              title="Mix del giorno"
              subtitle="Aggiornato per te"
              artwork={daily[0]?.artwork}
              onPlay={() => daily.length && playQueue(daily, 0)}
            />
            <CollectionCard
              title="Scopri"
              subtitle="Mix dai tuoi artisti"
              artwork={liked[1]?.artwork || recents[1]?.artwork}
              onPlay={() => void navigate({ to: "/discover" })}
            />
            <CollectionCard
              title="Novità"
              subtitle="Uscite fresche"
              artwork={independent[0]?.artwork || trending[0]?.artwork}
              onPlay={() => void navigate({ to: "/fresh" })}
            />
            <CollectionCard
              title="Brani che ti piacciono"
              subtitle={`${liked.length} brani`}
              artwork={liked[0]?.artwork}
              onPlay={() => liked.length && playQueue(liked, 0)}
            />
            <CollectionCard
              title="Mix intelligente"
              subtitle="In base al tuo umore"
              artwork={hitsMix[0]?.artwork || trending[1]?.artwork}
              onPlay={() => void navigate({ to: "/mix" })}
            />
            <CollectionCard
              title="Classifiche"
              subtitle="Cosa ascolta il mondo"
              artwork={trending[0]?.artwork}
              onPlay={() => trending.length && playQueue(trending, 0)}
            />
            {playlists.slice(0, 4).map((p) => {
              const cover = p.trackIds.map((id) => trackMap[id]).find(Boolean);
              return (
                <CollectionCard
                  key={p.id}
                  title={p.title}
                  subtitle={`Playlist · ${p.trackIds.length}`}
                  artwork={cover?.artwork}
                  onPlay={() => {
                    const tracks = p.trackIds.map((id) => trackMap[id]).filter(Boolean);
                    if (tracks.length) playQueue(tracks, 0);
                  }}
                />
              );
            })}
          </HScroll>
        </section>
      ) : null}

      {filter !== "radio" && hero ? (
        <section className="relative overflow-hidden rounded-lg">
          <div className="pointer-events-none absolute inset-0 opacity-40">
            <img src={hero.artwork} alt="" referrerPolicy="no-referrer" className="size-full scale-110 object-cover blur-3xl" />
          </div>
          <div className="relative flex flex-col gap-6 p-6 sm:flex-row sm:items-end sm:p-8">
            <div className="art-shadow size-40 shrink-0 overflow-hidden rounded sm:size-56">
              <TrackArt src={hero.artwork} alt={hero.title} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold tracking-widest text-fg uppercase">Playlist in evidenza</p>
              <h2 className="mt-2 font-heading text-3xl font-bold tracking-tight sm:text-5xl">{hero.title}</h2>
              <p className="mt-2 text-sm text-muted">{hero.artist}</p>
              <div className="mt-6 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => (current?.id === hero.id ? togglePlay() : playTrack(hero, trending))}
                  className="play-fab inline-flex size-14 items-center justify-center rounded-full bg-primary text-primary-fg sm:size-16"
                  aria-label="Riproduci"
                >
                  {current?.id === hero.id && isPlaying ? (
                    <Pause className="size-6 fill-current" />
                  ) : (
                    <Play className="ml-0.5 size-6 fill-current" />
                  )}
                </button>
                <Link to="/charts" className="text-sm font-bold text-muted hover:text-fg">
                  Vai alle classifiche
                </Link>
              </div>
            </div>
          </div>
        </section>
      ) : (
        <p className="rounded-lg bg-elevated px-4 py-8 text-center text-sm text-muted">
          Catalogo in aggiornamento. Prova Radio o Cerca.
        </p>
      )}

      {filter !== "radio" && daily.length > 0 ? (
        <section>
          <SectionHeader title="Mix del giorno" action="Riproduci" onAction={() => playQueue(daily, 0)} />
          <div className="rounded-md bg-elevated/50 p-2">
            {daily.slice(0, 5).map((t, i) => (
              <TrackRow key={t.id} track={t} queue={daily} index={i} showIndex />
            ))}
          </div>
        </section>
      ) : null}

      {filter !== "radio" && trending.length > 0 ? (
        <section>
          <SectionHeader title="Tendenze del momento" action="Riproduci" onAction={() => playQueue(trending, 0)} />
          <HScroll>
            {trending.map((t) => (
              <TrackCard key={t.id} track={t} queue={trending} />
            ))}
          </HScroll>
        </section>
      ) : null}

      {filter !== "radio" ? (
        <section>
          <SectionHeader title="Mood" />
          <div className="flex flex-wrap gap-2">
            {MOODS.map((m) => (
              <Link
                key={m.id}
                to="/mix"
                search={{ mood: m.id }}
                className="chip rounded-full bg-elevated px-4 py-2 text-sm font-medium ring-1 ring-border hover:bg-surface"
              >
                {m.label}
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      {filter !== "music" && radioTracks.length > 0 ? (
        <section>
          <SectionHeader title="Radio dal mondo" />
          <HScroll>
            {radioTracks.map((t) => (
              <TrackCard key={t.id} track={t} queue={radioTracks} />
            ))}
          </HScroll>
          <Link to="/radio" className="mt-3 inline-block text-xs font-medium text-muted hover:text-fg">
            Tutte le emittenti
          </Link>
        </section>
      ) : null}

      {filter !== "radio" && hitsMix.length > 0 ? (
        <section>
          <SectionHeader title="In evidenza" action="Riproduci" onAction={() => playQueue(hitsMix, 0)} />
          <div className="rounded-xl bg-surface p-2 ring-1 ring-border sm:p-3">
            {hitsMix.slice(0, 6).map((t, i) => (
              <TrackRow key={t.id} track={t} queue={hitsMix} index={i} showIndex />
            ))}
          </div>
        </section>
      ) : null}

      {filter !== "radio" && independent.length > 0 ? (
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
              className="flex h-24 items-end rounded-lg p-3"
              style={{ backgroundColor: `hsl(${hashHue(g.id)} 55% 32%)` }}
            >
              <span className="text-sm font-bold">{g.name}</span>
            </Link>
          ))}
        </div>
      </section>

      <div className="grid gap-3 sm:grid-cols-2">
        <Link to="/mix" className="quick-tile flex items-center gap-3 rounded-lg bg-elevated p-4">
          <span className="flex size-11 items-center justify-center rounded-lg bg-elevated text-primary">
            <Sparkles className="size-5" />
          </span>
          <span>
            <span className="block text-sm font-semibold">Mix intelligente</span>
            <span className="text-xs text-muted">Una selezione sul tuo umore</span>
          </span>
        </Link>
        <Link to="/explore" className="quick-tile flex items-center gap-3 rounded-lg bg-elevated p-4">
          <span className="flex size-11 items-center justify-center rounded-lg bg-elevated text-primary">
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
