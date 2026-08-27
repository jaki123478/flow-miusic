import type { Track } from "./types";
import { isAndroid } from "./lock-screen";

let lastTag = "";
let primed = false;

export type AndroidOem = "samsung" | "motorola" | "pixel" | "xiaomi" | "huawei" | "oppo" | "other";

export function detectOem(): AndroidOem {
  if (typeof navigator === "undefined") return "other";
  const ua = navigator.userAgent;
  const brands = (navigator as Navigator & { userAgentData?: { brands?: { brand: string }[] } }).userAgentData;
  const blob = `${ua} ${(brands?.brands || []).map((b) => b.brand).join(" ")}`;
  if (/samsung|sm-|oneui|sec-/i.test(blob)) return "samsung";
  if (/moto|motorola/i.test(blob)) return "motorola";
  if (/pixel|google/i.test(blob)) return "pixel";
  if (/xiaomi|redmi|poco|miui|hyperos/i.test(blob)) return "xiaomi";
  if (/huawei|honor|emui|harmony/i.test(blob)) return "huawei";
  if (/oppo|oneplus|realme|coloros|oxygen/i.test(blob)) return "oppo";
  return "other";
}

function openHref(href: string) {
  const a = document.createElement("a");
  a.href = href;
  a.rel = "noopener";
  a.style.display = "none";
  document.body.appendChild(a);
  a.click();
  a.remove();
}

function alreadyAsked() {
  try {
    return localStorage.getItem("flow_bg_default") === "1";
  } catch {
    return true;
  }
}

function markAsked() {
  try {
    localStorage.setItem("flow_bg_default", "1");
  } catch {
    /* ignore */
  }
}

/** Parte da solo al primo play: notifiche + dialogo batteria Android. */
export function enableAndroidBackgroundDefaults() {
  if (!isAndroid() || primed) return;
  primed = true;
  if ("Notification" in window && Notification.permission === "default") {
    void Notification.requestPermission().catch(() => {});
  }
  if (alreadyAsked()) return;
  markAsked();
  window.setTimeout(() => {
    openHref(
      "intent://com.android.chrome/#Intent;scheme=package;action=android.settings.REQUEST_IGNORE_BATTERY_OPTIMIZATIONS;end",
    );
  }, 400);
}

export function showAndroidNowPlaying(track: Track) {
  enableAndroidBackgroundDefaults();
  if (!isAndroid() || typeof Notification === "undefined") return;
  if (Notification.permission !== "granted") return;
  try {
    lastTag = "flow-now";
    new Notification(track.title, {
      body: track.artist,
      tag: lastTag,
      silent: true,
      icon: "/icon-192.png",
      badge: "/icon-192.png",
    });
  } catch {
    /* ignore */
  }
}

export function clearAndroidNowPlaying() {
  lastTag = "";
}

export function androidBackgroundTips(): string[] {
  const oem = detectOem();
  const common = [
    "Installa Flow sulla Home e aprilo da lì, non dalla scheda del browser.",
    "Non chiudere Flow o Chrome dallo switcher delle app recenti.",
    "Lascia suonare 2–3 secondi, poi spegni lo schermo.",
  ];
  if (oem === "samsung") {
    return [
      ...common,
      "Samsung: Impostazioni → Batteria e device care → Batteria → Limiti in background → togli Chrome e Flow dal sonno.",
      "Samsung: App → Chrome → Batteria → Senza limiti. Disattiva “Metti in sospensione le app non utilizzate”.",
    ];
  }
  if (oem === "motorola") {
    return [
      ...common,
      "Motorola: Impostazioni → App → Chrome → Batteria → Non ottimizzata.",
    ];
  }
  if (oem === "pixel") {
    return [
      ...common,
      "Pixel: Impostazioni → App → Chrome → Batteria → Non ottimizzata.",
    ];
  }
  return [
    ...common,
    "Impostazioni → App → Chrome → Batteria → Nessuna limitazione.",
  ];
}

export function oemBatteryIntents(): { label: string; href: string }[] {
  const oem = detectOem();
  const items = [
    {
      label: "Scheda Chrome",
      href: "intent://com.android.chrome/#Intent;scheme=package;action=android.settings.APPLICATION_DETAILS_SETTINGS;end",
    },
    {
      label: "App non ottimizzate",
      href: "intent:#Intent;action=android.settings.IGNORE_BATTERY_OPTIMIZATION_SETTINGS;end",
    },
  ];
  if (oem === "samsung") {
    items.push({
      label: "Device Care Samsung",
      href: "intent:#Intent;component=com.samsung.android.lool/com.samsung.android.sm.ui.battery.BatteryActivity;end",
    });
  }
  return items;
}
