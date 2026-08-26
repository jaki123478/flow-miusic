import { useEffect, type ReactNode } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { Heart, House, Radio, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { useFlowStore } from "@/stores/flow-store";
import { AudioEngine, FullPlayer, MiniPlayer } from "./player";

const NAV = [
  { to: "/", label: "Home", icon: House },
  { to: "/search", label: "Cerca", icon: Search },
  { to: "/radio", label: "Radio", icon: Radio },
  { to: "/library", label: "Libreria", icon: Heart },
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

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const hasTrack = useFlowStore((s) => Boolean(s.current));
  const hydrate = useFlowStore((s) => s.hydrate);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  return (
    <div className="min-h-dvh bg-bg text-fg">
      <AudioEngine />
      <aside className="fixed top-0 bottom-0 left-0 z-30 hidden w-56 flex-col border-r border-border bg-bg pt-6 md:flex">
        <Link to="/" className="mb-8 flex items-center gap-2.5 px-5">
          <FlowMark className="size-8" />
          <span className="text-lg font-semibold tracking-tight">Flow</span>
        </Link>
        <nav className="flex flex-col gap-1 px-3">
          {NAV.map((item) => {
            const active = item.to === "/" ? pathname === "/" : pathname.startsWith(item.to);
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "flex h-11 items-center gap-3 rounded-lg px-3 text-sm font-medium transition-colors duration-150",
                  active ? "bg-elevated text-fg" : "text-muted hover:bg-surface hover:text-fg",
                )}
              >
                <Icon className="size-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="mt-8 px-5">
          <p className="text-[11px] font-medium tracking-wide text-subtle uppercase">Scopri</p>
          <Link to="/explore" className="mt-2 block py-2 text-sm text-muted hover:text-fg">
            Generi & mood
          </Link>
          <Link to="/charts" className="block py-2 text-sm text-muted hover:text-fg">
            Classifiche
          </Link>
          <Link to="/mix" className="block py-2 text-sm text-muted hover:text-fg">
            Mix intelligente
          </Link>
        </div>
      </aside>

      <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-border bg-bg/90 px-4 py-3 backdrop-blur-md md:hidden pt-[max(0.75rem,env(safe-area-inset-top))]">
        <Link to="/" className="flex items-center gap-2">
          <FlowMark className="size-8" />
          <span className="text-base font-semibold">Flow</span>
        </Link>
        <div className="ml-auto flex items-center gap-1">
          <Link
            to="/charts"
            className="rounded-full px-3 py-2 text-xs font-medium text-muted"
          >
            Chart
          </Link>
          <Link to="/explore" className="rounded-full px-3 py-2 text-xs font-medium text-muted">
            Esplora
          </Link>
        </div>
      </header>

      <main
        className={cn(
          "mx-auto w-full max-w-5xl px-4 pt-4 sm:px-6 md:ml-56 md:pt-8",
          hasTrack ? "pb-40 md:pb-28" : "pb-28 md:pb-16",
        )}
      >
        {children}
      </main>

      <div className="pointer-events-none fixed right-0 bottom-0 left-0 z-40 md:left-56">
        <MiniPlayer />
        <nav className="pointer-events-auto flex border-t border-border bg-bg/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md md:hidden">
          {NAV.map((item) => {
            const active = item.to === "/" ? pathname === "/" : pathname.startsWith(item.to);
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "flex min-h-14 flex-1 flex-col items-center justify-center gap-0.5 text-[11px] font-medium",
                  active ? "text-primary" : "text-muted",
                )}
              >
                <Icon className="size-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>

      <FullPlayer />
    </div>
  );
}
