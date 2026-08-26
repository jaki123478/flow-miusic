import { useFlowStore } from "@/stores/flow-store";

export function ToastHost() {
  const notice = useFlowStore((s) => s.notice);
  if (!notice) return null;
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-[calc(5.5rem+env(safe-area-inset-bottom))] z-[90] flex justify-center px-4 md:bottom-28">
      <p className="rounded-full bg-fg px-4 py-2 text-sm font-medium text-bg shadow-lg">{notice}</p>
    </div>
  );
}
