export type TrackSource = "ytmusic" | "radio";

export interface Track {
  id: string;
  title: string;
  artist: string;
  album?: string;
  artwork: string;
  duration: number;
  streamUrl: string;
  source: TrackSource;
  videoId?: string;
  isLive?: boolean;
  isPreview?: boolean;
  explicit?: boolean;
}

export interface RadioStation {
  id: string;
  name: string;
  country: string;
  countryCode: string;
  city?: string;
  tags: string;
  artwork: string;
  streamUrl: string;
  bitrate?: number;
  votes?: number;
}

export interface Playlist {
  id: string;
  title: string;
  createdAt: number;
  trackIds: string[];
}

export type RepeatMode = "off" | "all" | "one";

export const GENRES: { id: string; name: string; query: string }[] = [
  { id: "pop", name: "Pop", query: "pop hits official audio" },
  { id: "rap", name: "Rap & Hip Hop", query: "rap hip hop official audio" },
  { id: "dance", name: "Dance", query: "dance edm official audio" },
  { id: "rock", name: "Rock", query: "rock anthems official audio" },
  { id: "latin", name: "Reggaeton", query: "reggaeton latin official audio" },
  { id: "rnb", name: "R&B", query: "rnb soul official audio" },
  { id: "jazz", name: "Jazz", query: "jazz official audio" },
  { id: "electro", name: "Electro", query: "electronic official audio" },
  { id: "classical", name: "Classica", query: "classical piano official" },
  { id: "metal", name: "Metal", query: "metal official audio" },
  { id: "reggae", name: "Reggae", query: "reggae official audio" },
  { id: "country", name: "Country", query: "country hits official audio" },
];

export const CHARTS: { id: string; title: string; query: string; playlistId?: string }[] = [
  {
    id: "global",
    title: "Global Top",
    query: "top music videos this week",
    playlistId: "PL4fGSI1pDJn69On1f-8NAvX_CYlx7QyZc",
  },
  { id: "italia", title: "Italia", query: "hit italia 2026 official" },
  { id: "usa", title: "Stati Uniti", query: "billboard hot 100 official audio" },
  { id: "uk", title: "Regno Unito", query: "uk top 40 official audio" },
  {
    id: "latino",
    title: "Latino",
    query: "latin hits official audio",
    playlistId: "PL4fGSI1pDJn5O8siDeZuI_4hbk6JWtTX1",
  },
  { id: "kpop", title: "K-Pop", query: "kpop hits official mv" },
  { id: "afrobeats", title: "Afrobeats", query: "afrobeats official audio" },
  { id: "france", title: "Francia", query: "top france official audio" },
  { id: "brazil", title: "Brasile", query: "top brazil funk official" },
  {
    id: "viral",
    title: "Virali",
    query: "viral music this week",
    playlistId: "PL4fGSI1pDJn61unMfmrUSz68RT8IFFnks",
  },
];

export const RADIO_COUNTRIES: { code: string; name: string }[] = [
  { code: "IT", name: "Italia" },
  { code: "US", name: "Stati Uniti" },
  { code: "GB", name: "Regno Unito" },
  { code: "FR", name: "Francia" },
  { code: "DE", name: "Germania" },
  { code: "ES", name: "Spagna" },
  { code: "BR", name: "Brasile" },
  { code: "JP", name: "Giappone" },
  { code: "KR", name: "Corea" },
  { code: "MX", name: "Messico" },
  { code: "IN", name: "India" },
  { code: "NG", name: "Nigeria" },
  { code: "AU", name: "Australia" },
  { code: "AR", name: "Argentina" },
  { code: "CA", name: "Canada" },
  { code: "TR", name: "Turchia" },
];

export const MOODS = [
  { id: "workout", label: "Allenamento", prompt: "high energy workout hip hop edm official audio" },
  { id: "night", label: "Notte", prompt: "late night rnb lo-fi chill official audio" },
  { id: "party", label: "Festa", prompt: "party dance club hits official audio" },
  { id: "focus", label: "Focus", prompt: "focus study instrumental lo-fi official audio" },
  { id: "sad", label: "Malinconia", prompt: "sad emotional ballads official audio" },
  { id: "summer", label: "Estate", prompt: "summer latin reggae tropical official audio" },
] as const;

export const FALLBACK_ART = "/artwork-fallback.svg";
