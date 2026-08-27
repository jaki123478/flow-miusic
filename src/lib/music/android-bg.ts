import type { Track } from "./types";
import { isAndroid } from "./lock-screen";

let lastTag = "";

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
    /* Chrome may block without a gesture */
  }
}

export function clearAndroidNowPlaying() {
  if (!lastTag) return;
  lastTag = "";
}

export function androidBackgroundTips(): string[] {
  return [
    "Flow scarica il brano e lo suona in locale: aspetta 2–3 secondi dopo il play, poi spegni lo schermo.",
    "Installa Flow sulla Home (non lasciare solo la scheda Chrome).",
    "Android → App → Chrome e Flow → Batteria → Nessuna limitazione.",
    "Non chiudere Flow dallo switcher. Lo schermo spento va bene.",
  ];
}
