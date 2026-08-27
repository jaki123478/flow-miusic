import type { Track } from "./types";
import { isAndroid } from "./lock-screen";

let lastTag = "";

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

export function showAndroidNowPlaying(track: Track) {
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
      "Samsung Internet: stesse voci Batteria / sonno app, oppure usa Chrome.",
    ];
  }
  if (oem === "motorola") {
    return [
      ...common,
      "Motorola: Impostazioni → Batteria → Utilizzo batteria delle app → Chrome → Non ottimizzata.",
      "Motorola: Impostazioni → App → Chrome → Batteria → Nessuna limitazione.",
    ];
  }
  if (oem === "pixel") {
    return [
      ...common,
      "Pixel: Impostazioni → App → Chrome → Batteria → Non ottimizzata / Nessuna limitazione.",
      "Pixel: Batteria adattiva può restare accesa; non mettere Chrome in Limitata.",
    ];
  }
  if (oem === "xiaomi") {
    return [
      ...common,
      "Xiaomi: Impostazioni → App → Gestisci app → Chrome → Risparmio batteria → Nessuna restrizione.",
      "Xiaomi: Autostart ON per Chrome. Blocca Chrome nel menu recenti (lucchetto).",
    ];
  }
  return [
    ...common,
    "Impostazioni → App → Chrome → Batteria → Nessuna limitazione / Non ottimizzata.",
    "Disattiva risparmio energetico mentre ascolti.",
  ];
}

export function oemBatteryIntents(): { label: string; href: string }[] {
  const oem = detectOem();
  const chromeDetails =
    "intent://com.android.chrome/#Intent;scheme=package;action=android.settings.APPLICATION_DETAILS_SETTINGS;end";
  const ignoreOpt =
    "intent:#Intent;action=android.settings.IGNORE_BATTERY_OPTIMIZATION_SETTINGS;end";
  const items = [
    { label: "Scheda Chrome", href: chromeDetails },
    { label: "App non ottimizzate", href: ignoreOpt },
  ];
  if (oem === "samsung") {
    items.push({
      label: "Device Care Samsung",
      href: "intent:#Intent;component=com.samsung.android.lool/com.samsung.android.sm.ui.battery.BatteryActivity;end",
    });
  }
  if (oem === "motorola") {
    items.push({
      label: "Batteria Motorola",
      href: "intent:#Intent;action=android.settings.BATTERY_SAVER_SETTINGS;end",
    });
  }
  return items;
}
