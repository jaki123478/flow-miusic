import { useEffect } from "react";

const FLOW_APP_VERSION = "flow-web-2026-10-05-1348";
const VERSION_KEY = "flow_web_version";

export function AppVersionGuard() {
  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      try {
        const previous = window.localStorage.getItem(VERSION_KEY);
        if (previous === FLOW_APP_VERSION) return;
        window.localStorage.setItem(VERSION_KEY, FLOW_APP_VERSION);

        if ("caches" in window) {
          const keys = await caches.keys();
          await Promise.all(
            keys
              .filter((key) => key.startsWith("flow-audio-") || key.startsWith("flow-web-") || key.startsWith("workbox-"))
              .map((key) => caches.delete(key)),
          );
        }

        if ("serviceWorker" in navigator) {
          const regs = await navigator.serviceWorker.getRegistrations();
          await Promise.all(regs.filter((reg) => reg.active?.scriptURL.includes("sw-audio.js")).map((reg) => reg.update()));
        }

        if (!cancelled && previous) {
          const url = new URL(window.location.href);
          url.searchParams.set("flowv", FLOW_APP_VERSION);
          window.location.replace(url.toString());
        }
      } catch {
        /* Best effort only. */
      }
    };
    void run();
    return () => {
      cancelled = true;
    };
  }, []);

  return null;
}
