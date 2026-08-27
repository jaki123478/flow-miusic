import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { useFlowStore } from "@/stores/flow-store";

export function ChatFab() {
  const showChat = useFlowStore((s) => s.showChat);
  const setShowChat = useFlowStore((s) => s.setShowChat);
  const showFullPlayer = useFlowStore((s) => s.showFullPlayer);

  if (showChat || showFullPlayer) return null;

  return (
    <button
      type="button"
      aria-label="Flow DJ"
      onClick={() => setShowChat(!showChat)}
      className={cn(
        "fixed right-4 z-50 flex size-12 items-center justify-center rounded-full bg-primary text-primary-fg shadow md:hidden",
        "bottom-[calc(5.5rem+env(safe-area-inset-bottom))]",
      )}
    >
      <Sparkles className="size-5" />
    </button>
  );
}

export function ChatToggle() {
  const showChat = useFlowStore((s) => s.showChat);
  const setShowChat = useFlowStore((s) => s.setShowChat);

  return (
    <button
      type="button"
      title="Flow DJ"
      aria-label="Flow DJ"
      onClick={() => setShowChat(!showChat)}
      className={cn("rounded-full p-2 hover:text-fg", showChat ? "text-primary" : "text-muted")}
    >
      <Sparkles className="size-5" />
    </button>
  );
}
