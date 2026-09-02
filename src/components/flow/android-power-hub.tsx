import { useState } from "react";
import {
  Smartphone,
  Layers,
  Volume2,
  Waves,
  Hand,
  Vibrate,
  Download,
  Car,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  isAndroidNative,
  setNativeBassBoost,
  setNativeVirtualizer,
  setNativeShakeToSkip,
  setNativeAirGestures,
  setNativeFloatingLyrics,
} from "@/lib/music/android-bridge";

export function AndroidPowerHubModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const isNative = isAndroidNative();

  const [bassBoost, setBassBoostState] = useState(true);
  const [bassStrength, setBassStrength] = useState(80);
  const [virtualizer, setVirtualizerState] = useState(true);
  const [virtualizerStrength, setVirtualizerStrength] = useState(70);
  const [shakeToSkip, setShakeState] = useState(true);
  const [airGestures, setAirState] = useState(true);
  const [floatingLyrics, setFloatingState] = useState(false);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md max-h-[90vh] overflow-y-auto rounded-3xl bg-[#12151E] p-6 text-fg shadow-2xl ring-1 ring-white/10"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex size-9 items-center justify-center rounded-2xl bg-primary/20 text-primary">
              <Smartphone className="size-5" />
            </div>
            <div>
              <h2 className="font-heading text-base font-bold text-fg">Android Power Hub</h2>
              <p className="text-xs text-muted">Funzionalità native hardware di sistema</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-muted hover:bg-surface hover:text-fg transition-colors"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Content */}
        <div className="mt-5 space-y-4 text-xs">
          {/* Status Badge */}
          <div className="flex items-center justify-between rounded-2xl bg-surface/70 p-3 ring-1 ring-white/5">
            <span className="font-medium text-muted">Ambiente di Esecuzione</span>
            <span
              className={cn(
                "rounded-full px-2.5 py-1 text-[11px] font-bold",
                isNative ? "bg-emerald-500/20 text-emerald-400" : "bg-primary/20 text-primary",
              )}
            >
              {isNative ? "🤖 App Nativa Android (APK)" : "🌐 Web App (PWA)"}
            </span>
          </div>

          {/* Download APK Banner if on web */}
          {!isNative && (
            <div className="rounded-2xl border border-primary/30 bg-primary/10 p-4">
              <div className="flex items-center gap-2 text-primary font-bold text-sm mb-1.5">
                <Download className="size-4" />
                Scarica APK Android Ufficiale
              </div>
              <p className="text-[11px] text-muted mb-3 leading-relaxed">
                Installa il pacchetto nativo per sbloccare la notifica MediaStyle di sistema, il Widget della schermata home, i testi flottanti e il DSP hardware.
              </p>
              <a
                href="/Flow-Music.apk"
                download="Flow-Music.apk"
                className="inline-flex items-center justify-center gap-2 w-full rounded-xl bg-primary py-2.5 text-center font-bold text-primary-fg shadow-lg shadow-primary/20 active:scale-95 transition-transform"
              >
                <Download className="size-4" />
                Scarica Flow-Music.apk (v1.0)
              </a>
            </div>
          )}

          {/* Hardware DSP Bass Boost */}
          <div className="rounded-2xl bg-surface/60 p-4 ring-1 ring-white/5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Volume2 className="size-4 text-primary" />
                <span className="font-bold text-sm text-fg">Hardware Bass Boost</span>
              </div>
              <input
                type="checkbox"
                checked={bassBoost}
                onChange={(e) => {
                  setBassBoostState(e.target.checked);
                  setNativeBassBoost(e.target.checked, bassStrength);
                }}
                className="toggle-checkbox size-4 accent-primary cursor-pointer"
              />
            </div>
            {bassBoost && (
              <div>
                <div className="flex justify-between text-[11px] text-muted mb-1">
                  <span>Potenza Bassi</span>
                  <span className="font-bold text-primary">{bassStrength}%</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={bassStrength}
                  onChange={(e) => {
                    const v = Number(e.target.value);
                    setBassStrength(v);
                    setNativeBassBoost(bassBoost, v);
                  }}
                  className="w-full accent-primary h-1.5 bg-elevated rounded-lg cursor-pointer"
                />
              </div>
            )}
          </div>

          {/* 3D Spatial Virtualizer */}
          <div className="rounded-2xl bg-surface/60 p-4 ring-1 ring-white/5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Waves className="size-4 text-sky-400" />
                <span className="font-bold text-sm text-fg">Audio 3D Spaziale (Surround)</span>
              </div>
              <input
                type="checkbox"
                checked={virtualizer}
                onChange={(e) => {
                  setVirtualizerState(e.target.checked);
                  setNativeVirtualizer(e.target.checked, virtualizerStrength);
                }}
                className="toggle-checkbox size-4 accent-sky-400 cursor-pointer"
              />
            </div>
            {virtualizer && (
              <div>
                <div className="flex justify-between text-[11px] text-muted mb-1">
                  <span>Ampiezza Palcoscenico</span>
                  <span className="font-bold text-sky-400">{virtualizerStrength}%</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={virtualizerStrength}
                  onChange={(e) => {
                    const v = Number(e.target.value);
                    setVirtualizerStrength(v);
                    setNativeVirtualizer(virtualizer, v);
                  }}
                  className="w-full accent-sky-400 h-1.5 bg-elevated rounded-lg cursor-pointer"
                />
              </div>
            )}
          </div>

          {/* Shake to Skip */}
          <div className="flex items-center justify-between rounded-2xl bg-surface/60 p-4 ring-1 ring-white/5">
            <div className="flex items-center gap-2.5">
              <Vibrate className="size-4 text-amber-400" />
              <div>
                <div className="font-bold text-sm text-fg">Shake to Skip</div>
                <div className="text-[11px] text-muted">Scuoti il telefono per cambiare brano</div>
              </div>
            </div>
            <input
              type="checkbox"
              checked={shakeToSkip}
              onChange={(e) => {
                setShakeState(e.target.checked);
                setNativeShakeToSkip(e.target.checked);
              }}
              className="toggle-checkbox size-4 accent-amber-400 cursor-pointer"
            />
          </div>

          {/* Air Gestures */}
          <div className="flex items-center justify-between rounded-2xl bg-surface/60 p-4 ring-1 ring-white/5">
            <div className="flex items-center gap-2.5">
              <Hand className="size-4 text-purple-400" />
              <div>
                <div className="font-bold text-sm text-fg">Gesti a Mezz'aria (Air Wave)</div>
                <div className="text-[11px] text-muted">Passa la mano sul sensore per Play/Pausa</div>
              </div>
            </div>
            <input
              type="checkbox"
              checked={airGestures}
              onChange={(e) => {
                setAirState(e.target.checked);
                setNativeAirGestures(e.target.checked);
              }}
              className="toggle-checkbox size-4 accent-purple-400 cursor-pointer"
            />
          </div>

          {/* Floating Lyrics Overlay */}
          <div className="flex items-center justify-between rounded-2xl bg-surface/60 p-4 ring-1 ring-white/5">
            <div className="flex items-center gap-2.5">
              <Layers className="size-4 text-rose-400" />
              <div>
                <div className="font-bold text-sm text-fg">Testi Flottanti (Overlay)</div>
                <div className="text-[11px] text-muted">Testo sincronizzato sopra tutte le app</div>
              </div>
            </div>
            <input
              type="checkbox"
              checked={floatingLyrics}
              onChange={(e) => {
                setFloatingState(e.target.checked);
                setNativeFloatingLyrics(e.target.checked);
              }}
              className="toggle-checkbox size-4 accent-rose-400 cursor-pointer"
            />
          </div>

          {/* Android Auto & Widgets Info */}
          <div className="rounded-2xl bg-surface/40 p-4 space-y-2 text-[11px] text-muted">
            <div className="flex items-center gap-2 font-bold text-fg">
              <Car className="size-4 text-emerald-400" />
              Widget Home Screen & Android Auto
            </div>
            <p>
              • Aggiungi il <strong>Widget Flow Music</strong> dalla schermata principale del tuo launcher Android per controllare le tracce al volo.
            </p>
            <p>
              • Compatibile con <strong>Android Auto</strong> e comandi Bluetooth dell'auto / auricolari.
            </p>
          </div>
        </div>

        {/* Footer Button */}
        <button
          type="button"
          onClick={onClose}
          className="mt-6 w-full rounded-2xl bg-surface py-3 text-center text-xs font-bold text-fg hover:bg-elevated transition-colors"
        >
          Chiudi Impostazioni
        </button>
      </div>
    </div>
  );
}
