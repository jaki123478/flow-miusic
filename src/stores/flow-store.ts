import { create } from "zustand";
import type { Playlist, RepeatMode, Track } from "@/lib/music/types";

export type FlowSettings = {
  crossfade: number;
  normalize: boolean;
  hideExplicit: boolean;
  privateSession: boolean;
  remainingTime: boolean;
  eqBass: number;
  eqTreble: number;
};

export const DEFAULT_SETTINGS: FlowSettings = {
  crossfade: 4,
  normalize: true,
  hideExplicit: false,
  privateSession: false,
  remainingTime: false,
  eqBass: 0,
  eqTreble: 0,
};

const LIKED_KEY = "flow_liked_tracks";
const RECENT_KEY = "flow_recent_tracks";
const PLAYLISTS_KEY = "flow_playlists";
const VOLUME_KEY = "flow_volume";
const SETTINGS_KEY = "flow_settings";
const STATS_KEY = "flow_stats";

function readJson<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeJson(key: string, value: unknown) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* quota */
  }
}

interface FlowState {
  current: Track | null;
  queue: Track[];
  queueIndex: number;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  shuffle: boolean;
  repeat: RepeatMode;
  playbackRate: number;
  seekVersion: number;
  sleepEndsAt: number | null;
  showFullPlayer: boolean;
  showQueue: boolean;
  showLyrics: boolean;
  hideVideo: boolean;
  liked: Track[];
  recents: Track[];
  playlists: Playlist[];
  trackMap: Record<string, Track>;
  actionTrack: Track | null;
  settings: FlowSettings;
  notice: string | null;
  listenMs: number;
  showHelp: boolean;
  cloudReady: boolean;

  playTrack: (track: Track, queue?: Track[]) => void;
  playQueue: (tracks: Track[], startIndex?: number) => void;
  playNext: (track: Track) => void;
  togglePlay: () => void;
  pause: () => void;
  resume: () => void;
  next: () => void;
  prev: () => void;
  skipBy: (delta: number) => void;
  seek: (time: number) => void;
  onEnded: () => void;
  setCurrentTime: (time: number) => void;
  setDuration: (d: number) => void;
  setVolume: (v: number) => void;
  toggleMute: () => void;
  toggleShuffle: () => void;
  cycleRepeat: () => void;
  setPlaybackRate: (r: number) => void;
  setSleep: (minutes: number | null) => void;
  setShowFullPlayer: (v: boolean) => void;
  setShowQueue: (v: boolean) => void;
  setShowLyrics: (v: boolean) => void;
  setHideVideo: (v: boolean) => void;
  addToQueue: (track: Track) => void;
  removeFromQueue: (index: number) => void;
  clearQueue: () => void;
  toggleLike: (track: Track) => void;
  isLiked: (id: string) => boolean;
  createPlaylist: (title: string) => void;
  addToPlaylist: (playlistId: string, track: Track) => void;
  removeFromPlaylist: (playlistId: string, trackId: string) => void;
  removePlaylist: (id: string) => void;
  renamePlaylist: (id: string, title: string) => void;
  duplicatePlaylist: (id: string) => void;
  moveQueue: (from: number, to: number) => void;
  clearRecents: () => void;
  setActionTrack: (track: Track | null) => void;
  patchSettings: (partial: Partial<FlowSettings>) => void;
  notify: (msg: string) => void;
  addListenMs: (ms: number) => void;
  setShowHelp: (v: boolean) => void;
  importCloud: (data: {
    liked: Track[];
    recents: Track[];
    playlists: Playlist[];
    settings?: Partial<FlowSettings>;
    volume?: number;
    listenMs?: number;
  }) => void;
  dumpCloud: () => {
    liked: Track[];
    recents: Track[];
    playlists: Playlist[];
    settings: FlowSettings;
    volume: number;
    listenMs: number;
  };
  hydrate: () => void;
}

function remember(track: Track, recents: Track[], privateSession: boolean): Track[] {
  if (privateSession) return recents;
  return [track, ...recents.filter((t) => t.id !== track.id)].slice(0, 80);
}

function sanitizeTrack(track: Track): Track {
  if (track.artist && track.artist !== "YouTube Music" && track.artist !== "SimpMusic") return track;
  const dash = track.title.match(/^(.{2,48}?)\s+[-–—]\s+(.+)$/);
  if (dash) return { ...track, artist: dash[1].trim(), title: dash[2].trim() };
  return { ...track, artist: track.artist === "YouTube Music" ? "Artista" : track.artist };
}

export const useFlowStore = create<FlowState>((set, get) => ({
  current: null,
  queue: [],
  queueIndex: 0,
  isPlaying: false,
  currentTime: 0,
  duration: 0,
  volume: 0.9,
  isMuted: false,
  shuffle: false,
  repeat: "off",
  playbackRate: 1,
  seekVersion: 0,
  sleepEndsAt: null,
  showFullPlayer: false,
  showQueue: false,
  showLyrics: false,
  hideVideo: false,
  liked: [],
  recents: [],
  playlists: [],
  trackMap: {},
  actionTrack: null,
  settings: DEFAULT_SETTINGS,
  notice: null,
  listenMs: 0,
  showHelp: false,
  cloudReady: false,

  hydrate: () => {
    const liked = readJson<Track[]>(LIKED_KEY, []).map(sanitizeTrack);
    const recents = readJson<Track[]>(RECENT_KEY, []).map(sanitizeTrack);
    const playlists = readJson<Playlist[]>(PLAYLISTS_KEY, []);
    const volume = readJson<number>(VOLUME_KEY, 0.9);
    const settings = { ...DEFAULT_SETTINGS, ...readJson<Partial<FlowSettings>>(SETTINGS_KEY, {}) };
    const listenMs = readJson<number>(STATS_KEY, 0);
    const trackMap: Record<string, Track> = {};
    for (const t of [...liked, ...recents]) trackMap[t.id] = t;
    set({ liked, recents, playlists, volume, trackMap, settings, listenMs });
  },

  playTrack: (track, queue) => {
    const recents = remember(track, get().recents, get().settings.privateSession);
    writeJson(RECENT_KEY, recents);
    if (queue && queue.length) {
      const idx = Math.max(0, queue.findIndex((t) => t.id === track.id));
      set({
        current: track,
        queue,
        queueIndex: idx === -1 ? 0 : idx,
        isPlaying: true,
        currentTime: 0,
        recents,
        hideVideo: true,
      });
      return;
    }
    const existing = get().queue;
    const found = existing.findIndex((t) => t.id === track.id);
    if (found >= 0) {
      set({ current: track, queueIndex: found, isPlaying: true, currentTime: 0, recents, hideVideo: true });
    } else {
      set({
        current: track,
        queue: [track, ...existing],
        queueIndex: 0,
        isPlaying: true,
        currentTime: 0,
        recents,
        hideVideo: true,
      });
    }
  },

  playQueue: (tracks, startIndex = 0) => {
    if (!tracks.length) return;
    const i = Math.min(Math.max(0, startIndex), tracks.length - 1);
    get().playTrack(tracks[i], tracks);
  },

  playNext: (track) => {
    const { queue, queueIndex, current } = get();
    if (!current) {
      get().playTrack(track);
      return;
    }
    const next = [...queue];
    next.splice(queueIndex + 1, 0, track);
    set({ queue: next, trackMap: { ...get().trackMap, [track.id]: track } });
    get().notify("In riproduzione dopo");
  },

  togglePlay: () => {
    if (!get().current) return;
    set({ isPlaying: !get().isPlaying });
  },
  pause: () => set({ isPlaying: false }),
  resume: () => {
    if (get().current) set({ isPlaying: true });
  },

  next: () => {
    const { queue, queueIndex, repeat, shuffle } = get();
    if (!queue.length) return;
    let nextIndex: number;
    if (shuffle && queue.length > 1) {
      do {
        nextIndex = Math.floor(Math.random() * queue.length);
      } while (nextIndex === queueIndex);
    } else {
      nextIndex = queueIndex + 1;
      if (nextIndex >= queue.length) {
        if (repeat === "all") nextIndex = 0;
        else {
          set({ isPlaying: false });
          return;
        }
      }
    }
    const track = queue[nextIndex];
    const recents = remember(track, get().recents, get().settings.privateSession);
    writeJson(RECENT_KEY, recents);
    set({
      current: track,
      queueIndex: nextIndex,
      currentTime: 0,
      isPlaying: true,
      recents,
      seekVersion: get().seekVersion + 1,
    });
  },

  onEnded: () => {
    if (get().repeat === "one") {
      set({ currentTime: 0, isPlaying: true, seekVersion: get().seekVersion + 1 });
      return;
    }
    get().next();
  },

  prev: () => {
    const { queue, queueIndex, currentTime } = get();
    if (currentTime > 3) {
      set({ currentTime: 0, seekVersion: get().seekVersion + 1 });
      return;
    }
    const prevIndex = queueIndex <= 0 ? 0 : queueIndex - 1;
    const track = queue[prevIndex];
    if (!track) return;
    set({ current: track, queueIndex: prevIndex, currentTime: 0, isPlaying: true, seekVersion: get().seekVersion + 1 });
  },

  skipBy: (delta) => {
    const { current, currentTime, duration } = get();
    if (!current || current.isLive) return;
    const max = duration > 0 ? duration : currentTime + Math.abs(delta);
    const time = Math.max(0, Math.min(max, currentTime + delta));
    set({ currentTime: time, seekVersion: get().seekVersion + 1 });
  },

  seek: (time) => set({ currentTime: Math.max(0, time), seekVersion: get().seekVersion + 1 }),
  setCurrentTime: (time) => set({ currentTime: time }),
  setDuration: (d) => set({ duration: d }),
  setVolume: (v) => {
    const volume = Math.min(1, Math.max(0, v));
    writeJson(VOLUME_KEY, volume);
    set({ volume, isMuted: volume === 0 });
  },
  toggleMute: () => set({ isMuted: !get().isMuted }),
  toggleShuffle: () => set({ shuffle: !get().shuffle }),
  cycleRepeat: () => {
    const order: RepeatMode[] = ["off", "all", "one"];
    const i = order.indexOf(get().repeat);
    set({ repeat: order[(i + 1) % order.length] });
  },
  setPlaybackRate: (r) => set({ playbackRate: r }),
  setSleep: (minutes) =>
    set({ sleepEndsAt: minutes == null ? null : Date.now() + minutes * 60_000 }),
  setShowFullPlayer: (v) => set({ showFullPlayer: v, showQueue: v ? get().showQueue : false }),
  setShowQueue: (v) => set({ showQueue: v, showLyrics: v ? false : get().showLyrics }),
  setShowLyrics: (v) => set({ showLyrics: v, showQueue: v ? false : get().showQueue }),
  setHideVideo: (v) => set({ hideVideo: v }),

  addToQueue: (track) => {
    set({ queue: [...get().queue, track], trackMap: { ...get().trackMap, [track.id]: track } });
    get().notify("Aggiunto in coda");
  },
  removeFromQueue: (index) => {
    const queue = get().queue.filter((_, i) => i !== index);
    let queueIndex = get().queueIndex;
    if (index < queueIndex) queueIndex -= 1;
    set({ queue, queueIndex: Math.max(0, Math.min(queueIndex, Math.max(0, queue.length - 1))) });
  },
  clearQueue: () => {
    const current = get().current;
    set({ queue: current ? [current] : [], queueIndex: 0 });
  },

  toggleLike: (track) => {
    const liked = get().liked;
    const exists = liked.some((t) => t.id === track.id);
    const next = exists ? liked.filter((t) => t.id !== track.id) : [track, ...liked];
    writeJson(LIKED_KEY, next);
    set({ liked: next, trackMap: { ...get().trackMap, [track.id]: track } });
    get().notify(exists ? "Rimosso dai preferiti" : "Aggiunto ai preferiti");
  },
  isLiked: (id) => get().liked.some((t) => t.id === id),

  createPlaylist: (title) => {
    const clean = title.trim();
    if (!clean) return;
    const playlists = [
      { id: `pl_${Date.now()}`, title: clean, createdAt: Date.now(), trackIds: [] },
      ...get().playlists,
    ];
    writeJson(PLAYLISTS_KEY, playlists);
    set({ playlists });
    get().notify("Playlist creata");
  },
  addToPlaylist: (playlistId, track) => {
    const playlists = get().playlists.map((p) =>
      p.id === playlistId && !p.trackIds.includes(track.id)
        ? { ...p, trackIds: [...p.trackIds, track.id] }
        : p,
    );
    writeJson(PLAYLISTS_KEY, playlists);
    set({ playlists, trackMap: { ...get().trackMap, [track.id]: track } });
    get().notify("Salvato in playlist");
  },
  removeFromPlaylist: (playlistId, trackId) => {
    const playlists = get().playlists.map((p) =>
      p.id === playlistId ? { ...p, trackIds: p.trackIds.filter((id) => id !== trackId) } : p,
    );
    writeJson(PLAYLISTS_KEY, playlists);
    set({ playlists });
  },
  removePlaylist: (id) => {
    const playlists = get().playlists.filter((p) => p.id !== id);
    writeJson(PLAYLISTS_KEY, playlists);
    set({ playlists });
    get().notify("Playlist eliminata");
  },
  renamePlaylist: (id, title) => {
    const clean = title.trim();
    if (!clean) return;
    const playlists = get().playlists.map((p) => (p.id === id ? { ...p, title: clean } : p));
    writeJson(PLAYLISTS_KEY, playlists);
    set({ playlists });
  },
  duplicatePlaylist: (id) => {
    const src = get().playlists.find((p) => p.id === id);
    if (!src) return;
    const playlists = [
      { ...src, id: `pl_${Date.now()}`, title: `${src.title} (copia)`, createdAt: Date.now() },
      ...get().playlists,
    ];
    writeJson(PLAYLISTS_KEY, playlists);
    set({ playlists });
    get().notify("Playlist duplicata");
  },
  moveQueue: (from, to) => {
    const queue = [...get().queue];
    if (from < 0 || to < 0 || from >= queue.length || to >= queue.length) return;
    const [item] = queue.splice(from, 1);
    queue.splice(to, 0, item);
    const currentId = get().current?.id;
    const queueIndex = currentId ? Math.max(0, queue.findIndex((t) => t.id === currentId)) : get().queueIndex;
    set({ queue, queueIndex });
  },
  clearRecents: () => {
    writeJson(RECENT_KEY, []);
    set({ recents: [] });
  },
  setActionTrack: (track) => set({ actionTrack: track }),
  patchSettings: (partial) => {
    const settings = { ...get().settings, ...partial };
    writeJson(SETTINGS_KEY, settings);
    set({ settings });
  },
  notify: (msg) => {
    set({ notice: msg });
    window.setTimeout(() => {
      if (get().notice === msg) set({ notice: null });
    }, 2400);
  },
  addListenMs: (ms) => {
    const listenMs = get().listenMs + ms;
    writeJson(STATS_KEY, listenMs);
    set({ listenMs });
  },
  setShowHelp: (v) => set({ showHelp: v }),
  importCloud: (data) => {
    const liked = (data.liked ?? []).map(sanitizeTrack);
    const recents = (data.recents ?? []).map(sanitizeTrack);
    const playlists = data.playlists ?? [];
    const settings = { ...get().settings, ...(data.settings ?? {}) };
    const volume = typeof data.volume === "number" ? data.volume : get().volume;
    const listenMs = typeof data.listenMs === "number" ? data.listenMs : get().listenMs;
    const trackMap: Record<string, Track> = { ...get().trackMap };
    for (const t of [...liked, ...recents]) trackMap[t.id] = t;
    writeJson(LIKED_KEY, liked);
    writeJson(RECENT_KEY, recents);
    writeJson(PLAYLISTS_KEY, playlists);
    writeJson(SETTINGS_KEY, settings);
    writeJson(VOLUME_KEY, volume);
    writeJson(STATS_KEY, listenMs);
    set({ liked, recents, playlists, settings, volume, listenMs, trackMap, cloudReady: true });
  },
  dumpCloud: () => {
    const s = get();
    return {
      liked: s.liked,
      recents: s.recents,
      playlists: s.playlists,
      settings: s.settings,
      volume: s.volume,
      listenMs: s.listenMs,
    };
  },
}));
