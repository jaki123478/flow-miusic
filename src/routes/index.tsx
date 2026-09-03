import { useEffect, useMemo, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Compass, Pause, Play, Sparkles } from "lucide-react";
import { getDiscoverMix, getFreshTracks, getHomeFeed, stationToTrack, type CatalogCollection } from "@/lib/music/catalog";
import { GENRES, MOODS } from "@/lib/music/types";
import { cn, greetingIt, hashHue } from "@/lib/utils";
import { useCurrentUser } from "@/lib/auth/use-current-user";
import { useFlowStore } from "@/stores/flow-store";
import { CollectionCard, HScroll, QuickTile, SectionHeader, TrackArt, TrackCard, TrackRow } from "@/components/flow/tracks";

export const Route = createFileRoute("/")({
  loader: async () => {
    try {
      return await getHomeFeed();
    } catch {
      return {
        trending: [],
        hitsMix: [],
        independent: [],
        radios: [],
        discoverWeekly: [],
        curated: [] as CatalogCollection[],
        dailyPlaylists: [] as CatalogCollection[],
      };
    }
  },
  component: Home,
});

function Home() {
  const feed = Route.useLoaderData();
  const { trending, hitsMix, independent, radios } = feed;
  const discoverWeekly = feed.discoverWeekly || [];
  const curated = feed.curated || [];
  const dailyPlaylists = feed.dailyPlaylists || [];
  const user = useCurrentUser();
  const [hello, setHello] = useState("Ciao");
  useEffect(() => {
    const greet = greetingIt();
    const first = (user?.displayName || "").trim().split(/\s+/)[0];
    setHello(first && !user?.isDevFallback ? `${greet}, ${first}` : greet);
  }, [user?.displayName, user?.isDevFallback]);
  const recents = useFlowStore((s) => s.recents);
  const liked = useFlowStore((s) => s.liked);
  const followed = useFlowStore((s) => s.followedArtists);
  const [weekly, setWeekly] = useState(discoverWeekly);
  const [weeklyPersonal, setWeeklyPersonal] = useState(false);
  const [releases, setReleases] = useState<typeof trending>([]);
  useEffect(() => {
    const artists = [...followed, ...liked.map((t) => t.artist)]
      .map((a) => a.trim())
      .filter((a, i, arr) => a && arr.indexOf(a) === i)
      .slice(0, 10);
    if (!artists.length) {
      setReleases([]);
      return;
    }
    let cancelled = false;
    void getFreshTracks({ data: { artists } })
      .then((list) => {
        if (!cancelled && list.length) setReleases(list);
      })
      .catch(() => {
        /* keep home as-is */
      });
    return () => {
      cancelled = true;
    };
  }, [followed, liked]);
  useEffect(() => {
    const artists = [...followed, ...liked.map((t) => t.artist), ...recents.map((t) => t.artist)]
      .map((a) => a.trim())
      .filter((a, i, arr) => a && arr.indexOf(a) === i)
      .slice(0, 6);
    if (!artists.length) {
      setWeekly(discoverWeekly);
      setWeeklyPersonal(false);
      return;
    }
    let cancelled = false;
    void getDiscoverMix({ data: { artists } })
      .then((tracks) => {
        if (cancelled || !tracks.length) return;
        setWeekly(tracks);
        setWeeklyPersonal(true);
      })
      .catch(() => {
        /* keep catalog mix from PR #2 */
      });
    return () => {
      cancelled = true;
    };
  }, [discoverWeekly, followed, liked, recents]);
  const playTrack = useFlowStore((s) => s.playTrack);
  const playQueue = useFlowStore((s) => s.playQueue);
  const current = useFlowStore((s) => s.current);
  const isPlaying = useFlowStore((s) => s.isPlaying);
  const togglePlay = useFlowStore((s) => s.togglePlay);

  const playlists = useFlowStore((s) => s.playlists);
  const trackMap = useFlowStore((s) => s.trackMap);
  const navigate = useNavigate();
  const [filter, setFilter] = useState<"all" | "music" | "radio" | "playlists">("all");

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
        <div className="mt-4 flex gap-2 overflow-x-auto scrollbar-none pb-1">
          {(
            [
              ["all", "Tutto"],
              ["music", "Musica"],
              ["playlists", "Playlist"],
              ["radio", "Radio"],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setFilter(id)}
              className={cn(
                "chip h-8 rounded-full px-4 text-sm font-medium",
                filter === id ? "bg-[#D4E84B] text-[#111827]" : "bg-elevated/90 text-fg",
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

      {filter !== "radio" && releases.length > 0 ? (
        <section>
          <SectionHeader title="Nuove uscite" action="Vedi tutte" onAction={() => void navigate({ to: "/fresh" })} />
          <p className="mb-3 text-xs text-muted">
            {followed.length ? "Dagli artisti che segui." : "Dai tuoi preferiti."}
          </p>
          <HScroll>
            {releases.slice(0, 12).map((t) => (
              <TrackCard key={t.id} track={t} queue={releases} />
            ))}
          </HScroll>
        </section>
      ) : null}

      {filter !== "radio" && weekly.length > 0 ? (
        <section>
          <SectionHeader title="Scoperta della settimana" action="Riproduci" onAction={() => playQueue(weekly, 0)} />
          <p className="mb-3 text-xs text-muted">
            {weeklyPersonal
              ? "Mix personalizzato dai tuoi ascolti e artisti seguiti."
              : "Selezione reale dal catalogo YouTube Music, non una playlist inventata."}
          </p>
          <HScroll>
            {weekly.slice(0, 12).map((t) => (
              <TrackCard key={t.id} track={t} queue={weekly} />
            ))}
          </HScroll>
        </section>
      ) : null}

      {filter !== "radio" && curated.length > 0 ? (
        <section>
          <SectionHeader title="In evidenza" />
          <HScroll>
            {curated.map((col) => (
              <button
                key={col.id}
                type="button"
                onClick={() => col.tracks.length && playQueue(col.tracks, 0)}
                className="relative h-44 w-[min(86vw,20rem)] shrink-0 overflow-hidden rounded-[1.6rem] text-left"
              >
                <img
                  src={col.tracks[0]?.artwork}
                  alt=""
                  referrerPolicy="no-referrer"
                  className="absolute inset-0 size-full object-cover"
                />
                <span className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/45 to-transparent" />
                <span className="relative flex h-full flex-col justify-between p-4">
                  <span>
                    <span className="block text-lg font-bold tracking-tight">{col.title}</span>
                    <span className="mt-1 block text-xs text-white/75">{col.subtitle}</span>
                  </span>
                  <span className="flex size-10 items-center justify-center rounded-full bg-[#D4E84B] text-[#111827]">
                    <Play className="ml-0.5 size-4 fill-current" />
                  </span>
                </span>
              </button>
            ))}
          </HScroll>
        </section>
      ) : null}

      {filter !== "music" && filter !== "radio" && dailyPlaylists.length > 0 ? (
        <section>
          <SectionHeader title="Playlist del giorno" action="Classifiche" onAction={() => void navigate({ to: "/charts" })} />
          <div className="space-y-1">
            {dailyPlaylists.map((col) => {
              const cover = col.tracks[0];
              return (
                <div key={col.id} className="flex items-center gap-3 rounded-xl px-1 py-2">
                  <button
                    type="button"
                    onClick={() => col.tracks.length && playQueue(col.tracks, 0)}
                    className="flex min-w-0 flex-1 items-center gap-3 text-left"
                  >
                    <span className="size-14 shrink-0 overflow-hidden rounded-xl bg-elevated">
                      <TrackArt src={cover?.artwork} alt="" />
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-bold">{col.title}</span>
                      <span className="block truncate text-xs text-muted">
                        {col.subtitle} · {col.tracks.length} brani
                      </span>
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => col.tracks.length && playQueue(col.tracks, 0)}
                    className="flex size-9 items-center justify-center rounded-full bg-elevated"
                    aria-label={`Riproduci ${col.title}`}
                  >
                    <Play className="ml-0.5 size-4 fill-current" />
                  </button>
                </div>
              );
            })}
          </div>
        </section>
      ) : null}


      {filter !== "radio" && filter !== "playlists" ? (
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
              title="Nuove uscite"
              subtitle="Da chi segui"
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

      {filter !== "radio" && filter !== "playlists" && hero ? (
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

      {filter !== "radio" && filter !== "playlists" && daily.length > 0 ? (
        <section>
          <SectionHeader title="Mix del giorno" action="Riproduci" onAction={() => playQueue(daily, 0)} />
          <div className="rounded-md bg-elevated/50 p-2">
            {daily.slice(0, 5).map((t, i) => (
              <TrackRow key={t.id} track={t} queue={daily} index={i} showIndex />
            ))}
          </div>
        </section>
      ) : null}

      {filter !== "radio" && filter !== "playlists" && trending.length > 0 ? (
        <section>
          <SectionHeader title="Tendenze del momento" action="Riproduci" onAction={() => playQueue(trending, 0)} />
          <HScroll>
            {trending.map((t) => (
              <TrackCard key={t.id} track={t} queue={trending} />
            ))}
          </HScroll>
        </section>
      ) : null}

      {filter !== "radio" && filter !== "playlists" ? (
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

      {filter !== "radio" && filter !== "playlists" && hitsMix.length > 0 ? (
        <section>
          <SectionHeader title="In evidenza" action="Riproduci" onAction={() => playQueue(hitsMix, 0)} />
          <div className="rounded-xl bg-surface p-2 ring-1 ring-border sm:p-3">
            {hitsMix.slice(0, 6).map((t, i) => (
              <TrackRow key={t.id} track={t} queue={hitsMix} index={i} showIndex />
            ))}
          </div>
        </section>
      ) : null}

      {filter !== "radio" && filter !== "playlists" && independent.length > 0 ? (
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
