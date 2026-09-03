import { useEffect, useMemo, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Loader2, Mic, Search as SearchIcon, User, X } from "lucide-react";
import { searchCatalog, stationToTrack, suggestSearch } from "@/lib/music/catalog";
import { useFlowStore } from "@/stores/flow-store";
import type { RadioStation, Track } from "@/lib/music/types";
import { GENRES } from "@/lib/music/types";
import { HScroll, SectionHeader, TrackCard, TrackRow } from "@/components/flow/tracks";
import { hashHue } from "@/lib/utils";

export const Route = createFileRoute("/search")({
  validateSearch: (search: Record<string, unknown>): { q?: string } => ({
    q: typeof search.q === "string" ? search.q : undefined,
  }),
  component: SearchPage,
});

function SearchPage() {
  const { q: initial = "" } = Route.useSearch();
  const navigate = useNavigate({ from: "/search" });
  const [q, setQ] = useState(initial);
  const [loading, setLoading] = useState(false);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [independent, setIndependent] = useState<Track[]>([]);
  const [radios, setRadios] = useState<RadioStation[]>([]);
  const [recent, setRecent] = useState<string[]>([]);
  const [queries, setQueries] = useState<string[]>([]);
  const [hintSongs, setHintSongs] = useState<Track[]>([]);
  const [hintArtists, setHintArtists] = useState<{ name: string; artwork: string }[]>([]);
  const playTrack = useFlowStore((s) => s.playTrack);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("flow_recent_searches");
      if (raw) setRecent(JSON.parse(raw) as string[]);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    setQ(initial);
  }, [initial]);

  useEffect(() => {
    const term = q.trim();
    if (term.length < 2) {
      setQueries([]);
      setHintSongs([]);
      setHintArtists([]);
      return;
    }
    let cancelled = false;
    const t = window.setTimeout(() => {
      void suggestSearch({ data: { q: term } })
        .then((res) => {
          if (cancelled) return;
          setQueries(res.queries || []);
          setHintSongs(res.songs || []);
          setHintArtists(res.artists || []);
        })
        .catch(() => {
          if (!cancelled) {
            setQueries([]);
            setHintSongs([]);
            setHintArtists([]);
          }
        });
    }, 140);
    return () => {
      cancelled = true;
      window.clearTimeout(t);
    };
  }, [q]);

  useEffect(() => {
    const term = q.trim();
    if (!term) {
      setTracks([]);
      setIndependent([]);
      setRadios([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const t = window.setTimeout(() => {
      searchCatalog({ data: { q: term } })
        .then((res) => {
          setTracks(res.tracks);
          setIndependent(res.independent);
          setRadios(res.radios);
          const next = [term, ...recent.filter((s) => s.toLowerCase() !== term.toLowerCase())].slice(0, 8);
          setRecent(next);
          try {
            localStorage.setItem("flow_recent_searches", JSON.stringify(next));
          } catch {
            /* ignore */
          }
        })
        .finally(() => setLoading(false));
    }, 320);
    return () => window.clearTimeout(t);
  }, [q]);

  const radioTracks = useMemo(() => radios.map(stationToTrack), [radios]);
  const empty = !loading && q.trim() && tracks.length + independent.length + radios.length === 0;

  const voiceSearch = () => {
    const SR = (window as unknown as { SpeechRecognition?: new () => SpeechRecognitionLike; webkitSpeechRecognition?: new () => SpeechRecognitionLike })
      .SpeechRecognition ||
      (window as unknown as { webkitSpeechRecognition?: new () => SpeechRecognitionLike }).webkitSpeechRecognition;
    if (!SR) return;
    const rec = new SR();
    rec.lang = "it-IT";
    rec.onresult = (ev) => {
      const text = ev.results?.[0]?.[0]?.transcript;
      if (text) {
        setQ(text);
            void navigate({ search: { q: text } });
      }
    };
    rec.start();
  };

  const remember = (term: string) => {
    const next = [term, ...recent.filter((s) => s.toLowerCase() !== term.toLowerCase())].slice(0, 8);
    setRecent(next);
    try {
      localStorage.setItem("flow_recent_searches", JSON.stringify(next));
    } catch {
      /* ignore */
    }
  };

  const applyQuery = (term: string) => {
    setQ(term);
    void navigate({ search: { q: term } });
    remember(term);
  };

  const hasHints = queries.length + hintSongs.length + hintArtists.length > 0;

  return (
    <div className="flow-enter space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Cerca</h1>
      <div className="flex h-12 items-center gap-3 rounded-full bg-fg px-4 text-bg md:max-w-xl">
        <SearchIcon className="size-5" />
        <input
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
                void navigate({ search: { q: e.target.value || undefined }, replace: true });
          }}
          placeholder="Cosa vuoi ascoltare?"
          className="h-full min-w-0 flex-1 bg-transparent text-base font-medium text-bg outline-none placeholder:text-bg/50"
          autoCapitalize="off"
          autoCorrect="off"
          autoComplete="off"
          enterKeyHint="search"
          inputMode="search"
        />
        {q ? (
          <button
            type="button"
            onClick={() => {
              setQ("");
              void navigate({ search: { q: undefined } });
            }}
            className="flex size-9 items-center justify-center text-bg/60"
            aria-label="Pulisci"
          >
            <X className="size-4" />
          </button>
        ) : (
          <button
            type="button"
            onClick={voiceSearch}
            className="flex size-9 items-center justify-center text-bg/60"
            aria-label="Ricerca vocale"
          >
            <Mic className="size-4" />
          </button>
        )}
      </div>


      {q.trim() && hasHints ? (
        <section className="overflow-hidden rounded-2xl bg-surface ring-1 ring-border">
          {hintArtists.map((a) => (
            <Link
              key={a.name}
              to="/a/$name"
              params={{ name: a.name }}
              className="flex min-h-12 items-center gap-3 px-3 py-2 hover:bg-highlight"
            >
              <span className="size-10 shrink-0 overflow-hidden rounded-full bg-elevated">
                {a.artwork ? (
                  <img src={a.artwork} alt="" referrerPolicy="no-referrer" className="size-full object-cover" />
                ) : (
                  <User className="m-2.5 size-5 text-muted" />
                )}
              </span>
              <span className="min-w-0">
                <span className="block truncate text-sm font-medium">{a.name}</span>
                <span className="text-xs text-muted">Artista</span>
              </span>
            </Link>
          ))}
          {hintSongs.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => {
                playTrack(t, hintSongs);
                remember(t.title);
              }}
              className="flex min-h-12 w-full items-center gap-3 px-3 py-2 text-left hover:bg-highlight"
            >
              <span className="size-10 shrink-0 overflow-hidden rounded-md bg-elevated">
                <img src={t.artwork} alt="" referrerPolicy="no-referrer" className="size-full object-cover" />
              </span>
              <span className="min-w-0">
                <span className="block truncate text-sm font-medium">{t.title}</span>
                <span className="truncate text-xs text-muted">{t.artist}</span>
              </span>
            </button>
          ))}
          {queries.map((sugg) => (
            <button
              key={sugg}
              type="button"
              onClick={() => applyQuery(sugg)}
              className="flex min-h-11 w-full items-center gap-3 px-3 py-2 text-left hover:bg-highlight"
            >
              <SearchIcon className="size-4 shrink-0 text-muted" />
              <span className="truncate text-sm">{sugg}</span>
            </button>
          ))}
        </section>
      ) : null}
      {loading ? (
        <div className="flex items-center gap-2 text-sm text-muted">
          <Loader2 className="size-4 animate-spin" /> Ricerca in corso
        </div>
      ) : null}

      {!q.trim() ? (
        <>
          {recent.length > 0 ? (
            <section>
              <SectionHeader
                title="Ricerche recenti"
                action="Cancella"
                onAction={() => {
                  setRecent([]);
                  localStorage.removeItem("flow_recent_searches");
                }}
              />
              <div className="flex flex-wrap gap-2">
                {recent.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => {
                      setQ(s);
                      void navigate({ search: { q: s } });
                    }}
                    className="chip rounded-full bg-elevated px-3 py-2 text-sm text-fg"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </section>
          ) : null}
          <section>
            <SectionHeader title="Sfoglia tutto" />
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {GENRES.map((g) => (
                <Link
                  key={g.id}
                  to="/explore"
                  search={{ genre: g.id }}
                  className="relative h-28 overflow-hidden rounded-lg p-3 text-base font-bold"
                  style={{ backgroundColor: `hsl(${hashHue(g.id)} 62% 38%)` }}
                >
                  {g.name}
                </Link>
              ))}
            </div>
          </section>
        </>
      ) : null}

      {empty ? <p className="text-sm text-muted">Nessun risultato per “{q}”.</p> : null}

      {tracks.length > 0 ? (
        <section>
          <SectionHeader title="Brani" />
          {tracks.map((t, i) => (
            <TrackRow key={t.id} track={t} queue={tracks} index={i} />
          ))}
        </section>
      ) : null}

      {independent.length > 0 ? (
        <section>
          <SectionHeader title="Altri video" />
          <HScroll>
            {independent.map((t) => (
              <TrackCard key={t.id} track={t} queue={independent} />
            ))}
          </HScroll>
        </section>
      ) : null}

      {radioTracks.length > 0 ? (
        <section>
          <SectionHeader title="Radio" />
          {radioTracks.map((t, i) => (
            <TrackRow key={t.id} track={t} queue={radioTracks} index={i} />
          ))}
        </section>
      ) : null}
    </div>
  );
}

interface SpeechRecognitionLike {
  lang: string;
  start: () => void;
  onresult: ((ev: { results?: { 0?: { 0?: { transcript?: string } } } }) => void) | null;
}
