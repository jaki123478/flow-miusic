import { useFlowStore } from "@/stores/flow-store";

export type Locale = "it" | "en";

const dict = {
  it: {
    home: "Home",
    search: "Cerca",
    radio: "Radio",
    library: "Libreria",
    login: "Accedi",
    signup: "Registrati",
    logout: "Esci",
    settings: "Impostazioni",
    discover: "Scopri",
    fresh: "Novità",
    stats: "Le tue stats",
    friends: "Amici",
    liked: "Preferiti",
    recents: "Recenti",
    playlists: "Playlist",
    createPlaylist: "Nuova playlist",
    importFrom: "Importa playlist",
    importHint: "Spotify, YouTube, Apple Music o lista Artista – Titolo",
    importBtn: "Importa",
    publish: "Rendi pubblica",
    collab: "Collaborativa",
    folder: "Cartella",
    export: "Esporta",
    theme: "Tema",
    dark: "Scuro",
    light: "Chiaro",
    language: "Lingua",
    follow: "Segui",
    following: "Segui già",
    startRadio: "Radio da questo brano",
    share: "Condividi",
    queue: "Coda",
    lyrics: "Testi",
  },
  en: {
    home: "Home",
    search: "Search",
    radio: "Radio",
    library: "Library",
    login: "Log in",
    signup: "Sign up",
    logout: "Log out",
    settings: "Settings",
    discover: "Discover",
    fresh: "New",
    stats: "Your stats",
    friends: "Friends",
    liked: "Liked",
    recents: "Recent",
    playlists: "Playlists",
    createPlaylist: "New playlist",
    importFrom: "Import playlist",
    importHint: "Spotify, YouTube, Apple Music, or Artist – Title list",
    importBtn: "Import",
    publish: "Make public",
    collab: "Collaborative",
    folder: "Folder",
    export: "Export",
    theme: "Theme",
    dark: "Dark",
    light: "Light",
    language: "Language",
    follow: "Follow",
    following: "Following",
    startRadio: "Go to song radio",
    share: "Share",
    queue: "Queue",
    lyrics: "Lyrics",
  },
} as const;

export type Msg = keyof typeof dict.it;

export function t(locale: Locale, key: Msg): string {
  return dict[locale][key] ?? dict.it[key];
}

export function useT() {
  const locale = useFlowStore((s) => s.settings.locale);
  return (key: Msg) => t(locale, key);
}
