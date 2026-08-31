import type { Track } from "./types";

const W = 1080;
const H = 1350;

export function proxiedArtwork(src: string): string {
  if (!src) return src;
  if (src.startsWith("/") || src.startsWith("blob:") || src.startsWith("data:")) return src;
  try {
    const u = new URL(src, typeof window !== "undefined" ? window.location.href : "https://local");
    if (typeof window !== "undefined" && u.origin === window.location.origin) return src;
    if (u.protocol !== "https:") return src;
    return `/api/proxy?u=${encodeURIComponent(u.href)}`;
  } catch {
    return src;
  }
}

function loadImage(src: string, timeoutMs = 6000): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    if (!src) {
      resolve(null);
      return;
    }
    const img = new Image();
    img.crossOrigin = "anonymous";
    const done = (value: HTMLImageElement | null) => {
      window.clearTimeout(timer);
      img.onload = null;
      img.onerror = null;
      resolve(value);
    };
    const timer = window.setTimeout(() => done(null), timeoutMs);
    img.onload = () => done(img);
    img.onerror = () => done(null);
    img.src = src;
  });
}

export async function averageArtworkColor(src: string): Promise<string | null> {
  const img = await loadImage(proxiedArtwork(src), 4000);
  if (!img) return null;
  const canvas = document.createElement("canvas");
  canvas.width = 8;
  canvas.height = 8;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return null;
  try {
    ctx.drawImage(img, 0, 0, 8, 8);
    const data = ctx.getImageData(0, 0, 8, 8).data;
    let r = 0;
    let g = 0;
    let b = 0;
    let n = 0;
    for (let i = 0; i < data.length; i += 4) {
      const a = data[i + 3];
      if (a < 80) continue;
      r += data[i];
      g += data[i + 1];
      b += data[i + 2];
      n += 1;
    }
    if (!n) return null;
    r = Math.round(r / n);
    g = Math.round(g / n);
    b = Math.round(b / n);
    const luma = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    if (luma < 28) {
      r = Math.min(255, r + 40);
      g = Math.min(255, g + 40);
      b = Math.min(255, b + 40);
    }
    return `rgb(${r}, ${g}, ${b})`;
  } catch {
    return null;
  }
}

function wrapLines(ctx: CanvasRenderingContext2D, text: string, maxWidth: number, maxLines: number): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let cur = "";
  for (const word of words) {
    const next = cur ? `${cur} ${word}` : word;
    if (ctx.measureText(next).width <= maxWidth) {
      cur = next;
    } else {
      if (cur) lines.push(cur);
      cur = word;
      if (lines.length === maxLines - 1) break;
    }
  }
  if (cur && lines.length < maxLines) lines.push(cur);
  if (words.length && lines.length === maxLines) {
    let last = lines[maxLines - 1];
    while (ctx.measureText(`${last}…`).width > maxWidth && last.length > 4) last = last.slice(0, -1);
    lines[maxLines - 1] = `${last}…`;
  }
  return lines.length ? lines : [text];
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  const rad = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rad, y);
  ctx.arcTo(x + w, y, x + w, y + h, rad);
  ctx.arcTo(x + w, y + h, x, y + h, rad);
  ctx.arcTo(x, y + h, x, y, rad);
  ctx.arcTo(x, y, x + w, y, rad);
  ctx.closePath();
}

function coverClip(ctx: CanvasRenderingContext2D, img: HTMLImageElement, x: number, y: number, size: number, radius: number) {
  ctx.save();
  roundRect(ctx, x, y, size, size, radius);
  ctx.clip();
  const scale = Math.max(size / img.width, size / img.height);
  const dw = img.width * scale;
  const dh = img.height * scale;
  ctx.drawImage(img, x + (size - dw) / 2, y + (size - dh) / 2, dw, dh);
  ctx.restore();
}

export type LyricsShareInput = {
  track: Track;
  line: string;
  extra?: string;
};

export async function renderLyricsCard(input: LyricsShareInput): Promise<Blob> {
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas non disponibile");

  ctx.fillStyle = "#07080a";
  ctx.fillRect(0, 0, W, H);

  const art = await loadImage(proxiedArtwork(input.track.artwork));
  if (art) {
    ctx.save();
    ctx.filter = "blur(48px) saturate(1.35)";
    const scale = Math.max(W / art.width, H / art.height) * 1.25;
    const dw = art.width * scale;
    const dh = art.height * scale;
    ctx.drawImage(art, (W - dw) / 2, (H - dh) / 2, dw, dh);
    ctx.restore();
  } else {
    const g = ctx.createLinearGradient(0, 0, W, H);
    g.addColorStop(0, "#1a3a16");
    g.addColorStop(1, "#0b0c10");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
  }

  const veil = ctx.createLinearGradient(0, 0, 0, H);
  veil.addColorStop(0, "rgba(0,0,0,0.25)");
  veil.addColorStop(0.45, "rgba(0,0,0,0.45)");
  veil.addColorStop(1, "rgba(0,0,0,0.72)");
  ctx.fillStyle = veil;
  ctx.fillRect(0, 0, W, H);

  const cardX = 72;
  const cardY = 120;
  const cardW = W - 144;
  const cardH = H - 240;
  ctx.save();
  roundRect(ctx, cardX, cardY, cardW, cardH, 48);
  ctx.fillStyle = "rgba(255,255,255,0.10)";
  ctx.fill();
  ctx.strokeStyle = "rgba(255,255,255,0.22)";
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.restore();

  const cover = 280;
  const coverX = (W - cover) / 2;
  const coverY = cardY + 56;
  if (art) {
    ctx.save();
    ctx.shadowColor = "rgba(0,0,0,0.45)";
    ctx.shadowBlur = 36;
    coverClip(ctx, art, coverX, coverY, cover, 28);
    ctx.restore();
  }

  const line = (input.line || input.track.title || "").trim() || input.track.title;
  ctx.fillStyle = "#ffffff";
  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  let size = 54;
  ctx.font = `700 ${size}px "Plus Jakarta Sans", ui-sans-serif, system-ui, sans-serif`;
  let wrapped = wrapLines(ctx, line, cardW - 96, 5);
  while (size > 34 && wrapped.length > 4) {
    size -= 4;
    ctx.font = `700 ${size}px "Plus Jakarta Sans", ui-sans-serif, system-ui, sans-serif`;
    wrapped = wrapLines(ctx, line, cardW - 96, 5);
  }
  const textY = coverY + cover + 56;
  wrapped.forEach((row, i) => {
    ctx.fillText(row, W / 2, textY + i * (size + 14));
  });

  const metaY = textY + wrapped.length * (size + 14) + 36;
  ctx.font = `600 28px "Plus Jakarta Sans", ui-sans-serif, system-ui, sans-serif`;
  ctx.fillStyle = "rgba(255,255,255,0.92)";
  ctx.fillText(input.track.title.slice(0, 64), W / 2, metaY);
  ctx.font = `500 24px "Plus Jakarta Sans", ui-sans-serif, system-ui, sans-serif`;
  ctx.fillStyle = "rgba(255,255,255,0.62)";
  ctx.fillText(input.track.artist.slice(0, 64), W / 2, metaY + 40);

  ctx.font = `700 22px "Plus Jakarta Sans", ui-sans-serif, system-ui, sans-serif`;
  ctx.fillStyle = "#D4E84B";
  ctx.fillText("FLOW", W / 2, cardY + cardH - 52);

  return await new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error("Immagine non generata"));
    }, "image/png");
  });
}

export type ShareResult = "shared" | "downloaded" | "copied";

function triggerDownload(blob: Blob, name: string) {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = name;
  a.click();
  window.setTimeout(() => URL.revokeObjectURL(a.href), 4000);
}

export async function shareLyricsCard(input: LyricsShareInput): Promise<ShareResult> {
  const line = (input.line || "").trim() || input.track.title;
  const text = `"${line}" — ${input.track.title} · ${input.track.artist}`;
  const blob = await renderLyricsCard({ ...input, line });
  const file = new File([blob], "flow-lyrics.png", { type: "image/png" });
  const nav = navigator as Navigator & {
    canShare?: (data: ShareData) => boolean;
    share?: (data: ShareData) => Promise<void>;
  };
  try {
    if (nav.share && (!nav.canShare || nav.canShare({ files: [file] }))) {
      await nav.share({ title: input.track.title, text, files: [file] });
      return "shared";
    }
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") return "shared";
  }
  try {
    if (nav.share) {
      await nav.share({ title: input.track.title, text });
      triggerDownload(blob, "flow-lyrics.png");
      return "shared";
    }
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") return "shared";
  }
  try {
    await navigator.clipboard.writeText(text);
    triggerDownload(blob, "flow-lyrics.png");
    return "downloaded";
  } catch {
    triggerDownload(blob, "flow-lyrics.png");
    return "downloaded";
  }
}
