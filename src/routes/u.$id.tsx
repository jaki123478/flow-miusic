import { createFileRoute, Link } from "@tanstack/react-router";
import { useCurrentUser } from "@/lib/auth/use-current-user";
import { followUser, listUserPlaylists } from "@/lib/music/share";
import { useFlowStore } from "@/stores/flow-store";

export const Route = createFileRoute("/u/$id")({
  loader: async ({ params }) => listUserPlaylists({ data: { userId: params.id } }),
  component: ProfilePage,
});

function ProfilePage() {
  const items = Route.useLoaderData();
  const { id } = Route.useParams();
  const user = useCurrentUser();
  const playQueue = useFlowStore((s) => s.playQueue);
  const name = items[0]?.ownerName || "Utente";

  return (
    <div className="flow-enter space-y-6">
      <header className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{name}</h1>
          <p className="text-sm text-muted">{items.length} playlist pubbliche</p>
        </div>
        {user && user.id !== id ? (
          <button
            type="button"
            onClick={() => void followUser({ data: { targetId: id } })}
            className="h-10 rounded-full bg-fg px-4 text-sm font-bold text-bg"
          >
            Segui
          </button>
        ) : null}
      </header>
      {items.length === 0 ? (
        <p className="text-sm text-muted">Nessuna playlist pubblica.</p>
      ) : (
        items.map((p) => (
          <div key={p.id} className="flex items-center justify-between rounded-lg bg-surface px-4 py-3">
            <Link to="/p/$id" params={{ id: p.id }} className="min-w-0">
              <p className="truncate text-sm font-semibold">{p.title}</p>
              <p className="text-xs text-muted">{p.tracks.length} brani</p>
            </Link>
            {p.tracks[0] ? (
              <button type="button" onClick={() => playQueue(p.tracks, 0)} className="text-xs font-bold text-primary">
                Play
              </button>
            ) : null}
          </div>
        ))
      )}
    </div>
  );
}
