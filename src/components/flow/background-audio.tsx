import { useEffect, useState } from "react";
import { isAndroid, isAppleMobile } from "@/lib/music/lock-screen";
import { useFlowStore } from "@/stores/flow-store";

function openHref(href: string) {
  const a = document.createElement("a");
  a.href = href;
  a.rel = "noopener";
  a.style.display = "none";
  document.body.appendChild(a);
  a.click();
  a.remove();
}

function openChromeBattery() {
  openHref(
    "intent://com.android.chrome/#Intent;scheme=package;action=android.settings.APPLICATION_DETAILS_SETTINGS;end",
  );
}

function openBatteryList() {
  openHref("intent:#Intent;action=android.settings.IGNORE_BATTERY_OPTIMIZATION_SETTINGS;end");
}

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
    if (android) {
      notify("In Batteria scegli Nessuna limitazione, poi torna a Flow");
      window.setTimeout(() => openChromeBattery(), 250);
    } else {
      notify("Notifiche attivate");
    }
  };

  return (
    <section className="space-y-3 rounded-lg bg-surface px-4 py-4">
      <p className="text-sm font-medium">Permessi batteria Chrome</p>
      <p className="text-xs text-muted">
        Android non lascia cambiare la batteria dal sito. Apri le impostazioni e metti Chrome (e Flow) su
        nessuna limitazione, altrimenti a schermo spento taglia l’audio.
      </p>
      {android ? (
        <>
          <ol className="list-decimal space-y-1.5 pl-4 text-sm text-muted">
            <li>Tocca Info Chrome → Batteria → Nessuna limitazione.</li>
            <li>Poi App non ottimizzate → Chrome e Flow → Non ottimizzare.</li>
            <li>
              {standalone
                ? "Flow è già sulla Home."
                : "Chrome ⋮ → Installa app, riapri Flow dall’icona."}
            </li>
            <li>Non chiudere Flow dallo switcher. Lo schermo può spegnersi.</li>
          </ol>
          <div className="flex flex-wrap gap-2 pt-1">
            <button
              type="button"
              onClick={() => void activate()}
              className="h-10 rounded-full bg-primary px-4 text-sm font-bold text-primary-fg"
            >
              Apri batteria Chrome
            </button>
            <button
              type="button"
              onClick={openBatteryList}
              className="h-10 rounded-full bg-elevated px-4 text-sm font-medium"
            >
              App non ottimizzate
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
        </>
      ) : apple ? (
        <p className="text-sm text-muted">Su iPhone: Condividi → Aggiungi a Home. Non c’è un permesso batteria come su Android.</p>
      ) : (
        <p className="text-sm text-muted">Questi permessi servono su telefono Android con Chrome.</p>
      )}
      <p className="text-xs text-subtle">
        Notifiche: {sound === "granted" ? "ok" : sound === "denied" ? "bloccate in Chrome" : "non ancora"}
        {standalone ? " · App installata" : android ? " · Ancora in Chrome" : ""}
      </p>
    </section>
  );
}
