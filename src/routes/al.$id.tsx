import { createFileRoute, Link } from "@tanstack/react-router";
import { Play } from "lucide-react";
import { getAlbumPage } from "@/lib/music/catalog";
import { useFlowStore } from "@/stores/flow-store";
import { CollectionCard, HScroll, SectionHeader, TrackArt, TrackRow } from "@/components/flow/tracks";

export const Route = createFileRoute("/al/$id")({
  loader: async ({ params }) => getAlbumPage({ data: { id: params.id } }).catch(() => null),
  component: AlbumPage,
});

function AlbumPage() {
  const page = Route.useLoaderData();
  const playQueue = useFlowStore((s) => s.playQueue);
  const navigate = Route.useNavigate();

  if (!page) {
    return (
      <div className="flow-enter py-16 text-center text-sm text-muted">
        Album non trovato. <Link to="/search">Cerca</Link>
      </div>
    );
  }

  const meta = [page.year, page.tracks.length ? `${page.tracks.length} brani` : ""].filter(Boolean).join(" · ");

  return (
    <div className="flow-enter space-y-8 pb-4">
      <header className="flex items-end gap-4">
        <div className="size-28 shrink-0 overflow-hidden rounded-2xl bg-elevated sm:size-40">
          <TrackArt src={page.artwork} alt={page.title} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-bold tracking-widest text-muted uppercase">Album</p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight">{page.title}</h1>
          <p className="mt-1 truncate text-sm">
            <Link to="/a/$name" params={{ name: page.artist }} className="font-semibold hover:underline">
              {page.artist}
            </Link>
            {meta ? <span className="text-muted"> · {meta}</span> : null}
          </p>
          {page.tracks.length ? (
            <button
              type="button"
              onClick={() => playQueue(page.tracks, 0)}
              className="mt-4 inline-flex h-11 items-center gap-2 rounded-full bg-primary px-5 text-sm font-bold text-primary-fg"
            >
              <Play className="size-4 fill-current" />
              Riproduci
            </button>
          ) : null}
        </div>
      </header>

      {page.tracks.length ? (
        <section>
          <div className="rounded-md bg-elevated/50 p-2">
            {page.tracks.map((t, i) => (
              <TrackRow key={t.id} track={t} queue={page.tracks} index={i} showIndex />
            ))}
          </div>
        </section>
      ) : (
        <p className="text-sm text-muted">Nessuna tracklist per questo album.</p>
      )}

      {page.more.length ? (
        <section>
          <SectionHeader title={`Altri album di ${page.artist}`} />
          <HScroll>
            {page.more.map((al) => (
              <CollectionCard
                key={al.id}
                title={al.title}
                subtitle={al.year ? `${al.year} · ${al.tracks.length} brani` : `${al.tracks.length} brani`}
                artwork={al.artwork}
                onPlay={() => al.tracks.length && playQueue(al.tracks, 0)}
                onOpen={() => void navigate({ to: "/al/$id", params: { id: al.id } })}
              />
            ))}
          </HScroll>
        </section>
      ) : null}
    </div>
  );
}
