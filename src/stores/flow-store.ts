import { create } from "zustand";
import type { Playlist, RepeatMode, Track } from "@/lib/music/types";

const LIKED_KEY = "flow_liked_tracks";
const RECENT_KEY = "flow_recent_tracks";
const PLAYLISTS_KEY = "flow_playlists";
const VOLUME_KEY = "flow_volume";

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
  liked: Track[];
  recents: Track[];
  playlists: Playlist[];
  trackMap: Record<string, Track>;

  playTrack: (track: Track, queue?: Track[]) => void;
  playQueue: (tracks: Track[], startIndex?: number) => void;
  togglePlay: () => void;
  pause: () => void;
  resume: () => void;
  next: () => void;
  prev: () => void;
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
  addToQueue: (track: Track) => void;
  removeFromQueue: (index: number) => void;
  toggleLike: (track: Track) => void;
  isLiked: (id: string) => boolean;
  createPlaylist: (title: string) => void;
  addToPlaylist: (playlistId: string, track: Track) => void;
  removePlaylist: (id: string) => void;
  hydrate: () => void;
}

function remember(track: Track, recents: Track[]): Track[] {
  return [track, ...recents.filter((t) => t.id !== track.id)].slice(0, 80);
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
  liked: [],
  recents: [],
  playlists: [],
  trackMap: {},

  hydrate: () => {
    const liked = readJson<Track[]>(LIKED_KEY, []);
    const recents = readJson<Track[]>(RECENT_KEY, []);
    const playlists = readJson<Playlist[]>(PLAYLISTS_KEY, []);
    const volume = readJson<number>(VOLUME_KEY, 0.9);
    const trackMap: Record<string, Track> = {};
    for (const t of [...liked, ...recents]) trackMap[t.id] = t;
    set({ liked, recents, playlists, volume, trackMap });
  },

  playTrack: (track, queue) => {
    const recents = remember(track, get().recents);
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
      });
      return;
    }
    const existing = get().queue;
    const found = existing.findIndex((t) => t.id === track.id);
    if (found >= 0) {
      set({ current: track, queueIndex: found, isPlaying: true, currentTime: 0, recents });
    } else {
      set({
        current: track,
        queue: [track, ...existing],
        queueIndex: 0,
        isPlaying: true,
        currentTime: 0,
        recents,
      });
    }
  },

  playQueue: (tracks, startIndex = 0) => {
    if (!tracks.length) return;
    const i = Math.min(Math.max(0, startIndex), tracks.length - 1);
    get().playTrack(tracks[i], tracks);
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
    const recents = remember(track, get().recents);
    writeJson(RECENT_KEY, recents);
    set({ current: track, queueIndex: nextIndex, currentTime: 0, isPlaying: true, recents, seekVersion: get().seekVersion + 1 });
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
      set({ currentTime: 0 });
      return;
    }
    const prevIndex = queueIndex <= 0 ? 0 : queueIndex - 1;
    const track = queue[prevIndex];
    if (!track) return;
    set({ current: track, queueIndex: prevIndex, currentTime: 0, isPlaying: true });
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
  setShowQueue: (v) => set({ showQueue: v }),
  setShowLyrics: (v) => set({ showLyrics: v }),

  addToQueue: (track) => set({ queue: [...get().queue, track] }),
  removeFromQueue: (index) => {
    const queue = get().queue.filter((_, i) => i !== index);
    let queueIndex = get().queueIndex;
    if (index < queueIndex) queueIndex -= 1;
    set({ queue, queueIndex: Math.max(0, Math.min(queueIndex, queue.length - 1)) });
  },

  toggleLike: (track) => {
    const liked = get().liked;
    const exists = liked.some((t) => t.id === track.id);
    const next = exists ? liked.filter((t) => t.id !== track.id) : [track, ...liked];
    writeJson(LIKED_KEY, next);
    set({ liked: next, trackMap: { ...get().trackMap, [track.id]: track } });
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
  },
  addToPlaylist: (playlistId, track) => {
    const playlists = get().playlists.map((p) =>
      p.id === playlistId && !p.trackIds.includes(track.id)
        ? { ...p, trackIds: [...p.trackIds, track.id] }
        : p,
    );
    writeJson(PLAYLISTS_KEY, playlists);
    set({ playlists, trackMap: { ...get().trackMap, [track.id]: track } });
  },
  removePlaylist: (id) => {
    const playlists = get().playlists.filter((p) => p.id !== id);
    writeJson(PLAYLISTS_KEY, playlists);
    set({ playlists });
  },
}));
