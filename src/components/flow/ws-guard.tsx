import { useEffect } from "react";
import { installWebSocketGuard } from "@/lib/net/websocket";
import { useFlowStore } from "@/stores/flow-store";

export function WebSocketGuard() {
  const notify = useFlowStore((s) => s.notify);
  useEffect(() => installWebSocketGuard((msg) => notify(msg)), [notify]);
  return null;
}
