import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { SignedIn, SignedOut } from "@/lib/auth/gates";
import { listFriendsFeed, type SharedPlaylist } from "@/lib/music/share";
import { useFlowStore } from "@/stores/flow-store";

export const Route = createFileRoute("/friends")({ component: FriendsPage });

function FriendsPage() {
  const playQueue = useFlowStore((s) => s.playQueue);
  const [items, setItems] = useState<SharedPlaylist[]>([]);

  useEffect(() => {
    void listFriendsFeed()
      .then(setItems)
      .catch(() => setItems([]));
  }, []);

  return (
    <div className="flow-enter space-y-6">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">Amici</h1>
        <p className="mt-1 text-sm text-muted">Playlist pubbliche di chi segui.</p>
      </header>
      <SignedOut>
        <Link to="/login" search={{ mode: "up" }} className="font-semibold text-primary">
          Registrati
        </Link>{" "}
        <span className="text-sm text-muted">per seguire gli amici.</span>
      </SignedOut>
      <SignedIn>
        {items.length === 0 ? (
          <p className="text-sm text-muted">Segui qualcuno da una playlist pubblica per vedere il feed.</p>
        ) : (
          items.map((p) => (
            <div key={p.id} className="rounded-lg bg-surface p-4 ring-1 ring-border">
              <Link to="/p/$id" params={{ id: p.id }} className="text-sm font-semibold hover:underline">
                {p.title}
              </Link>
              <p className="text-xs text-muted">
                {p.ownerName} · {p.tracks.length} brani
              </p>
              {p.tracks[0] ? (
                <button
                  type="button"
                  onClick={() => playQueue(p.tracks, 0)}
                  className="mt-2 text-xs font-bold text-primary"
                >
                  Riproduci
                </button>
              ) : null}
            </div>
          ))
        )}
      </SignedIn>
    </div>
  );
}
