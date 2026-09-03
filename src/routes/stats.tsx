import { createFileRoute, Link } from "@tanstack/react-router";
import { useFlowStore } from "@/stores/flow-store";

export const Route = createFileRoute("/stats")({ component: StatsPage });

function StatsPage() {
  const listenMs = useFlowStore((s) => s.listenMs);
  const liked = useFlowStore((s) => s.liked);
  const recents = useFlowStore((s) => s.recents);
  const playlists = useFlowStore((s) => s.playlists);
  const plays = useFlowStore((s) => s.plays);
  const hours = listenMs / 3_600_000;
  const top = Object.entries(plays)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8);

  return (
    <div className="flow-enter mx-auto max-w-xl space-y-8">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">Le tue stats</h1>
        <p className="mt-1 text-sm text-muted">Minuti, artisti e libreria — sul dispositivo e sul profilo.</p>
      </header>
      <div className="grid grid-cols-2 gap-3">
        <Stat label="Ascolto" value={hours < 1 ? `${Math.round(listenMs / 60000)} min` : `${hours.toFixed(1)} h`} />
        <Stat label="Preferiti" value={String(liked.length)} />
        <Stat label="Playlist" value={String(playlists.length)} />
        <Stat label="Recenti" value={String(recents.length)} />
      </div>
      <section>
        <h2 className="mb-3 text-sm font-bold text-muted">Artisti più ascoltati</h2>
        {top.length === 0 ? (
          <p className="text-sm text-muted">Ascolta qualche brano per compilare la classifica.</p>
        ) : (
          <ol className="space-y-2">
            {top.map(([name, n], i) => (
              <li key={name} className="flex items-center gap-3 rounded-lg bg-surface px-3 py-2">
                <span className="w-6 text-sm tabular-nums text-subtle">{i + 1}</span>
                <Link to="/a/$name" params={{ name }} className="min-w-0 flex-1 truncate text-sm font-medium hover:underline">{name}</Link>
                <span className="text-xs text-muted">{n} play</span>
              </li>
            ))}
          </ol>
        )}
      </section>
      <Link to="/discover" className="inline-flex h-11 items-center rounded-full bg-primary px-5 text-sm font-bold text-primary-fg">
        Apri mix Scopri
      </Link>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-surface p-4">
      <p className="text-xs text-muted">{label}</p>
      <p className="mt-1 text-2xl font-bold tabular-nums">{value}</p>
    </div>
  );
}
