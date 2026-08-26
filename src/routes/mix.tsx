import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Loader2, Sparkles } from "lucide-react";
import { createMoodMix } from "@/lib/music/catalog";
import { MOODS, type Track } from "@/lib/music/types";
import { useFlowStore } from "@/stores/flow-store";
import { SectionHeader, TrackRow } from "@/components/flow/tracks";

export const Route = createFileRoute("/mix")({
  validateSearch: (search: Record<string, unknown>): { mood?: string; q?: string } => ({
    mood: typeof search.mood === "string" ? search.mood : undefined,
    q: typeof search.q === "string" ? search.q : undefined,
  }),
  component: MixPage,
});

function MixPage() {
  const { mood: moodId, q: seed } = Route.useSearch();
  const [custom, setCustom] = useState("");
  const [loading, setLoading] = useState(false);
  const [blurb, setBlurb] = useState("");
  const [tracks, setTracks] = useState<Track[]>([]);
  const playQueue = useFlowStore((s) => s.playQueue);
  const selected = MOODS.find((m) => m.id === moodId);

  const run = async (prompt: string, label: string) => {
    setLoading(true);
    setBlurb("");
    try {
      const res = await createMoodMix({ data: { mood: label, prompt } });
      setTracks(res.tracks);
      setBlurb(res.blurb);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selected) void run(selected.prompt, selected.label);
    else if (seed) void run(seed, seed);
  }, [selected?.id, seed]);

  return (
    <div className="flow-enter space-y-6">
      <header>
        <p className="flex items-center gap-2 text-xs font-medium tracking-widest text-primary uppercase">
          <Sparkles className="size-3.5" /> Mix intelligente
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">Dimmi che umore hai</h1>
        <p className="mt-1 text-sm text-muted">
          Scegli un mood o descrivi il momento: prepariamo una selezione ascoltabile subito.
        </p>
      </header>

      <div className="flex flex-wrap gap-2">
        {MOODS.map((m) => (
          <button
            key={m.id}
            type="button"
            onClick={() => void run(m.prompt, m.label)}
            className={`chip h-11 rounded-full px-4 text-sm font-medium ${
              selected?.id === m.id ? "bg-primary text-primary-fg" : "bg-surface text-fg ring-1 ring-border"
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>

      <form
        className="flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          if (custom.trim()) void run(custom.trim(), custom.trim());
        }}
      >
        <input
          value={custom}
          onChange={(e) => setCustom(e.target.value)}
          placeholder="Es. road trip notturno, pioggia, anni 80..."
          className="h-12 min-w-0 flex-1 rounded-xl bg-surface px-4 text-base ring-1 ring-border outline-none placeholder:text-subtle"
        />
        <button
          type="submit"
          className="h-12 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-fg"
        >
          Crea
        </button>
      </form>

      {loading ? (
        <div className="flex items-center gap-2 py-10 text-sm text-muted">
          <Loader2 className="size-4 animate-spin" /> Sto componendo il mix
        </div>
      ) : tracks.length > 0 ? (
        <section>
          {blurb ? <p className="mb-3 text-sm text-muted">{blurb}</p> : null}
          <SectionHeader title="Il tuo mix" action="Riproduci tutto" onAction={() => playQueue(tracks, 0)} />
          {tracks.map((t, i) => (
            <TrackRow key={t.id} track={t} queue={tracks} index={i} showIndex />
          ))}
        </section>
      ) : (
        <p className="rounded-2xl bg-surface px-4 py-10 text-center text-sm text-muted ring-1 ring-border">
          Tocca un mood per iniziare.
        </p>
      )}
    </div>
  );
}
