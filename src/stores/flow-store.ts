import { create } from "zustand";
import type { Playlist, RepeatMode, Track } from "@/lib/music/types";
import type { Locale } from "@/lib/i18n";
import { getRelatedTracks } from "@/lib/music/catalog";

export type FlowSettings = {
  crossfade: number;
  normalize: boolean;
  hideExplicit: boolean;
  privateSession: boolean;
  remainingTime: boolean;
  voiceOn: boolean;
  eqBass: number;
  eqTreble: number;
  eqPreset: "flat" | "bass_boost" | "vocal" | "treble_boost" | "rock" | "pop" | "electronic" | "custom";
  autoplayRelated: boolean;
  lyricsFontSize: "sm" | "md" | "lg" | "xl";
  theme: "dark" | "light" | "oled";
  locale: Locale;
};

export const DEFAULT_SETTINGS: FlowSettings = {
  crossfade: 4,
  normalize: true,
  hideExplicit: false,
  privateSession: false,
  remainingTime: false,
  voiceOn: false,
  eqBass: 0,
  eqTreble: 0,
  eqPreset: "flat",
  autoplayRelated: true,
  lyricsFontSize: "md",
  theme: "dark",
  locale: "it",
};

const LIKED_KEY = "flow_liked_tracks";
const RECENT_KEY = "flow_recent_tracks";
const PLAYLISTS_KEY = "flow_playlists";
const VOLUME_KEY = "flow_volume";
const SETTINGS_KEY = "flow_settings";
const STATS_KEY = "flow_stats";
const PLAYS_KEY = "flow_plays";
const ARTISTS_KEY = "flow_artists";

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
  sleepEndOfTrack: boolean;
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
  showChat: boolean;
  cloudReady: boolean;
  stationOn: boolean;
  voiceDuck: boolean;
  plays: Record<string, number>;
  followedArtists: string[];
  profileName: string;
  hasSeenOnboarding: boolean;
  qrTarget: { title: string; subtitle: string; url: string; artwork?: string } | null;
  showVisualizer: boolean;

  setQrTarget: (target: { title: string; subtitle: string; url: string; artwork?: string } | null) => void;
  toggleVisualizer: () => void;
  setProfileName: (name: string) => void;
  dismissOnboarding: () => void;
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
  setSleepEndOfTrack: (v: boolean) => void;
  setShowFullPlayer: (v: boolean) => void;
  setShowQueue: (v: boolean) => void;
  setShowLyrics: (v: boolean) => void;
  setHideVideo: (v: boolean) => void;
  addToQueue: (track: Track) => void;
  appendQueue: (tracks: Track[]) => void;
  removeFromQueue: (index: number) => void;
  clearQueue: () => void;
  startStation: (seed: Track, more: Track[]) => void;
  setPlaylistFolder: (id: string, folder: string) => void;
  setPlaylistPublic: (id: string, publicId: string, collab: boolean) => void;
  toggleFollowArtist: (name: string) => void;
  bumpPlay: (artist: string) => void;
  toggleLike: (track: Track) => void;
  isLiked: (id: string) => boolean;
  createPlaylist: (title: string) => string | null;
  createPlaylistWithTracks: (title: string, tracks: Track[]) => string | null;
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
  setShowChat: (v: boolean) => void;
  setVoiceDuck: (v: boolean) => void;
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
  if (track.artist && track.artist !== "YouTube Music" && track.artist !== "Flow" && track.artist !== "Flow Music") return track;
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
  sleepEndOfTrack: false,
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
  showChat: false,
  cloudReady: false,
  stationOn: false,
  voiceDuck: false,
  plays: {},
  followedArtists: [],
  profileName: "Flow User",
  hasSeenOnboarding: true,
  qrTarget: null,
  showVisualizer: false,

  setQrTarget: (target) => set({ qrTarget: target }),
  toggleVisualizer: () => set((s) => ({ showVisualizer: !s.showVisualizer })),

  setProfileName: (name: string) => {
    writeJson("flow_profile_name", name);
    set({ profileName: name });
  },

  dismissOnboarding: () => {
    writeJson("flow_onboarding_done", true);
    set({ hasSeenOnboarding: true });
  },

  hydrate: () => {
    const liked = readJson<Track[]>(LIKED_KEY, []).map(sanitizeTrack);
    const recents = readJson<Track[]>(RECENT_KEY, []).map(sanitizeTrack);
    const playlists = readJson<Playlist[]>(PLAYLISTS_KEY, []);
    const volume = readJson<number>(VOLUME_KEY, 0.9);
    const settings = { ...DEFAULT_SETTINGS, ...readJson<Partial<FlowSettings>>(SETTINGS_KEY, {}) };
    const listenMs = readJson<number>(STATS_KEY, 0);
    const plays = readJson<Record<string, number>>(PLAYS_KEY, {});
    const followedArtists = readJson<string[]>(ARTISTS_KEY, []);
    const profileName = readJson<string>("flow_profile_name", "Flow User");
    const hasSeenOnboarding = readJson<boolean>("flow_onboarding_done", true);
    const trackMap: Record<string, Track> = {};
    for (const t of [...liked, ...recents]) trackMap[t.id] = t;
    set({ liked, recents, playlists, volume, trackMap, settings, listenMs, plays, followedArtists, profileName, hasSeenOnboarding });
  },

  playTrack: (track, queue) => {
    get().bumpPlay(track.artist);
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
        hideVideo: false,
        stationOn: false,
      });
      return;
    }
    const existing = get().queue;
    const found = existing.findIndex((t) => t.id === track.id);
    if (found >= 0) {
      set({ current: track, queueIndex: found, isPlaying: true, currentTime: 0, recents, hideVideo: false });
    } else {
      set({
        current: track,
        queue: [track, ...existing],
        queueIndex: 0,
        isPlaying: true,
        currentTime: 0,
        recents,
        hideVideo: false,
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
    const { queue, queueIndex, repeat, shuffle, settings, current } = get();
    if (!queue.length) return;
    let nextIndex: number;
    if (shuffle && queue.length > 1) {
      do {
        nextIndex = Math.floor(Math.random() * queue.length);
      } while (nextIndex === queueIndex);
    } else {
      nextIndex = queueIndex + 1;
      if (nextIndex >= queue.length) {
        if (repeat === "all") {
          nextIndex = 0;
        } else if (settings.autoplayRelated && current) {
          void getRelatedTracks({
            data: { artist: current.artist, title: current.title, excludeId: current.id, videoId: current.videoId },
          })
            .then((related) => {
              if (related && related.length) {
                const existingIds = new Set(get().queue.map((t) => t.id));
                const fresh = related.filter((t) => !existingIds.has(t.id));
                if (fresh.length) {
                  get().appendQueue(fresh);
                  get().next();
                } else {
                  set({ isPlaying: false });
                }
              } else {
                set({ isPlaying: false });
              }
            })
            .catch(() => set({ isPlaying: false }));
          return;
        } else {
          set({ isPlaying: false });
          return;
        }
      }
    }
    const track = queue[nextIndex];
    if (!track) return;
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
    if (get().sleepEndOfTrack) {
      set({ isPlaying: false, sleepEndOfTrack: false });
      get().notify("Timer completato (fine brano)");
      return;
    }
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
    set({ sleepEndsAt: minutes == null ? null : Date.now() + minutes * 60_000, sleepEndOfTrack: false }),
  setSleepEndOfTrack: (v) =>
    set({ sleepEndOfTrack: v, sleepEndsAt: null }),
  setShowFullPlayer: (v) => set({ showFullPlayer: v, showQueue: v ? get().showQueue : false }),
  setShowQueue: (v) => set({ showQueue: v, showLyrics: v ? false : get().showLyrics }),
  setShowLyrics: (v) => set({ showLyrics: v, showQueue: v ? false : get().showQueue }),
  setHideVideo: (v) => set({ hideVideo: v }),

  addToQueue: (track) => {
    set({ queue: [...get().queue, track], trackMap: { ...get().trackMap, [track.id]: track } });
    get().notify("Aggiunto in coda");
  },
  appendQueue: (tracks) => {
    const ids = new Set(get().queue.map((t) => t.id));
    const extra = tracks.filter((t) => !ids.has(t.id));
    if (!extra.length) return;
    set({ queue: [...get().queue, ...extra] });
  },
  startStation: (seed, more) => {
    const queue = [seed, ...more.filter((t) => t.id !== seed.id)];
    get().playTrack(seed, queue);
    set({ stationOn: true, showFullPlayer: true });
    get().notify("Radio avviata");
  },
  bumpPlay: (artist) => {
    if (!artist || get().settings.privateSession) return;
    const plays = { ...get().plays, [artist]: (get().plays[artist] || 0) + 1 };
    writeJson(PLAYS_KEY, plays);
    set({ plays });
  },
  toggleFollowArtist: (name) => {
    const n = name.trim();
    if (!n) return;
    const has = get().followedArtists.includes(n);
    const followedArtists = has ? get().followedArtists.filter((a) => a !== n) : [n, ...get().followedArtists];
    writeJson(ARTISTS_KEY, followedArtists);
    set({ followedArtists });
    get().notify(has ? "Non segui più l'artista" : "Artista seguito");
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
    if (!clean) return null;
    const id = `pl_${Date.now()}`;
    const playlists = [{ id, title: clean, createdAt: Date.now(), trackIds: [] }, ...get().playlists];
    writeJson(PLAYLISTS_KEY, playlists);
    set({ playlists });
    get().notify("Playlist creata");
    return id;
  },
  createPlaylistWithTracks: (title, tracks) => {
    const clean = title.trim() || "Playlist importata";
    const id = `pl_${Date.now()}`;
    const trackMap = { ...get().trackMap };
    for (const t of tracks) trackMap[t.id] = t;
    const playlists = [
      { id, title: clean, createdAt: Date.now(), trackIds: tracks.map((t) => t.id) },
      ...get().playlists,
    ];
    writeJson(PLAYLISTS_KEY, playlists);
    set({ playlists, trackMap });
    get().notify(`${tracks.length} brani importati`);
    return id;
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
  setPlaylistFolder: (id, folder) => {
    const playlists = get().playlists.map((p) => (p.id === id ? { ...p, folder: folder.trim() || undefined } : p));
    writeJson(PLAYLISTS_KEY, playlists);
    set({ playlists });
  },
  setPlaylistPublic: (id, publicId, collab) => {
    const playlists = get().playlists.map((p) => (p.id === id ? { ...p, publicId, collab } : p));
    writeJson(PLAYLISTS_KEY, playlists);
    set({ playlists });
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
  setShowChat: (v) => set({ showChat: v }),
  setVoiceDuck: (v) => set({ voiceDuck: v }),
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
