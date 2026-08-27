import { useEffect, useState } from "react";
import { androidBackgroundTips, detectOem, oemBatteryIntents } from "@/lib/music/android-bg";
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

export function ChromeBackgroundCard() {
  const notify = useFlowStore((s) => s.notify);
  const [standalone, setStandalone] = useState(false);
  const [sound, setSound] = useState<"unknown" | "granted" | "denied">("unknown");
  const [install, setInstall] = useState<{ prompt: () => Promise<unknown> } | null>(null);
  const android = isAndroid();
  const apple = isAppleMobile();
  const oem = android ? detectOem() : "other";
  const oemLabel =
    oem === "samsung"
      ? "Samsung"
      : oem === "motorola"
        ? "Motorola"
        : oem === "pixel"
          ? "Pixel"
          : oem === "xiaomi"
            ? "Xiaomi"
            : oem === "huawei"
              ? "Huawei"
              : oem === "oppo"
                ? "Oppo / OnePlus"
                : "Android";

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
      notify(`Apri Batteria e metti Nessuna limitazione (${oemLabel})`);
      const first = oemBatteryIntents()[0];
      if (first) window.setTimeout(() => openHref(first.href), 200);
    } else {
      notify("Notifiche attivate");
    }
  };

  return (
    <section className="space-y-3 rounded-lg bg-surface px-4 py-4">
      <p className="text-sm font-medium">Audio a schermo spento · {android ? oemLabel : apple ? "iPhone" : "Desktop"}</p>
      <p className="text-xs text-muted">
        Flow suona da una copia locale del brano. Samsung, Motorola e Pixel fermano Chrome se la batteria è ottimizzata.
      </p>
      {android ? (
        <>
          <ol className="list-decimal space-y-1.5 pl-4 text-sm text-muted">
            {androidBackgroundTips().map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ol>
          <div className="flex flex-wrap gap-2 pt-1">
            <button type="button" onClick={() => void activate()} className="h-10 rounded-full bg-primary px-4 text-sm font-bold text-primary-fg">
              Apri batteria
            </button>
            {oemBatteryIntents().map((item) => (
              <button key={item.label} type="button" onClick={() => openHref(item.href)} className="h-10 rounded-full bg-elevated px-4 text-sm font-medium">
                {item.label}
              </button>
            ))}
            {install && !standalone ? (
              <button type="button" onClick={() => void install.prompt()} className="h-10 rounded-full bg-elevated px-4 text-sm font-medium">
                Installa app
              </button>
            ) : null}
          </div>
        </>
      ) : apple ? (
        <p className="text-sm text-muted">Su iPhone: Condividi → Aggiungi a Home. Poi avvia Flow dalla icona, non da Safari.</p>
      ) : (
        <p className="text-sm text-muted">Queste voci servono sui telefoni Android.</p>
      )}
      <p className="text-xs text-subtle">
        Notifiche: {sound === "granted" ? "ok" : sound === "denied" ? "bloccate" : "non ancora"}
        {standalone ? " · App installata" : android ? " · Ancora nel browser" : ""}
      </p>
    </section>
  );
}
