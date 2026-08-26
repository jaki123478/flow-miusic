import { useEffect, useState } from "react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function greetingIt(date = new Date()): string {
  const h = date.getHours();
  if (h < 5) return "Buona notte";
  if (h < 13) return "Buongiorno";
  if (h < 18) return "Buon pomeriggio";
  return "Buonasera";
}

export function hashHue(input: string): number {
  let h = 0;
  for (let i = 0; i < input.length; i++) h = (h * 31 + input.charCodeAt(i)) | 0;
  return Math.abs(h) % 360;
}

export function useOpenTransition(show: boolean, ms = 280) {
  const [mounted, setMounted] = useState(show);
  const [open, setOpen] = useState(show);
  useEffect(() => {
    if (show) {
      setMounted(true);
      const id = window.requestAnimationFrame(() => {
        window.requestAnimationFrame(() => setOpen(true));
      });
      return () => window.cancelAnimationFrame(id);
    }
    setOpen(false);
    const reduced =
      typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const t = window.setTimeout(() => setMounted(false), reduced ? 0 : ms);
    return () => window.clearTimeout(t);
  }, [show, ms]);
  return { mounted, open };
}
