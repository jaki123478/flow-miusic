import { useState } from "react";
import { Sparkles, Music2, ArrowRight, User, Check, Play } from "lucide-react";
import { useFlowStore } from "@/stores/flow-store";
import { Link } from "@tanstack/react-router";

export function OnboardingModal() {
  const hasSeen = useFlowStore((s) => s.hasSeenOnboarding);
  const profileName = useFlowStore((s) => s.profileName);
  const setProfileName = useFlowStore((s) => s.setProfileName);
  const dismissOnboarding = useFlowStore((s) => s.dismissOnboarding);

  const [nameInput, setNameInput] = useState(profileName || "Flow User");
  const [selectedPreset, setSelectedPreset] = useState<string>("all");

  if (hasSeen) return null;

  const handleStart = () => {
    const final = nameInput.trim() || "Flow User";
    setProfileName(final);
    dismissOnboarding();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-md animate-in fade-in duration-300">
      <div className="relative w-full max-w-md overflow-hidden rounded-3xl bg-[#14171E] p-6 text-fg shadow-2xl ring-1 ring-white/10 sm:p-8">
        {/* Glow decoration */}
        <div className="pointer-events-none absolute -right-16 -top-16 size-48 rounded-full bg-primary/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-16 -left-16 size-48 rounded-full bg-emerald-500/15 blur-3xl" />

        <div className="relative z-10 flex flex-col items-center text-center">
          {/* Brand Icon */}
          <div className="flex size-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-primary to-emerald-400 text-bg shadow-lg shadow-primary/25">
            <Music2 className="size-8" />
          </div>

          <h2 className="mt-4 font-heading text-2xl font-extrabold tracking-tight sm:text-3xl">
            Benvenuto su Flow
          </h2>
          <p className="mt-2 text-sm text-muted">
            Streaming audio ad alta fedeltà, testi karaoke sincronizzati, equalizer e importazione playlist da Spotify e YouTube.
          </p>

          {/* Profile Name */}
          <div className="mt-6 w-full space-y-1.5 text-left">
            <label className="text-xs font-semibold text-muted flex items-center gap-1.5">
              <User className="size-3.5 text-primary" />
              Il tuo Nome Profilo
            </label>
            <input
              type="text"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              placeholder="Es. Flow User, Marco..."
              className="h-12 w-full rounded-xl bg-surface px-4 text-sm font-medium outline-none ring-1 ring-border focus:ring-2 focus:ring-primary placeholder:text-subtle transition-all"
            />
          </div>

          {/* Quick Features overview */}
          <div className="mt-5 grid w-full grid-cols-2 gap-2 text-left text-xs">
            <div className="rounded-xl bg-surface/80 p-3 ring-1 ring-border/50">
              <span className="font-semibold text-fg">🎧 Background Audio</span>
              <p className="mt-0.5 text-[11px] text-muted">Ascolta a schermo spento senza interruzioni.</p>
            </div>
            <div className="rounded-xl bg-surface/80 p-3 ring-1 ring-border/50">
              <span className="font-semibold text-fg">📥 Import Spotify</span>
              <p className="mt-0.5 text-[11px] text-muted">Incolla link per salvare tutte le tue playlist.</p>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="mt-6 flex w-full flex-col gap-2.5">
            <button
              type="button"
              onClick={handleStart}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary text-sm font-bold text-primary-fg hover:opacity-95 active:scale-[0.99] transition-all shadow-lg shadow-primary/20"
            >
              <Play className="size-4 fill-current" />
              Inizia ad Ascoltare
            </button>

            <Link
              to="/login"
              onClick={() => dismissOnboarding()}
              className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-surface text-xs font-semibold text-fg hover:bg-elevated ring-1 ring-border transition-colors"
            >
              Oppure accedi con un account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}