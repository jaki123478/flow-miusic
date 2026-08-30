import { useEffect, useRef } from "react";
import { useFlowStore } from "@/stores/flow-store";

export function KeepAlive() {
  const playing = useFlowStore((s) => s.isPlaying);
  const ref = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (playing) void el.play().catch(() => {});
    else {
      el.pause();
      el.currentTime = 0;
    }
  }, [playing]);

  useEffect(() => {
    const kick = () => {
      const el = ref.current;
      if (!el || !useFlowStore.getState().isPlaying) return;
      if (el.paused) void el.play().catch(() => {});
    };
    document.addEventListener("visibilitychange", kick);
    window.addEventListener("pageshow", kick);
    window.addEventListener("focus", kick);
    window.addEventListener("resume", kick);
    const t = window.setInterval(kick, 2000);
    return () => {
      document.removeEventListener("visibilitychange", kick);
      window.removeEventListener("pageshow", kick);
      window.removeEventListener("focus", kick);
      window.removeEventListener("resume", kick);
      window.clearInterval(t);
    };
  }, []);

  return (
    <audio
      ref={ref}
      src="/silence.wav"
      loop
      playsInline
      preload="auto"
      className="pointer-events-none fixed bottom-0 left-1 h-px w-px opacity-[0.01]"
    />
  );
}
