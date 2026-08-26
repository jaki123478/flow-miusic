import { useEffect, useState } from "react";
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
