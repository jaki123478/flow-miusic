import { useEffect, type ReactNode } from "react";
import { Link, Navigate, useRouterState } from "@tanstack/react-router";
import { Compass, Heart, House, Library, Plus, Radio, Search, Settings, Trophy } from "lucide-react";
import { authEnabled } from "@/lib/auth/client";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { cn } from "@/lib/utils";
import { useFlowStore } from "@/stores/flow-store";
import { AudioEngine, FullPlayer, MiniPlayer } from "./player";
import { ActionSheet, TrackArt } from "./tracks";
import { HelpOverlay, InstallHint, AuthChip, CloudSync, Prefs, StationEngine } from "./chrome";
import { ToastHost } from "./toast";
import { OnboardingModal } from "./onboarding-modal";
import { ChatPanel } from "./chat-panel";
import { ChatFab, ChatToggle } from "./chat-fab";

const NAV = [
  { to: "/", label: "Home", icon: House },
  { to: "/search", label: "Cerca", icon: Search },
  { to: "/radio", label: "Radio", icon: Radio },
  { to: "/library", label: "Libreria", icon: Library },
] as const;

function FlowMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden>
      <rect width="32" height="32" rx="8" fill="currentColor" className="text-primary" />
      <rect x="8" y="12" width="2.4" height="8" rx="1.2" fill="currentColor" className="text-primary-fg" />
      <rect x="12.2" y="8" width="2.4" height="16" rx="1.2" fill="currentColor" className="text-primary-fg" />
      <rect x="16.4" y="11" width="2.4" height="10" rx="1.2" fill="currentColor" className="text-primary-fg" />
      <circle cx="23" cy="18" r="3.2" fill="currentColor" className="text-primary-fg" />
      <rect x="21.6" y="7.5" width="2.4" height="11" rx="1.2" fill="currentColor" className="text-primary-fg" />
    </svg>
  );
}

function isTypingTarget(el: EventTarget | null) {
  if (!(el instanceof HTMLElement)) return false;
  const tag = el.tagName;
  return tag === "INPUT" || tag === "TEXTAREA" || el.isContentEditable;
}

function LibraryRail() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const playlists = useFlowStore((s) => s.playlists);
  const liked = useFlowStore((s) => s.liked);
  const recents = useFlowStore((s) => s.recents);
  const trackMap = useFlowStore((s) => s.trackMap);
  const createPlaylist = useFlowStore((s) => s.createPlaylist);

  return (
    <div className="flex min-h-0 flex-1 flex-col rounded-lg bg-surface">
      <div className="flex items-center justify-between px-4 py-3">
        <Link
          to="/library"
          className={cn(
            "nav-link flex items-center gap-2 text-sm font-semibold",
            pathname.startsWith("/library") ? "is-active text-fg" : "text-muted hover:text-fg",
          )}
        >
          <Library className="size-5" />
          La tua libreria
        </Link>
        <button
          type="button"
          onClick={() => createPlaylist("Nuova playlist")}
          className="pressable flex size-8 items-center justify-center rounded-full text-muted hover:bg-elevated hover:text-fg"
          aria-label="Crea playlist"
        >
          <Plus className="size-4" />
        </button>
      </div>
      <div className="flex gap-2 px-3 pb-2">
        <Link to="/library" className="chip rounded-full bg-elevated px-3 py-1 text-xs font-medium">
          Playlist
        </Link>
        <Link to="/radio" className="chip rounded-full bg-elevated px-3 py-1 text-xs font-medium">
          Radio
        </Link>
      </div>
      <div className="scrollbar-none min-h-0 flex-1 overflow-y-auto px-2 pb-3">
        <Link
          to="/library"
          className="flex items-center gap-3 rounded-md px-2 py-2 hover:bg-elevated"
        >
          <span className="liked-wash flex size-12 items-center justify-center rounded-md text-fg">
            <Heart className="size-5 fill-current" />
          </span>
          <span className="min-w-0">
            <span className="block truncate text-sm font-medium">Brani che ti piacciono</span>
            <span className="text-xs text-muted">Playlist · {liked.length} brani</span>
          </span>
        </Link>
        {recents[0] ? (
          <Link to="/library" className="flex items-center gap-3 rounded-md px-2 py-2 hover:bg-elevated">
            <span className="size-12 overflow-hidden rounded-md bg-elevated">
              <TrackArt src={recents[0].artwork} alt="" />
            </span>
            <span className="min-w-0">
              <span className="block truncate text-sm font-medium">Ascoltati di recente</span>
              <span className="text-xs text-muted">{recents.length} brani</span>
            </span>
          </Link>
        ) : null}
        {playlists.map((p) => {
          const cover = p.trackIds.map((id) => trackMap[id]).find(Boolean);
          return (
            <Link
              key={p.id}
              to="/library"
              className="flex items-center gap-3 rounded-md px-2 py-2 hover:bg-elevated"
            >
              <span className="size-12 overflow-hidden rounded-md bg-elevated">
                {cover ? <TrackArt src={cover.artwork} alt="" /> : <span className="block size-full bg-elevated" />}
              </span>
              <span className="min-w-0">
                <span className="block truncate text-sm font-medium">{p.title}</span>
                <span className="text-xs text-muted">Playlist · {p.trackIds.length} brani</span>
              </span>
            </Link>
          );
        })}
        <Link to="/settings" className="mt-2 flex items-center gap-3 rounded-md px-2 py-2 text-muted hover:bg-elevated hover:text-fg">
          <Settings className="size-5" />
          <span className="text-sm font-medium">Impostazioni</span>
        </Link>
      </div>
    </div>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const nextPath = useRouterState({
    select: (s) => {
      const n = (s.location.search as { next?: string }).next;
      return typeof n === "string" && n.startsWith("/") && !n.startsWith("//") ? n : "/";
    },
  });
  const { user, isPending } = useCurrentUserState();
  const hydrate = useFlowStore((s) => s.hydrate);
  const showChat = useFlowStore((s) => s.showChat);
  const isLogin = pathname === "/login";

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    const t = window.setInterval(() => {
      if (document.hidden) return;
      const s = useFlowStore.getState();
      if (s.isPlaying && s.current) s.addListenMs(5000);
    }, 5000);
    return () => window.clearInterval(t);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (isTypingTarget(e.target) || e.metaKey || e.ctrlKey || e.altKey) return;
      const s = useFlowStore.getState();
      if (e.code === "Space") {
        e.preventDefault();
        s.togglePlay();
        return;
      }
      if (e.key === "ArrowRight") {
        e.preventDefault();
        if (e.shiftKey) s.next();
        else s.skipBy(10);
        return;
      }
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        if (e.shiftKey) s.prev();
        else s.skipBy(-10);
        return;
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        s.setVolume(Math.min(1, s.volume + 0.05));
        return;
      }
      if (e.key === "ArrowDown") {
        e.preventDefault();
        s.setVolume(Math.max(0, s.volume - 0.05));
        return;
      }
      if (e.key === "m" || e.key === "M") s.toggleMute();
      if (e.key === "l" || e.key === "L") {
        if (s.current) {
          s.setShowFullPlayer(true);
          s.setShowLyrics(!s.showLyrics);
        }
      }
      if (e.key === "f" || e.key === "F") s.setShowFullPlayer(!s.showFullPlayer);
      if (e.key === "s" || e.key === "S") s.toggleShuffle();
      if (e.key === "r" || e.key === "R") s.cycleRepeat();
      if (e.key === "q" || e.key === "Q") {
        if (s.current) {
          s.setShowFullPlayer(true);
          s.setShowQueue(!s.showQueue);
        }
        return;
      }
      if (e.key === "?" || (e.shiftKey && e.key === "/")) {
        e.preventDefault();
        s.setShowHelp(!s.showHelp);
        return;
      }
      if (e.key === "d" || e.key === "D") {
        e.preventDefault();
        s.setShowChat(!s.showChat);
        return;
      }
      if (e.key === "Escape") {
        if (s.actionTrack) s.setActionTrack(null);
        else if (s.showChat) s.setShowChat(false);
        else if (s.showFullPlayer) s.setShowFullPlayer(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  if (isLogin) {
    if (authEnabled && user && !isPending) {
      return <Navigate to={nextPath} />;
    }
    return <div className="h-dvh overflow-y-auto bg-bg text-fg">{children}</div>;
  }

  return (
    <div className="flex h-dvh flex-col bg-bg text-fg">
      <InstallHint />
      <CloudSync />
      <Prefs />
      <StationEngine />
      <AudioEngine />
      <div className="flex min-h-0 flex-1 gap-2 p-0 md:p-2 md:pb-0">
        <aside className="hidden w-72 shrink-0 flex-col gap-2 md:flex">
          <div className="rounded-lg bg-surface px-3 py-2">
            <Link to="/" className="mb-2 flex items-center gap-2.5 px-2 py-2">
              <FlowMark className="size-8" />
              <span className="font-heading text-lg font-semibold tracking-tight">Flow</span>
            </Link>
            <nav className="flex flex-col">
              {NAV.slice(0, 2).map((item) => {
                const active = item.to === "/" ? pathname === "/" : pathname.startsWith(item.to);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    className={cn(
                      "nav-link flex h-11 items-center gap-4 rounded-md px-3 text-base font-bold",
                      active ? "is-active text-fg" : "text-muted hover:text-fg",
                    )}
                  >
                    <Icon className="size-6" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>
          <LibraryRail />
        </aside>

        <div className="flex min-h-0 min-w-0 flex-1 flex-col">
          <header className="flex items-center gap-3 px-4 py-3 md:hidden pt-[max(0.75rem,env(safe-area-inset-top))]">
            <Link to="/" className="flex items-center gap-2">
              <FlowMark className="size-8" />
              <span className="font-heading text-base font-semibold">Flow</span>
            </Link>
            <div className="ml-auto flex items-center gap-2">
              <ChatToggle />
              <AuthChip />
              <Link to="/settings" className="rounded-full p-2 text-muted" aria-label="Impostazioni">
                <Settings className="size-5" />
              </Link>
              <Link to="/charts" className="rounded-full px-3 py-2 text-xs font-medium text-muted">
                Chart
              </Link>
              <Link to="/explore" className="rounded-full px-3 py-2 text-xs font-medium text-muted">
                Esplora
              </Link>
            </div>
          </header>
          <div className="hidden items-center gap-2 px-6 py-3 md:flex">
            <Link to="/charts" className="nav-link flex items-center gap-2 text-sm font-medium text-muted hover:text-fg">
              <Trophy className="size-4" />
              Classifiche
            </Link>
            <Link to="/explore" className="nav-link flex items-center gap-2 text-sm font-medium text-muted hover:text-fg">
              <Compass className="size-4" />
              Esplora
            </Link>
            <Link to="/discover" className="nav-link flex items-center gap-2 text-sm font-medium text-muted hover:text-fg">
              Scopri
            </Link>
            <Link to="/fresh" className="nav-link flex items-center gap-2 text-sm font-medium text-muted hover:text-fg">
              Novità
            </Link>
            <Link to="/mix" className="nav-link flex items-center gap-2 text-sm font-medium text-muted hover:text-fg">
              Mix
            </Link>
            <Link to="/radio" className="nav-link flex items-center gap-2 text-sm font-medium text-muted hover:text-fg">
              Radio
            </Link>
            <Link to="/settings" className="nav-link ml-auto flex items-center gap-2 text-sm font-medium text-muted hover:text-fg">
              <Settings className="size-4" />
              Impostazioni
            </Link>
            <ChatToggle />
            <div className="pl-2">
              <AuthChip />
            </div>
          </div>
          <main
            className={cn(
              "spot-main scrollbar-none min-h-0 flex-1 overflow-y-auto overscroll-y-contain px-4 pb-4 sm:px-6 md:rounded-lg md:px-6 md:pt-4",
            )}
          >
            {children}
          </main>
        </div>
        {showChat ? (
          <aside className="fixed inset-0 z-[45] overflow-hidden bg-surface md:static md:z-auto md:w-80 md:shrink-0 md:rounded-lg">
            <ChatPanel />
          </aside>
        ) : null}
      </div>

      <div className="relative z-40 shrink-0">
        <MiniPlayer />
        <ChatFab />
        <nav className="flex border-t border-border bg-bg pt-1 pb-[max(0.35rem,env(safe-area-inset-bottom))] md:hidden">
          {NAV.map((item) => {
            const active = item.to === "/" ? pathname === "/" : pathname.startsWith(item.to);
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "nav-link flex min-h-14 flex-1 flex-col items-center justify-center gap-0.5 text-[11px] font-medium",
                  active ? "is-active text-fg" : "text-muted",
                )}
              >
                <Icon className="size-6" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>

      <FullPlayer />
      <ActionSheet />
      <ToastHost />
      <HelpOverlay />
      <OnboardingModal />
    </div>
  );
}
