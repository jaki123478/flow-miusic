type YtPlayer = {
  loadVideoById: (id: string) => void;
  playVideo: () => void;
  pauseVideo: () => void;
  seekTo: (t: number, allowSeekAhead: boolean) => void;
  getCurrentTime: () => number;
  getDuration: () => number;
  getPlayerState: () => number;
  destroy: () => void;
};

let ready: Promise<void> | null = null;
let player: YtPlayer | null = null;
let host: HTMLDivElement | null = null;
let activeId = "";
let poll: number | null = null;
let onTick: ((t: number, d: number, playing: boolean) => void) | null = null;
let onDone: (() => void) | null = null;

function api(): Promise<void> {
  if (ready) return ready;
  ready = new Promise((resolve) => {
    const w = window as Window & { YT?: { Player: new (el: HTMLElement, opts: unknown) => YtPlayer }; onYouTubeIframeAPIReady?: () => void };
    if (w.YT?.Player) {
      resolve();
      return;
    }
    const prev = w.onYouTubeIframeAPIReady;
    w.onYouTubeIframeAPIReady = () => {
      prev?.();
      resolve();
    };
    const s = document.createElement("script");
    s.src = "https://www.youtube.com/iframe_api";
    s.async = true;
    document.head.appendChild(s);
    window.setTimeout(() => resolve(), 4000);
  });
  return ready;
}

function ensureHost() {
  if (host && document.body.contains(host)) return host;
  host = document.createElement("div");
  host.id = "flow-yt-embed";
  host.style.cssText =
    "position:fixed;left:0;bottom:0;width:40px;height:40px;opacity:0.02;pointer-events:none;z-index:-1;overflow:hidden";
  document.documentElement.appendChild(host);
  return host;
}

function startPoll() {
  if (poll) window.clearInterval(poll);
  poll = window.setInterval(() => {
    if (!player) return;
    const t = Number(player.getCurrentTime?.() || 0);
    const d = Number(player.getDuration?.() || 0);
    const playing = player.getPlayerState?.() === 1;
    onTick?.(t, d, playing);
  }, 250);
}

export function isYtEmbedActive(id?: string) {
  if (!player || !activeId) return false;
  return id ? activeId === id : true;
}

export function bindYtEmbed(handlers: {
  tick?: (t: number, d: number, playing: boolean) => void;
  ended?: () => void;
}) {
  onTick = handlers.tick || null;
  onDone = handlers.ended || null;
}

export async function playYtEmbed(id: string) {
  if (typeof window === "undefined" || !id) return;
  await api();
  const w = window as Window & { YT?: { Player: new (el: HTMLElement, opts: unknown) => YtPlayer } };
  if (!w.YT?.Player) return;
  activeId = id;
  if (player) {
    player.loadVideoById(id);
    player.playVideo();
    startPoll();
    return;
  }
  const mount = ensureHost();
  player = new w.YT.Player(mount, {
    width: 40,
    height: 40,
    videoId: id,
    playerVars: {
      autoplay: 1,
      playsinline: 1,
      controls: 0,
      rel: 0,
      fs: 0,
      disablekb: 1,
      origin: window.location.origin,
    },
    events: {
      onReady: (e: { target: YtPlayer }) => {
        e.target.playVideo();
        startPoll();
      },
      onStateChange: (e: { data: number }) => {
        if (e.data === 0) onDone?.();
        if (e.data === 1) startPoll();
      },
    },
  });
}

export function pauseYtEmbed() {
  try {
    player?.pauseVideo();
  } catch {
    /* ignore */
  }
}

export function resumeYtEmbed() {
  try {
    player?.playVideo();
  } catch {
    /* ignore */
  }
}

export function seekYtEmbed(t: number) {
  try {
    player?.seekTo(t, true);
  } catch {
    /* ignore */
  }
}

export function stopYtEmbed() {
  activeId = "";
  if (poll) {
    window.clearInterval(poll);
    poll = null;
  }
  try {
    player?.pauseVideo();
  } catch {
    /* ignore */
  }
}
