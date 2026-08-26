import { useEffect, useMemo, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Loader2, Mic, Search as SearchIcon, X } from "lucide-react";
import { searchCatalog, stationToTrack } from "@/lib/music/catalog";
import type { RadioStation, Track } from "@/lib/music/types";
import { GENRES } from "@/lib/music/types";
import { HScroll, SectionHeader, TrackCard, TrackRow } from "@/components/flow/tracks";
import { Link } from "@tanstack/react-router";

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

  return (
    <div className="flow-enter space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">Cerca</h1>
      <div className="flex h-12 items-center gap-2 rounded-xl bg-surface px-3 ring-1 ring-border">
        <SearchIcon className="size-5 text-subtle" />
        <input
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
                void navigate({ search: { q: e.target.value || undefined }, replace: true });
          }}
          placeholder="Brani, artisti, radio..."
          className="h-full min-w-0 flex-1 bg-transparent text-sm text-fg outline-none placeholder:text-subtle"
          autoCapitalize="off"
          autoCorrect="off"
          enterKeyHint="search"
        />
        {q ? (
          <button
            type="button"
            onClick={() => {
              setQ("");
              void navigate({ search: { q: undefined } });
            }}
            className="flex size-9 items-center justify-center text-muted"
            aria-label="Pulisci"
          >
            <X className="size-4" />
          </button>
        ) : (
          <button
            type="button"
            onClick={voiceSearch}
            className="flex size-9 items-center justify-center text-muted"
            aria-label="Ricerca vocale"
          >
            <Mic className="size-4" />
          </button>
        )}
      </div>

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
                    className="rounded-full bg-elevated px-3 py-2 text-sm text-fg"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </section>
          ) : null}
          <section>
            <SectionHeader title="Sfoglia generi" />
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {GENRES.map((g) => (
                <Link
                  key={g.id}
                  to="/explore"
                  search={{ genre: g.id }}
                  className="flex h-16 items-end rounded-xl bg-elevated p-3 text-sm font-semibold ring-1 ring-border"
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
          <SectionHeader title="YouTube Music" />
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
