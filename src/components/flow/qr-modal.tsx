import { useState } from "react";
import { X, QrCode, Copy, Check, Share2, Smartphone } from "lucide-react";
import { useFlowStore } from "@/stores/flow-store";
import { TrackArt } from "./tracks";

export function QrModal() {
  const qrTarget = useFlowStore((s) => s.qrTarget);
  const setQrTarget = useFlowStore((s) => s.setQrTarget);
  const notify = useFlowStore((s) => s.notify);
  const [copied, setCopied] = useState(false);

  if (!qrTarget) return null;

  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=320x320&data=${encodeURIComponent(
    qrTarget.url
  )}&bgcolor=14171E&color=1ED760&margin=12&format=svg`;

  const handleCopy = () => {
    void navigator.clipboard.writeText(qrTarget.url);
    setCopied(true);
    notify("Link copiato negli appunti!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = () => {
    if (typeof navigator !== "undefined" && navigator.share) {
      navigator
        .share({
          title: qrTarget.title,
          text: `Ascolta "${qrTarget.title}" su Flow Music`,
          url: qrTarget.url,
        })
        .catch(() => {});
    } else {
      handleCopy();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md animate-in fade-in duration-200"
      onClick={() => setQrTarget(null)}
    >
      <div
        className="relative w-full max-w-sm overflow-hidden rounded-3xl bg-[#14171E] p-6 text-center text-fg shadow-2xl ring-1 ring-white/10"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={() => setQrTarget(null)}
          className="absolute right-4 top-4 flex size-9 items-center justify-center rounded-full text-muted hover:bg-white/10 hover:text-fg transition-colors"
          aria-label="Chiudi"
        >
          <X className="size-5" />
        </button>

        <div className="flex items-center justify-center gap-2 text-primary font-heading text-sm font-bold uppercase tracking-wider">
          <QrCode className="size-4" />
          Condivisione Rapida
        </div>

        <div className="mt-4 flex flex-col items-center">
          {qrTarget.artwork && (
            <div className="size-16 overflow-hidden rounded-2xl bg-surface shadow-lg ring-1 ring-white/10 mb-3">
              <TrackArt src={qrTarget.artwork} alt={qrTarget.title} />
            </div>
          )}
          <h3 className="max-w-[16rem] truncate text-base font-bold text-fg">{qrTarget.title}</h3>
          <p className="max-w-[16rem] truncate text-xs text-muted mt-0.5">{qrTarget.subtitle}</p>
        </div>

        {/* QR Image Box with Neon Border */}
        <div className="relative mx-auto mt-4 size-56 overflow-hidden rounded-2xl bg-[#0e1015] p-3 shadow-inner ring-1 ring-primary/30 flex items-center justify-center">
          <img
            src={qrUrl}
            alt="QR Code"
            className="size-full rounded-xl object-contain drop-shadow-md"
            loading="eager"
          />
        </div>

        <div className="mt-3 flex items-center justify-center gap-1.5 text-xs text-muted">
          <Smartphone className="size-3.5 text-primary" />
          Inquadra con la fotocamera per aprire al volo
        </div>

        {/* Actions */}
        <div className="mt-5 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={handleCopy}
            className="flex h-10 items-center justify-center gap-2 rounded-xl bg-surface text-xs font-bold text-fg hover:bg-elevated ring-1 ring-border transition-colors"
          >
            {copied ? <Check className="size-4 text-primary" /> : <Copy className="size-4" />}
            {copied ? "Copiato!" : "Copia Link"}
          </button>

          <button
            type="button"
            onClick={handleShare}
            className="flex h-10 items-center justify-center gap-2 rounded-xl bg-primary text-xs font-bold text-primary-fg shadow-lg shadow-primary/20 hover:opacity-90 transition-opacity"
          >
            <Share2 className="size-4" />
            Condividi
          </button>
        </div>
      </div>
    </div>
  );
}