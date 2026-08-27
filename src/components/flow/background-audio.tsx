import { useEffect, useState } from "react";
import { isAndroid, isAppleMobile } from "@/lib/music/lock-screen";
import { useFlowStore } from "@/stores/flow-store";

export function ChromeBackgroundCard() {
  const notify = useFlowStore((s) => s.notify);
  const [standalone, setStandalone] = useState(false);
  const [sound, setSound] = useState<"unknown" | "granted" | "denied">("unknown");
  const [install, setInstall] = useState<{ prompt: () => Promise<unknown> } | null>(null);
  const android = isAndroid();
  const apple = isAppleMobile();

  useEffect(() => {
    setStandalone(
      window.matchMedia("(display-mode: standalone)").matches ||
        Boolean((navigator as Navigator & { standalone?: boolean }).standalone),
    );
    const onPrompt = (e: Event) => {
      e.preventDefault();
      setInstall(e as unknown as { prompt: () => Promise<unknown> });
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    void navigator.permissions
      ?.query({ name: "notifications" as PermissionName })
      .then((p) => {
        setSound(p.state === "denied" ? "denied" : p.state === "granted" ? "granted" : "unknown");
        p.onchange = () =>
          setSound(p.state === "granted" ? "granted" : p.state === "denied" ? "denied" : "unknown");
      })
      .catch(() => {});
    return () => window.removeEventListener("beforeinstallprompt", onPrompt);
  }, []);

  const activate = async () => {
    try {
      if ("Notification" in window && Notification.permission !== "granted") {
        const perm = await Notification.requestPermission();
        setSound(perm === "granted" ? "granted" : perm === "denied" ? "denied" : "unknown");
      } else {
        setSound("granted");
      }
    } catch {
      /* ignore */
    }
    notify("Consenti le altre voci in Impostazioni Android se Chrome ferma ancora l’audio");
  };

  const steps = android
    ? [
        "Tocca Attiva: consenti le notifiche (comandi a schermo spento).",
        standalone
          ? "Flow è già installato come app."
          : "Chrome ⋮ → Installa app / Aggiungi a schermata Home, poi apri Flow da lì.",
        "Android → App → Chrome (e Flow) → Batteria → Nessuna limitazione.",
        "Android → App → Chrome → Notifiche → attive.",
        "Chrome ⋮ → Impostazioni → Impostazioni sito → Suono → Consenti.",
        "Spegni lo schermo pure. Non chiudere Flow dallo switcher.",
      ]
    : apple
      ? [
          "Condividi → Aggiungi a Home, apri Flow dall’icona.",
          "Lo schermo può spegnersi. Non chiudere Flow dallo switcher.",
        ]
      : ["Tieni la scheda aperta: Chrome deve restare in esecuzione."];

  return (
    <section className="space-y-3 rounded-lg bg-surface px-4 py-4">
      <p className="text-sm font-medium">Audio in background (Chrome)</p>
      <p className="text-xs text-muted">
        Chrome su Android ferma la musica se la scheda è ottimizzata. Configura questi punti.
      </p>
      <ol className="list-decimal space-y-1.5 pl-4 text-sm text-muted">
        {steps.map((s) => (
          <li key={s}>{s}</li>
        ))}
      </ol>
      <div className="flex flex-wrap gap-2 pt-1">
        <button
          type="button"
          onClick={() => void activate()}
          className="h-10 rounded-full bg-primary px-4 text-sm font-bold text-primary-fg"
        >
          Attiva audio in background
        </button>
        {install && !standalone ? (
          <button
            type="button"
            onClick={() => void install.prompt()}
            className="h-10 rounded-full bg-elevated px-4 text-sm font-medium"
          >
            Installa app
          </button>
        ) : null}
      </div>
      <p className="text-xs text-subtle">
        Notifiche: {sound === "granted" ? "ok" : sound === "denied" ? "bloccate in Chrome" : "non ancora"}
        {standalone ? " · App installata" : " · Ancora in Chrome"}
      </p>
    </section>
  );
}
