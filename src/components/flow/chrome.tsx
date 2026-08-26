import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { signOut } from "@/lib/auth/client";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { loadLibrary, saveLibrary } from "@/lib/music/cloud";
import { getRelatedTracks } from "@/lib/music/catalog";
import { useT } from "@/lib/i18n";
import { useFlowStore } from "@/stores/flow-store";

export function HelpOverlay() {
  const show = useFlowStore((s) => s.showHelp);
  const setShowHelp = useFlowStore((s) => s.setShowHelp);
  if (!show) return null;
  const rows = [
    ["Spazio", "Play / pausa"],
    ["← / →", "Salta 10 secondi"],
    ["Shift + frecce", "Brano precedente / successivo"],
    ["↑ / ↓", "Volume"],
    ["M", "Muto"],
    ["S / R", "Casuale / Ripeti"],
    ["F / L / Q", "Player / Testi / Coda"],
    ["Esc", "Chiudi"],
  ];
  return (
    <div className="fixed inset-0 z-[95] flex items-center justify-center bg-bg/80 p-4" onClick={() => setShowHelp(false)}>
      <div className="w-full max-w-sm rounded-xl bg-elevated p-5 ring-1 ring-border" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-lg font-bold">Scorciatoie</h2>
        <ul className="mt-3 space-y-2 text-sm">
          {rows.map(([k, v]) => (
            <li key={k} className="flex justify-between gap-4">
              <span className="font-medium">{k}</span>
              <span className="text-muted">{v}</span>
            </li>
          ))}
        </ul>
        <button type="button" onClick={() => setShowHelp(false)} className="mt-4 text-sm font-medium text-primary">
          Chiudi
        </button>
      </div>
    </div>
  );
}

export function InstallHint() {
  const [text, setText] = useState<string | null>(null);
  const [promptEvent, setPromptEvent] = useState<{ prompt: () => Promise<void> } | null>(null);

  useEffect(() => {
    try {
      if (localStorage.getItem("flow_install_hide")) return;
    } catch {
      return;
    }
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      Boolean((navigator as Navigator & { standalone?: boolean }).standalone);
    if (standalone) return;
    const ios = /iPhone|iPad|iPod/i.test(navigator.userAgent);
    if (ios) {
      setText("Su iPhone: Condividi → Aggiungi a Home");
      return;
    }
    const onPrompt = (e: Event) => {
      e.preventDefault();
      setPromptEvent(e as unknown as { prompt: () => Promise<void> });
      setText("Installa Flow sul telefono");
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    return () => window.removeEventListener("beforeinstallprompt", onPrompt);
  }, []);

  if (!text) return null;

  return (
    <div className="flex items-center gap-2 bg-elevated px-3 py-2 text-xs text-fg md:hidden">
      <p className="min-w-0 flex-1">{text}</p>
      {promptEvent ? (
        <button
          type="button"
          className="font-semibold text-primary"
          onClick={() => {
            void promptEvent.prompt();
            setText(null);
          }}
        >
          Installa
        </button>
      ) : null}
      <button
        type="button"
        className="text-muted"
        onClick={() => {
          try {
            localStorage.setItem("flow_install_hide", "1");
          } catch {
            /* ignore */
          }
          setText(null);
        }}
      >
        Chiudi
      </button>
    </div>
  );
}

export function AuthChip() {
  const { user, isPending } = useCurrentUserState();
  const [signingOut, setSigningOut] = useState(false);
  const t = useT();
  if (isPending) return <div className="size-8 shrink-0 animate-pulse rounded-full bg-elevated" />;
  if (!user) {
    return (
      <Link to="/login" className="rounded-full bg-fg px-4 py-1.5 text-sm font-bold text-bg">
        {t("login")}
      </Link>
    );
  }
  const label = user.displayName ?? user.primaryEmail ?? "Account";
  return (
    <div className="flex items-center gap-2">
      {user.profileImageUrl ? (
        <img src={user.profileImageUrl} alt="" className="size-8 rounded-full object-cover" />
      ) : (
        <span className="grid size-8 place-items-center rounded-full bg-primary text-sm font-bold text-primary-fg">
          {label.charAt(0).toUpperCase()}
        </span>
      )}
      <span className="hidden max-w-[8rem] truncate text-sm font-medium md:inline">{label}</span>
      <button
        type="button"
        disabled={signingOut}
        onClick={() => {
          setSigningOut(true);
          void signOut().catch(() => setSigningOut(false));
        }}
        className="text-xs font-medium text-muted hover:text-fg"
      >
        {signingOut ? "…" : t("logout")}
      </button>
    </div>
  );
}

export function CloudSync() {
  const { user, isPending } = useCurrentUserState();

  useEffect(() => {
    if (isPending || !user) return;
    let cancelled = false;
    let timer = 0;
    loadLibrary()
      .then((data) => {
        if (cancelled) return;
        const local = useFlowStore.getState();
        const remoteHas =
          data && (data.liked.length > 0 || data.playlists.length > 0 || data.recents.length > 0);
        if (remoteHas && data) local.importCloud(data);
        else {
          void saveLibrary({ data: local.dumpCloud() }).catch(() => {});
          useFlowStore.setState({ cloudReady: true });
        }
      })
      .catch(() => {
        useFlowStore.setState({ cloudReady: true });
      });

    const unsub = useFlowStore.subscribe((s, prev) => {
      if (!s.cloudReady) return;
      if (
        s.liked === prev.liked &&
        s.recents === prev.recents &&
        s.playlists === prev.playlists &&
        s.settings === prev.settings &&
        s.volume === prev.volume
      ) {
        return;
      }
      window.clearTimeout(timer);
      timer = window.setTimeout(() => {
        void saveLibrary({ data: useFlowStore.getState().dumpCloud() }).catch(() => {});
      }, 900);
    });

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
      unsub();
    };
  }, [user?.id, isPending]);

  return null;
}

export function Prefs() {
  const theme = useFlowStore((s) => s.settings.theme);
  const locale = useFlowStore((s) => s.settings.locale);
  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("theme-light", theme === "light");
    root.lang = locale;
    root.style.colorScheme = theme;
  }, [theme, locale]);
  return null;
}

export function StationEngine() {
  const stationOn = useFlowStore((s) => s.stationOn);
  const current = useFlowStore((s) => s.current);
  const queue = useFlowStore((s) => s.queue);
  const queueIndex = useFlowStore((s) => s.queueIndex);
  const appendQueue = useFlowStore((s) => s.appendQueue);

  useEffect(() => {
    if (!stationOn || !current) return;
    if (queue.length - queueIndex > 3) return;
    let cancelled = false;
    void getRelatedTracks({
      data: { artist: current.artist, title: current.title, excludeId: current.id },
    }).then((tracks) => {
      if (!cancelled && tracks.length) appendQueue(tracks);
    });
    return () => {
      cancelled = true;
    };
  }, [stationOn, current?.id, queueIndex, queue.length]);

  return null;
}
