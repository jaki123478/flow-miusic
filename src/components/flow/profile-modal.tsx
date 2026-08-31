import { useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  User,
  Heart,
  Music2,
  Clock,
  Settings,
  Sparkles,
  Download,
  Upload,
  Sliders,
  Moon,
  Sun,
  Palette,
  X,
  Edit2,
  Check,
  LogOut,
  LogIn,
  Share2
} from "lucide-react";
import { useFlowStore } from "@/stores/flow-store";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { signOut } from "@/lib/auth/client";
import { downloadText, tracksToCsv, tracksToM3u } from "@/lib/music/library-io";

export function ProfileModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { user } = useCurrentUserState();
  const profileName = useFlowStore((s) => s.profileName);
  const setProfileName = useFlowStore((s) => s.setProfileName);
  const liked = useFlowStore((s) => s.liked);
  const playlists = useFlowStore((s) => s.playlists);
  const recents = useFlowStore((s) => s.recents);
  const listenMs = useFlowStore((s) => s.listenMs);
  const settings = useFlowStore((s) => s.settings);
  const patchSettings = useFlowStore((s) => s.patchSettings);
  const notify = useFlowStore((s) => s.notify);

  const [isEditingName, setIsEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(profileName || "Flow User");
  const [signingOut, setSigningOut] = useState(false);

  if (!isOpen) return null;

  const displayName = user?.displayName || profileName || "Flow User";
  const listenHours = (listenMs / 3600000).toFixed(1);

  const handleSaveName = () => {
    const clean = nameInput.trim();
    if (clean) {
      setProfileName(clean);
      notify("Nome profilo salvato!");
    }
    setIsEditingName(false);
  };

  const handleExportM3u = () => {
    if (!liked.length) {
      notify("Nessun brano preferito da esportare");
      return;
    }
    downloadText("flow-preferiti.m3u8", tracksToM3u(liked, "Brani che ti piacciono"));
    notify("Playlist M3U esportata con successo!");
  };

  const handleExportCsv = () => {
    if (!liked.length) {
      notify("Nessun brano preferito da esportare");
      return;
    }
    downloadText("flow-preferiti.csv", tracksToCsv(liked));
    notify("Playlist CSV esportata con successo!");
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl bg-[#14171E] p-6 text-fg shadow-2xl ring-1 ring-white/10 scrollbar-none sm:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 flex size-10 items-center justify-center rounded-full text-muted hover:bg-white/10 hover:text-fg transition-colors"
          aria-label="Chiudi"
        >
          <X className="size-5" />
        </button>

        {/* Profile Header Hero */}
        <div className="flex items-center gap-4">
          <div className="flex size-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-primary to-emerald-400 text-bg text-2xl font-black shadow-lg shadow-primary/20">
            {user?.profileImageUrl ? (
              <img src={user.profileImageUrl} alt="" className="size-full rounded-2xl object-cover" />
            ) : (
              displayName.charAt(0).toUpperCase()
            )}
          </div>

          <div className="min-w-0 flex-1">
            {isEditingName ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  className="h-9 min-w-0 flex-1 rounded-lg bg-surface px-3 text-sm font-semibold outline-none ring-1 ring-primary"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={handleSaveName}
                  className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-fg"
                >
                  <Check className="size-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <h2 className="truncate font-heading text-xl font-bold text-fg sm:text-2xl">{displayName}</h2>
                <button
                  type="button"
                  onClick={() => {
                    setNameInput(displayName);
                    setIsEditingName(true);
                  }}
                  className="text-muted hover:text-primary transition-colors"
                  title="Modifica nome"
                >
                  <Edit2 className="size-4" />
                </button>
              </div>
            )}

            <div className="mt-1 flex items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-md bg-primary/15 px-2 py-0.5 text-[11px] font-semibold text-primary">
                {user ? "🟢 Cloud Sincronizzato" : "✨ Profilo Flow Locale"}
              </span>
              {user?.primaryEmail && (
                <span className="truncate text-xs text-muted">{user.primaryEmail}</span>
              )}
            </div>
          </div>
        </div>

        {/* Live Statistics Row */}
        <div className="mt-6 grid grid-cols-3 gap-2.5">
          <Link
            to="/library"
            onClick={onClose}
            className="flex flex-col items-center justify-center rounded-2xl bg-surface/80 p-3 ring-1 ring-border/50 hover:bg-elevated transition-colors text-center"
          >
            <Heart className="size-5 text-rose-400" />
            <span className="mt-1 font-heading text-lg font-bold text-fg">{liked.length}</span>
            <span className="text-[11px] text-muted">Preferiti</span>
          </Link>

          <Link
            to="/library"
            onClick={onClose}
            className="flex flex-col items-center justify-center rounded-2xl bg-surface/80 p-3 ring-1 ring-border/50 hover:bg-elevated transition-colors text-center"
          >
            <Music2 className="size-5 text-primary" />
            <span className="mt-1 font-heading text-lg font-bold text-fg">{playlists.length}</span>
            <span className="text-[11px] text-muted">Playlist</span>
          </Link>

          <Link
            to="/stats"
            onClick={onClose}
            className="flex flex-col items-center justify-center rounded-2xl bg-surface/80 p-3 ring-1 ring-border/50 hover:bg-elevated transition-colors text-center"
          >
            <Clock className="size-5 text-emerald-400" />
            <span className="mt-1 font-heading text-lg font-bold text-fg">{listenHours}h</span>
            <span className="text-[11px] text-muted">Ascolto</span>
          </Link>
        </div>

        {/* Tools & Features Section */}
        <div className="mt-6 space-y-2">
          <p className="text-xs font-bold uppercase tracking-wider text-muted">Strumenti Rapidi</p>

          <Link
            to="/library"
            onClick={onClose}
            className="flex items-center justify-between rounded-xl bg-surface p-3 ring-1 ring-border/50 hover:bg-elevated transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Upload className="size-4" />
              </div>
              <div>
                <p className="text-sm font-semibold text-fg">Importa Playlist</p>
                <p className="text-xs text-muted">Incolla link da Spotify, YouTube o file M3U</p>
              </div>
            </div>
            <span className="text-xs font-bold text-primary">Apri</span>
          </Link>

          <Link
            to="/settings"
            onClick={onClose}
            className="flex items-center justify-between rounded-xl bg-surface p-3 ring-1 ring-border/50 hover:bg-elevated transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="flex size-9 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400">
                <Sliders className="size-4" />
              </div>
              <div>
                <p className="text-sm font-semibold text-fg">Equalizzatore & Audio Hi-Fi</p>
                <p className="text-xs text-muted">Preset Bass Boost, Vocal, Rock, Pop</p>
              </div>
            </div>
            <span className="text-xs font-bold text-primary">Regola</span>
          </Link>

          <div className="flex items-center justify-between rounded-xl bg-surface p-3 ring-1 ring-border/50">
            <div className="flex items-center gap-3">
              <div className="flex size-9 items-center justify-center rounded-lg bg-purple-500/10 text-purple-400">
                <Download className="size-4" />
              </div>
              <div>
                <p className="text-sm font-semibold text-fg">Esporta Preferiti</p>
                <p className="text-xs text-muted">Salva la tua libreria in formato M3U o CSV</p>
              </div>
            </div>
            <div className="flex gap-1.5">
              <button
                type="button"
                onClick={handleExportM3u}
                className="rounded-lg bg-elevated px-2.5 py-1 text-xs font-bold text-fg hover:bg-white/10"
              >
                M3U
              </button>
              <button
                type="button"
                onClick={handleExportCsv}
                className="rounded-lg bg-elevated px-2.5 py-1 text-xs font-bold text-fg hover:bg-white/10"
              >
                CSV
              </button>
            </div>
          </div>
        </div>

        {/* Theme Selector */}
        <div className="mt-6 space-y-2">
          <p className="text-xs font-bold uppercase tracking-wider text-muted">Aspetto & Tema</p>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: "dark", label: "Dark", icon: Moon },
              { id: "oled", label: "AMOLED Black", icon: Sparkles },
              { id: "light", label: "Light", icon: Sun },
            ].map((t) => {
              const active = settings.theme === t.id;
              const Icon = t.icon;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => patchSettings({ theme: t.id as "dark" | "light" | "oled" })}
                  className={`flex items-center justify-center gap-2 rounded-xl p-2.5 text-xs font-bold transition-all ${
                    active ? "bg-primary text-primary-fg shadow-md shadow-primary/20" : "bg-surface text-muted hover:text-fg ring-1 ring-border/50"
                  }`}
                >
                  <Icon className="size-3.5" />
                  {t.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Account / Session CTA */}
        <div className="mt-8 border-t border-white/10 pt-4">
          {user ? (
            <button
              type="button"
              disabled={signingOut}
              onClick={() => {
                setSigningOut(true);
                void signOut().finally(() => {
                  setSigningOut(false);
                  onClose();
                });
              }}
              className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-rose-500/10 text-xs font-bold text-rose-400 hover:bg-rose-500/20 transition-colors"
            >
              <LogOut className="size-4" />
              {signingOut ? "Disconnessione..." : "Disconnetti Account"}
            </button>
          ) : (
            <Link
              to="/login"
              onClick={onClose}
              className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary text-xs font-bold text-primary-fg hover:opacity-95 transition-opacity shadow-lg shadow-primary/15"
            >
              <LogIn className="size-4" />
              Accedi o Registrati con Account Cloud
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}