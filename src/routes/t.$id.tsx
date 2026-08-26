import { useEffect } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { getVideoTrack } from "@/lib/music/catalog";
import { useFlowStore } from "@/stores/flow-store";
import { TrackRow } from "@/components/flow/tracks";

export const Route = createFileRoute("/t/$id")({
  loader: async ({ params }) => getVideoTrack({ data: { id: params.id } }),
  component: TrackSharePage,
});

function TrackSharePage() {
  const track = Route.useLoaderData();
  const playTrack = useFlowStore((s) => s.playTrack);

  useEffect(() => {
    if (track) playTrack(track);
  }, [track?.id]);

  if (!track) {
    return (
      <div className="flow-enter py-16 text-center text-sm text-muted">
        Brano non trovato. <Link to="/search">Cerca</Link>
      </div>
    );
  }

  return (
    <div className="flow-enter space-y-4">
      <h1 className="text-2xl font-bold">Ascolta con Flow</h1>
      <TrackRow track={track} queue={[track]} />
      <p className="text-sm text-muted">Condividi questo link per ascoltare insieme lo stesso brano.</p>
    </div>
  );
}
