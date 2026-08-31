import { useEffect, useRef } from "react";
import { useFlowStore } from "@/stores/flow-store";

export function AudioVisualizer({ className = "", barCount = 32 }: { className?: string; barCount?: number }) {
  const isPlaying = useFlowStore((s) => s.isPlaying);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    const bars = Array.from({ length: barCount }, () => ({
      height: 4,
      targetHeight: 4,
      speed: 0.1 + Math.random() * 0.15,
    }));

    let phase = 0;

    const render = () => {
      const { width, height } = canvas;
      ctx.clearRect(0, 0, width, height);

      phase += 0.05;
      const barWidth = (width / barCount) * 0.7;
      const gap = (width / barCount) * 0.3;

      for (let i = 0; i < barCount; i++) {
        const bar = bars[i];
        if (isPlaying) {
          // Dynamic wave + random pulse
          const sine = Math.sin(phase + (i / barCount) * Math.PI * 3);
          const noise = Math.random() * 0.3;
          const energy = Math.max(0.15, Math.abs(sine) * 0.85 + noise);
          bar.targetHeight = energy * (height * 0.9);
        } else {
          bar.targetHeight = 3;
        }

        // Smooth interpolation
        bar.height += (bar.targetHeight - bar.height) * 0.22;

        const x = i * (barWidth + gap) + gap / 2;
        const y = height - bar.height;

        // Gradient for bars
        const grad = ctx.createLinearGradient(0, height, 0, 0);
        grad.addColorStop(0, "rgba(30, 215, 96, 0.4)");
        grad.addColorStop(0.5, "rgba(30, 215, 96, 0.95)");
        grad.addColorStop(1, "rgba(56, 189, 248, 1)");

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.roundRect(x, y, barWidth, bar.height, [4, 4, 0, 0]);
        ctx.fill();
      }

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [isPlaying, barCount]);

  return (
    <canvas
      ref={canvasRef}
      width={280}
      height={54}
      className={`pointer-events-none ${className}`}
      aria-hidden="true"
    />
  );
}