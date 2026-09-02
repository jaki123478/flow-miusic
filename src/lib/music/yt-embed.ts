type YtInfo = { currentTime?: number; duration?: number; playerState?: number };

let host: HTMLDivElement | null = null;
let frame: HTMLIFrameElement | null = null;
let activeId = "";
let poll: number | null = null;
let lastTime = 0;
let lastDur = 0;
let lastPlaying = false;
let listening = false;
let onTick: ((t: number, d: number, playing: boolean) => void) | null = null;
let onDone: (() => void) | null = null;

function cmd(func: string, args: unknown[] = []) {
  try {
    frame?.contentWindow?.postMessage(JSON.stringify({ event: "command", func, args }), "*");
  } catch {
    /* ignore */
  }
}

function listenMessages() {
  if (listening || typeof window === "undefined") return;
  listening = true;
  window.addEventListener("message", (event) => {
    const origin = String(event.origin || "");
    if (!origin.includes("youtube.com") && !origin.includes("youtube-nocookie.com")) return;
    let data: { event?: string; info?: number | YtInfo } = {};
    try {
      data = typeof event.data === "string" ? JSON.parse(event.data) : event.data;
    } catch {
      return;
    }
    if (data?.event === "onStateChange" && typeof data.info === "number") {
      lastPlaying = data.info === 1;
      if (data.info === 0) onDone?.();
      onTick?.(lastTime, lastDur, lastPlaying);
    }
    if (data?.event === "infoDelivery" && data.info && typeof data.info === "object") {
      const info = data.info;
      if (typeof info.currentTime === "number") lastTime = info.currentTime;
      if (typeof info.duration === "number" && info.duration > 0) lastDur = info.duration;
      if (typeof info.playerState === "number") lastPlaying = info.playerState === 1;
      onTick?.(lastTime, lastDur, lastPlaying);
    }
  });
}

function ensureHost() {
  if (typeof document === "undefined") return null;
  if (host && document.body.contains(host)) return host;
  host = document.createElement("div");
  host.id = "flow-yt-embed";
  host.style.cssText =
    "position:fixed;right:12px;bottom:96px;width:128px;height:72px;z-index:60;border-radius:12px;overflow:hidden;background:#000;box-shadow:0 8px 28px rgba(0,0,0,.45)";
  document.documentElement.appendChild(host);
  return host;
}

function startPoll() {
  if (poll) window.clearInterval(poll);
  poll = window.setInterval(() => {
    cmd("getCurrentTime");
    cmd("getDuration");
    cmd("getPlayerState");
    onTick?.(lastTime, lastDur, lastPlaying);
  }, 400);
}

export function preloadYtEmbed() {
  if (typeof window === "undefined") return;
  listenMessages();
  ensureHost();
}

export function isYtEmbedActive(id?: string) {
  if (!activeId || !frame) return false;
  return id ? activeId === id : true;
}

export function bindYtEmbed(handlers: {
  tick?: (t: number, d: number, playing: boolean) => void;
  ended?: () => void;
}) {
  onTick = handlers.tick || null;
  onDone = handlers.ended || null;
}

/** Must run in the same tick as a user tap so iOS allows autoplay. */
export function playYtEmbed(id: string) {
  if (typeof window === "undefined" || !id) return;
  listenMessages();
  const box = ensureHost();
  if (!box) return;
  activeId = id;
  lastTime = 0;
  lastDur = 0;
  lastPlaying = true;
  const origin = encodeURIComponent(window.location.origin);
  const src = `https://www.youtube.com/embed/${id}?autoplay=1&mute=0&playsinline=1&enablejsapi=1&rel=0&modestbranding=1&controls=0&fs=0&origin=${origin}`;
  if (!frame || !box.contains(frame)) {
    frame = document.createElement("iframe");
    frame.id = "flow-yt-frame";
    frame.allow = "autoplay; encrypted-media; fullscreen; picture-in-picture";
    frame.setAttribute("allowfullscreen", "");
    frame.setAttribute("playsinline", "true");
    frame.setAttribute("webkit-playsinline", "true");
    frame.referrerPolicy = "origin-when-cross-origin";
    frame.style.cssText = "width:100%;height:100%;border:0;display:block";
    box.innerHTML = "";
    box.appendChild(frame);
  }
  if (frame.src.includes(id) && lastPlaying) {
    cmd("playVideo");
  } else {
    frame.src = src;
  }
  frame.onload = () => {
    try {
      frame?.contentWindow?.postMessage('{"event":"listening","id":1}', "*");
    } catch {
      /* ignore */
    }
    cmd("playVideo");
    cmd("unMute");
  };
  startPoll();
}

export function pauseYtEmbed() {
  lastPlaying = false;
  cmd("pauseVideo");
}

export function resumeYtEmbed() {
  lastPlaying = true;
  cmd("playVideo");
}

export function seekYtEmbed(t: number) {
  cmd("seekTo", [t, true]);
  lastTime = t;
}

export function stopYtEmbed() {
  activeId = "";
  lastPlaying = false;
  if (poll) {
    window.clearInterval(poll);
    poll = null;
  }
  cmd("pauseVideo");
  cmd("stopVideo");
}
