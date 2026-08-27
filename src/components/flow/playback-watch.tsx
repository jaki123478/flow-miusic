import { useEffect } from "react";
import { useFlowStore } from "@/stores/flow-store";

export function PlaybackWatch() {
  const sleepEndsAt = useFlowStore((s) => s.sleepEndsAt);

  useEffect(() => {
    if (!sleepEndsAt) return;
    const tick = () => {
      const s = useFlowStore.getState();
      if (!s.sleepEndsAt) return;
      if (Date.now() < s.sleepEndsAt) return;
      s.pause();
      s.setSleep(null);
      s.notify("Timer spento");
    };
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [sleepEndsAt]);

  return null;
}
