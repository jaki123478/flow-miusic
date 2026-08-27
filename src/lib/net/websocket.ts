export type WsStatus = "idle" | "connecting" | "open" | "retrying" | "closed" | "error";

export type ManagedSocketOptions = {
  url: string | (() => string);
  protocols?: string | string[];
  maxRetries?: number;
  baseDelayMs?: number;
  maxDelayMs?: number;
  heartbeatMs?: number;
  pauseWhenHidden?: boolean;
  onOpen?: () => void;
  onMessage?: (data: string | ArrayBuffer) => void;
  onStatus?: (status: WsStatus, detail?: string) => void;
  onError?: (message: string) => void;
};

export function wsErrorMessage(code?: number, reason?: string): string {
  if (reason && reason.trim()) return reason.trim();
  switch (code) {
    case 1000:
      return "Connessione chiusa";
    case 1001:
      return "Server non disponibile";
    case 1006:
      return "Connessione interrotta";
    case 1008:
      return "Connessione rifiutata";
    case 1011:
      return "Errore interno del server";
    case 1015:
      return "Certificato non valido";
    default:
      return "WebSocket non raggiungibile";
  }
}

export function createManagedSocket(opts: ManagedSocketOptions) {
  let socket: WebSocket | null = null;
  let closed = false;
  let attempt = 0;
  let retryTimer = 0;
  let beatTimer = 0;
  let status: WsStatus = "idle";

  const setStatus = (next: WsStatus, detail?: string) => {
    status = next;
    opts.onStatus?.(next, detail);
  };

  const urlOf = () => (typeof opts.url === "function" ? opts.url() : opts.url);

  const clearTimers = () => {
    if (retryTimer) window.clearTimeout(retryTimer);
    if (beatTimer) window.clearInterval(beatTimer);
    retryTimer = 0;
    beatTimer = 0;
  };

  const drop = () => {
    if (!socket) return;
    socket.onopen = null;
    socket.onclose = null;
    socket.onerror = null;
    socket.onmessage = null;
    try {
      socket.close();
    } catch {
      /* already closing */
    }
    socket = null;
  };

  const schedule = (detail: string) => {
    if (closed) return;
    const max = opts.maxRetries ?? 8;
    if (attempt >= max) {
      setStatus("error", detail);
      opts.onError?.(detail);
      return;
    }
    const base = opts.baseDelayMs ?? 600;
    const cap = opts.maxDelayMs ?? 12_000;
    const wait = Math.min(cap, base * 2 ** attempt) + Math.floor(Math.random() * 250);
    attempt += 1;
    setStatus("retrying", `${detail} · nuovo tentativo ${attempt}/${max}`);
    retryTimer = window.setTimeout(connect, wait);
  };

  const connect = () => {
    if (closed) return;
    if (opts.pauseWhenHidden && document.hidden) {
      setStatus("idle", "in attesa");
      return;
    }
    drop();
    clearTimers();
    let href = "";
    try {
      href = urlOf();
      setStatus("connecting");
      socket = opts.protocols ? new WebSocket(href, opts.protocols) : new WebSocket(href);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "URL WebSocket non valido";
      schedule(msg);
      return;
    }

    socket.onopen = () => {
      attempt = 0;
      setStatus("open");
      opts.onOpen?.();
      const every = opts.heartbeatMs ?? 0;
      if (every > 0) {
        beatTimer = window.setInterval(() => {
          if (socket?.readyState === WebSocket.OPEN) {
            try {
              socket.send(JSON.stringify({ t: "ping", at: Date.now() }));
            } catch {
              /* ignore */
            }
          }
        }, every);
      }
    };

    socket.onmessage = (ev) => {
      opts.onMessage?.(ev.data as string | ArrayBuffer);
    };

    socket.onerror = () => {
      const msg = wsErrorMessage(1006);
      opts.onError?.(msg);
    };

    socket.onclose = (ev) => {
      clearTimers();
      const msg = wsErrorMessage(ev.code, ev.reason);
      if (closed || ev.code === 1000) {
        setStatus("closed", msg);
        return;
      }
      schedule(msg);
    };
  };

  const onVis = () => {
    if (!opts.pauseWhenHidden) return;
    if (document.hidden) {
      drop();
      setStatus("idle", "sospeso");
      return;
    }
    if (!closed && status !== "open") connect();
  };

  document.addEventListener("visibilitychange", onVis);
  connect();

  return {
    get status() {
      return status;
    },
    send(data: string | ArrayBufferLike | Blob) {
      if (socket?.readyState !== WebSocket.OPEN) return false;
      try {
        socket.send(data);
        return true;
      } catch {
        return false;
      }
    },
    reconnect() {
      attempt = 0;
      connect();
    },
    close() {
      closed = true;
      document.removeEventListener("visibilitychange", onVis);
      clearTimers();
      drop();
      setStatus("closed");
    },
  };
}

export function installWebSocketGuard(onNotice?: (msg: string) => void): () => void {
  if (typeof window === "undefined") return () => {};

  const onError = (event: ErrorEvent) => {
    const text = `${event.message || ""} ${event.filename || ""}`;
    if (!/websocket|socket/i.test(text)) return;
    event.preventDefault();
    onNotice?.(wsErrorMessage(1006));
  };

  const onReject = (event: PromiseRejectionEvent) => {
    const reason = event.reason;
    const text =
      typeof reason === "string"
        ? reason
        : reason instanceof Error
          ? `${reason.name} ${reason.message}`
          : String(reason ?? "");
    if (!/websocket|socket/i.test(text)) return;
    event.preventDefault();
    onNotice?.(wsErrorMessage(1006));
  };

  window.addEventListener("error", onError);
  window.addEventListener("unhandledrejection", onReject);
  return () => {
    window.removeEventListener("error", onError);
    window.removeEventListener("unhandledrejection", onReject);
  };
}
