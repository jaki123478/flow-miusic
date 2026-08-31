import { o as __toESM } from "../_runtime.mjs";
import { H as require_react, S as require_jsx_runtime, _ as createRootRoute, b as useNavigate, d as useRouterState, g as createFileRoute, h as lazyRouteComponent, l as Scripts, m as Outlet, p as createRouter, u as HeadContent, v as Link, x as useRouter, y as Navigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { c as __exportAll, r as createServerFn } from "./ssr.mjs";
import { n as FALLBACK_ART, r as GENRES, t as CHARTS } from "./types-CuQ6ClJX.mjs";
import { c as getHomeFeed, d as getTrackLyrics, f as getVideoTrack, i as getCountryRadios, l as getRelatedTracks, m as stationToTrack, n as createSsrRpc, r as getChartTracks, s as getGenreMix, u as getTopRadios } from "./lyrics-DWcjsahh.mjs";
import { L as string, N as number, P as object, R as union, j as literal } from "../_libs/@better-auth/core+[...].mjs";
import { i as signOut, t as authClient } from "./client-BjgLBM44.mjs";
import { t as authMiddleware } from "./middleware-DuFXNrDi.mjs";
import { n as auth } from "./server-BrgPxt8O.mjs";
import { t as getAudioUrl } from "./ytmusic.server-DNnXosk4.mjs";
import { A as House, C as Moon, D as ListPlus, I as Compass, L as ChevronDown, M as Gauge, N as Ellipsis, O as ListMusic, P as Download, R as Bot, S as Pause, T as MicVocal, _ as Repeat, b as Plus, d as SkipBack, f as Shuffle, g as Search, h as Send, i as Volume2, j as Heart, k as Library, l as Sparkles, m as Settings, n as VolumeX, o as Trophy, p as Share2, r as VolumeOff, s as TriangleAlert, t as X, u as SkipForward, v as Repeat1, w as Mic, x as Play, y as Radio } from "../_libs/lucide-react.mjs";
import { t as clsx } from "../_libs/clsx.mjs";
import { t as twMerge } from "../_libs/tailwind-merge.mjs";
import { t as create } from "../_libs/zustand.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/share-4dCH3iuD.js
var publishPlaylist = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((d) => d).handler(createSsrRpc("eb715264cb14916343622bdad7fc98482b5f416cefea1798c071844e56a8e606"));
var getSharedPlaylist = createServerFn({ method: "GET" }).validator((d) => d).handler(createSsrRpc("38bf62ce71e0190290db930d5798ef4ee437b20a1cdff3eee56aecfdfcf321b3"));
var addSharedTrack = createServerFn({ method: "POST" }).validator((d) => d).handler(createSsrRpc("b3740a781b8c2931661ba664483641862702a657b02d31b78df7cf3880636cc4"));
var listUserPlaylists = createServerFn({ method: "GET" }).validator((d) => d).handler(createSsrRpc("1d774a97ddc65e6ea8fa4d8de5564851dac8d347f4da7748d684e9a06fd845d9"));
var followUser = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((d) => d).handler(createSsrRpc("d10a7b663b69d3e1af86f8323b415e9018c2157846c363d760b3b1d7cc8ba126"));
createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((d) => d).handler(createSsrRpc("2c5986bfbbc1fec6871fbfb28bb0e161830c733aab33519ddc02a3fe26bff3bd"));
var listFriendsFeed = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(createSsrRpc("348717c0bc10e27730f609890bfe31e7973d38f21f4d1e318fb4699d08d7b865"));
//#endregion
//#region node_modules/.nitro/vite/services/ssr/assets/router-DJJizgqk.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function AppErrorComponent({ error }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "flex min-h-screen flex-col items-center justify-center gap-3 px-6 text-center bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-red-500",
				"aria-hidden": "true",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, {
					className: "size-10",
					strokeWidth: 2
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "text-lg font-semibold",
				children: "Something went wrong"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "max-w-md text-sm break-words text-zinc-500 dark:text-zinc-400",
				children: error.message || "An unexpected error occurred. Try reloading the page."
			})
		]
	});
}
/**
* App-wide client provider mounted once near the root (in `src/routes/__root.tsx`):
*
*   <AuthProvider><Outlet /></AuthProvider>
*
* Better Auth's React client (`@/lib/auth/client`) needs NO context provider —
* its `useSession()` works standalone — so this is a passthrough today. It's
* kept as the single, stable mount point for any future client-side providers
* (e.g. a toast or theme provider) without churning the root shell.
*/
function AuthProvider({ children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_jsx_runtime.Fragment, { children });
}
function isGrokEmbedderOrigin(origin) {
	try {
		const url = new URL(origin);
		if (url.protocol !== "https:" && url.protocol !== "http:") return false;
		const host = url.hostname.toLowerCase();
		if (host === "grok.com" || host.endsWith(".grok.com")) return true;
		if (host === "localhost" || host === "127.0.0.1" || host === "[::1]") return true;
		return false;
	} catch {
		return false;
	}
}
function isSandboxPreviewGuestHost(hostname) {
	const host = hostname.toLowerCase();
	return host === "grok-sandbox.com" || host.endsWith(".grok-sandbox.com");
}
function isRemintPreviewPair(guestHost, parentHost) {
	const guest = guestHost.toLowerCase();
	const parent = parentHost.toLowerCase();
	const i = guest.indexOf(".preview.");
	if (i <= 0) return false;
	const label = guest.slice(0, i);
	const rest = guest.slice(i + 9);
	if (label.includes(".") || !rest.includes(".")) return false;
	return parent === rest || parent === `grok.${rest}`;
}
function resolveParentEmbedderOrigin(parentIsSelf, referrer, ancestorOrigin, guestHostname = "") {
	if (parentIsSelf) return null;
	for (const candidate of [referrer, ancestorOrigin ?? ""].filter(Boolean)) try {
		const url = new URL(candidate.includes("://") ? candidate : `https://${candidate}`);
		if (url.protocol !== "https:" && url.protocol !== "http:") continue;
		if (isGrokEmbedderOrigin(url.origin)) return url.origin;
		if (isSandboxPreviewGuestHost(guestHostname) || isRemintPreviewPair(guestHostname, url.hostname)) return url.origin;
	} catch {}
	return null;
}
/**
* Guest side of the grok-web ↔ sandbox preview postMessage bridge.
*
* Activates only when this page is framed by an allowlisted Grok embedder.
* Top-level runs (download/export, local `npm run dev`, deployed sites) noop.
*/
var PREVIEW_BRIDGE_CHANNEL = "grok-preview-bridge";
var EnvelopeSchema = object({
	channel: literal(PREVIEW_BRIDGE_CHANNEL),
	version: number().int().positive(),
	type: string().min(1)
});
var HelloSchema = EnvelopeSchema.extend({ type: literal("hello") });
var NavigateSchema = EnvelopeSchema.extend({
	type: literal("navigate"),
	path: string().min(1)
});
var HistorySchema = EnvelopeSchema.extend({
	type: literal("history"),
	delta: union([literal(-1), literal(1)])
});
function isSafeBridgePath(path) {
	if (!path.startsWith("/") || path.startsWith("//") || path.includes("\\")) return false;
	try {
		return new URL(path, "https://preview.invalid").origin === "https://preview.invalid";
	} catch {
		return false;
	}
}
/**
* Install host↔guest messaging. Returns a dispose function.
* Noops (returns a no-op dispose) when not embedded under a Grok parent.
*/
function installPreviewHostBridge(options = {}) {
	if (typeof window === "undefined") return () => {};
	const ancestorOrigin = typeof location.ancestorOrigins !== "undefined" && location.ancestorOrigins.length > 0 ? location.ancestorOrigins[0] : null;
	const parentOrigin = resolveParentEmbedderOrigin(window.parent === window, document.referrer, ancestorOrigin, window.location.hostname);
	if (parentOrigin === null) return () => {};
	const ROOT_STATE_KEY = "__grokPreviewBridgeRoot";
	const originalPushState = window.history.pushState.bind(window.history);
	const originalReplaceState = window.history.replaceState.bind(window.history);
	const isAtHistoryRoot = () => {
		const state = window.history.state;
		return Boolean(state && typeof state === "object" && state[ROOT_STATE_KEY] === true);
	};
	try {
		const current = window.history.state;
		if (!(current !== null && typeof current === "object" && Object.prototype.hasOwnProperty.call(current, ROOT_STATE_KEY))) {
			const isRoot = window.history.length <= 1;
			originalReplaceState(current && typeof current === "object" ? {
				...current,
				[ROOT_STATE_KEY]: isRoot
			} : { [ROOT_STATE_KEY]: isRoot }, "", window.location.href);
		}
	} catch {}
	const post = (message) => {
		window.parent.postMessage(message, parentOrigin);
	};
	const reportLocation = () => {
		post({
			channel: PREVIEW_BRIDGE_CHANNEL,
			version: 1,
			type: "location",
			path: window.location.pathname || "/",
			search: window.location.search,
			hash: window.location.hash
		});
	};
	const reportRoutes = () => {
		const paths = options.getRoutePaths?.() ?? [];
		post({
			channel: PREVIEW_BRIDGE_CHANNEL,
			version: 1,
			type: "routes",
			paths
		});
	};
	const defaultNavigate = (path) => {
		if (!isSafeBridgePath(path)) return;
		try {
			const url = new URL(path, window.location.origin);
			if (url.origin !== window.location.origin) return;
			const next = `${url.pathname}${url.search}${url.hash}`;
			window.history.pushState(window.history.state, "", next);
			window.dispatchEvent(new PopStateEvent("popstate", { state: window.history.state }));
		} catch {}
	};
	const navigate = (path) => {
		if (!isSafeBridgePath(path)) return;
		if (options.navigate) {
			options.navigate(path);
			return;
		}
		defaultNavigate(path);
	};
	const announce = () => {
		reportLocation();
		reportRoutes();
		post({
			channel: PREVIEW_BRIDGE_CHANNEL,
			version: 1,
			type: "ready"
		});
	};
	const onMessage = (event) => {
		if (event.source !== window.parent) return;
		if (event.origin !== parentOrigin) return;
		const envelope = EnvelopeSchema.safeParse(event.data);
		if (!envelope.success || envelope.data.version !== 1) return;
		if (envelope.data.type === "hello") {
			if (!HelloSchema.safeParse(event.data).success) return;
			announce();
			return;
		}
		if (envelope.data.type === "navigate") {
			const parsed = NavigateSchema.safeParse(event.data);
			if (!parsed.success) return;
			navigate(parsed.data.path);
			queueMicrotask(reportLocation);
			return;
		}
		if (envelope.data.type === "history") {
			const parsed = HistorySchema.safeParse(event.data);
			if (!parsed.success) return;
			if (parsed.data.delta === -1 && isAtHistoryRoot()) return;
			window.history.go(parsed.data.delta);
		}
	};
	const onPopState = () => {
		reportLocation();
	};
	const onHashChange = () => {
		reportLocation();
	};
	window.history.pushState = (data, unused, url) => {
		const next = data && typeof data === "object" ? {
			...data,
			[ROOT_STATE_KEY]: false
		} : data;
		originalPushState(next, unused, url);
		reportLocation();
	};
	window.history.replaceState = (data, unused, url) => {
		const next = isAtHistoryRoot() ? {
			...data && typeof data === "object" ? data : {},
			[ROOT_STATE_KEY]: true
		} : data;
		originalReplaceState(next, unused, url);
		reportLocation();
	};
	window.addEventListener("message", onMessage);
	window.addEventListener("popstate", onPopState);
	window.addEventListener("hashchange", onHashChange);
	announce();
	return () => {
		window.removeEventListener("message", onMessage);
		window.removeEventListener("popstate", onPopState);
		window.removeEventListener("hashchange", onHashChange);
		window.history.pushState = originalPushState;
		window.history.replaceState = originalReplaceState;
	};
}
/** Collect static path patterns from a TanStack route tree (best-effort). */
function collectRoutePathsFromTree(routeTree) {
	const paths = /* @__PURE__ */ new Set();
	const walk = (node) => {
		if (!node || typeof node !== "object") return;
		const record = node;
		const full = typeof record.fullPath === "string" ? record.fullPath : typeof record.path === "string" ? record.path : null;
		if (full !== null && full !== "") paths.add(full.startsWith("/") ? full : `/${full}`);
		else if (full === "") paths.add("/");
		const children = record.children;
		if (Array.isArray(children)) for (const child of children) walk(child);
		else if (children && typeof children === "object") for (const child of Object.values(children)) walk(child);
	};
	walk(routeTree);
	return [...paths];
}
/**
* Mount once in `__root.tsx` so the Grok preview chrome can drive navigation
* (and later receive registered routes). Noops when the app is not embedded.
*/
function PreviewHostBridge() {
	const router = useRouter();
	(0, import_react.useEffect)(() => {
		return installPreviewHostBridge({
			navigate: (path) => {
				router.history.push(path);
			},
			getRoutePaths: () => collectRoutePathsFromTree(router.routeTree)
		});
	}, [router]);
	return null;
}
/**
* Current user + loading state. Same behavior in live preview and when deployed:
*   - Auth enabled -> the real signed-in user; `user` is `null` while
*                            the session resolves (`isPending: true`) and when
*                            signed out (`isPending: false`). Session comes from
*                            Better Auth `useSession()` → `/api/auth/get-session`
*                            (cookie when deployed; bearer in live preview).
*   - Auth disabled (`VITE_AUTH_ENABLED=false`) -> `DEV_USER`, never pending.
*
* Protect a route by waiting out `isPending` before acting on `user` —
* redirecting on `user: null` alone bounces signed-in visitors to sign-in on
* every hard reload:
*
*   import { RedirectToSignIn } from "@/lib/auth/gates";
*   const { user, isPending } = useCurrentUserState();
*   if (isPending) return null;              // still resolving — don't redirect yet
*   if (!user) return <RedirectToSignIn />;  // definitely signed out
*
* `authEnabled` is a module-level constant fixed at load, so the guarded hook
* call keeps a stable hook order across every render of a given component.
*/
function useCurrentUserState() {
	const { data, isPending } = authClient.useSession();
	const user = data?.user;
	return {
		user: user ? {
			id: user.id,
			displayName: user.name ?? null,
			primaryEmail: user.email ?? null,
			profileImageUrl: user.image ?? null,
			isDevFallback: false
		} : null,
		isPending
	};
}
/**
* Convenience view of `useCurrentUserState().user` for display (e.g.
* `user?.displayName ?? "Guest"`). NOTE: `null` means *loading OR signed out* —
* for redirects/guards use `useCurrentUserState()` and check `isPending`.
*/
function useCurrentUser() {
	return useCurrentUserState().user;
}
function cn(...inputs) {
	return twMerge(clsx(inputs));
}
function formatTime(seconds) {
	if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
	return `${Math.floor(seconds / 60)}:${Math.floor(seconds % 60).toString().padStart(2, "0")}`;
}
function greetingIt(date = /* @__PURE__ */ new Date()) {
	const h = date.getHours();
	if (h < 5) return "Buona notte";
	if (h < 13) return "Buongiorno";
	if (h < 18) return "Buon pomeriggio";
	return "Buonasera";
}
function hashHue(input) {
	let h = 0;
	for (let i = 0; i < input.length; i++) h = h * 31 + input.charCodeAt(i) | 0;
	return Math.abs(h) % 360;
}
function useOpenTransition(show, ms = 280) {
	const [mounted, setMounted] = (0, import_react.useState)(show);
	const [open, setOpen] = (0, import_react.useState)(show);
	(0, import_react.useEffect)(() => {
		if (show) {
			setMounted(true);
			const id = window.requestAnimationFrame(() => {
				window.requestAnimationFrame(() => setOpen(true));
			});
			return () => window.cancelAnimationFrame(id);
		}
		setOpen(false);
		const reduced = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
		const t = window.setTimeout(() => setMounted(false), reduced ? 0 : ms);
		return () => window.clearTimeout(t);
	}, [show, ms]);
	return {
		mounted,
		open
	};
}
var DEFAULT_SETTINGS = {
	crossfade: 4,
	normalize: true,
	hideExplicit: false,
	privateSession: false,
	remainingTime: false,
	voiceOn: false,
	eqBass: 0,
	eqTreble: 0,
	theme: "dark",
	locale: "it"
};
var LIKED_KEY = "flow_liked_tracks";
var RECENT_KEY = "flow_recent_tracks";
var PLAYLISTS_KEY = "flow_playlists";
var VOLUME_KEY = "flow_volume";
var SETTINGS_KEY = "flow_settings";
var STATS_KEY = "flow_stats";
var PLAYS_KEY = "flow_plays";
var ARTISTS_KEY = "flow_artists";
function readJson(key, fallback) {
	if (typeof window === "undefined") return fallback;
	try {
		const raw = localStorage.getItem(key);
		return raw ? JSON.parse(raw) : fallback;
	} catch {
		return fallback;
	}
}
function writeJson(key, value) {
	if (typeof window === "undefined") return;
	try {
		localStorage.setItem(key, JSON.stringify(value));
	} catch {}
}
function remember$1(track, recents, privateSession) {
	if (privateSession) return recents;
	return [track, ...recents.filter((t) => t.id !== track.id)].slice(0, 80);
}
function sanitizeTrack(track) {
	if (track.artist && track.artist !== "YouTube Music" && track.artist !== "SimpMusic") return track;
	const dash = track.title.match(/^(.{2,48}?)\s+[-–—]\s+(.+)$/);
	if (dash) return {
		...track,
		artist: dash[1].trim(),
		title: dash[2].trim()
	};
	return {
		...track,
		artist: track.artist === "YouTube Music" ? "Artista" : track.artist
	};
}
var useFlowStore = create((set, get) => ({
	current: null,
	queue: [],
	queueIndex: 0,
	isPlaying: false,
	currentTime: 0,
	duration: 0,
	volume: .9,
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
	showChat: false,
	cloudReady: false,
	stationOn: false,
	voiceDuck: false,
	plays: {},
	followedArtists: [],
	hydrate: () => {
		const liked = readJson(LIKED_KEY, []).map(sanitizeTrack);
		const recents = readJson(RECENT_KEY, []).map(sanitizeTrack);
		const playlists = readJson(PLAYLISTS_KEY, []);
		const volume = readJson(VOLUME_KEY, .9);
		const settings = {
			...DEFAULT_SETTINGS,
			...readJson(SETTINGS_KEY, {})
		};
		const listenMs = readJson(STATS_KEY, 0);
		const plays = readJson(PLAYS_KEY, {});
		const followedArtists = readJson(ARTISTS_KEY, []);
		const trackMap = {};
		for (const t of [...liked, ...recents]) trackMap[t.id] = t;
		set({
			liked,
			recents,
			playlists,
			volume,
			trackMap,
			settings,
			listenMs,
			plays,
			followedArtists
		});
	},
	playTrack: (track, queue) => {
		get().bumpPlay(track.artist);
		const recents = remember$1(track, get().recents, get().settings.privateSession);
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
				stationOn: false
			});
			return;
		}
		const existing = get().queue;
		const found = existing.findIndex((t) => t.id === track.id);
		if (found >= 0) set({
			current: track,
			queueIndex: found,
			isPlaying: true,
			currentTime: 0,
			recents,
			hideVideo: false
		});
		else set({
			current: track,
			queue: [track, ...existing],
			queueIndex: 0,
			isPlaying: true,
			currentTime: 0,
			recents,
			hideVideo: false
		});
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
		set({
			queue: next,
			trackMap: {
				...get().trackMap,
				[track.id]: track
			}
		});
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
		let nextIndex;
		if (shuffle && queue.length > 1) do
			nextIndex = Math.floor(Math.random() * queue.length);
		while (nextIndex === queueIndex);
		else {
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
		const recents = remember$1(track, get().recents, get().settings.privateSession);
		writeJson(RECENT_KEY, recents);
		set({
			current: track,
			queueIndex: nextIndex,
			currentTime: 0,
			isPlaying: true,
			recents,
			seekVersion: get().seekVersion + 1
		});
	},
	onEnded: () => {
		if (get().repeat === "one") {
			set({
				currentTime: 0,
				isPlaying: true,
				seekVersion: get().seekVersion + 1
			});
			return;
		}
		get().next();
	},
	prev: () => {
		const { queue, queueIndex, currentTime } = get();
		if (currentTime > 3) {
			set({
				currentTime: 0,
				seekVersion: get().seekVersion + 1
			});
			return;
		}
		const prevIndex = queueIndex <= 0 ? 0 : queueIndex - 1;
		const track = queue[prevIndex];
		if (!track) return;
		set({
			current: track,
			queueIndex: prevIndex,
			currentTime: 0,
			isPlaying: true,
			seekVersion: get().seekVersion + 1
		});
	},
	skipBy: (delta) => {
		const { current, currentTime, duration } = get();
		if (!current || current.isLive) return;
		const max = duration > 0 ? duration : currentTime + Math.abs(delta);
		set({
			currentTime: Math.max(0, Math.min(max, currentTime + delta)),
			seekVersion: get().seekVersion + 1
		});
	},
	seek: (time) => set({
		currentTime: Math.max(0, time),
		seekVersion: get().seekVersion + 1
	}),
	setCurrentTime: (time) => set({ currentTime: time }),
	setDuration: (d) => set({ duration: d }),
	setVolume: (v) => {
		const volume = Math.min(1, Math.max(0, v));
		writeJson(VOLUME_KEY, volume);
		set({
			volume,
			isMuted: volume === 0
		});
	},
	toggleMute: () => set({ isMuted: !get().isMuted }),
	toggleShuffle: () => set({ shuffle: !get().shuffle }),
	cycleRepeat: () => {
		const order = [
			"off",
			"all",
			"one"
		];
		set({ repeat: order[(order.indexOf(get().repeat) + 1) % order.length] });
	},
	setPlaybackRate: (r) => set({ playbackRate: r }),
	setSleep: (minutes) => set({ sleepEndsAt: minutes == null ? null : Date.now() + minutes * 6e4 }),
	setShowFullPlayer: (v) => set({
		showFullPlayer: v,
		showQueue: v ? get().showQueue : false
	}),
	setShowQueue: (v) => set({
		showQueue: v,
		showLyrics: v ? false : get().showLyrics
	}),
	setShowLyrics: (v) => set({
		showLyrics: v,
		showQueue: v ? false : get().showQueue
	}),
	setHideVideo: (v) => set({ hideVideo: v }),
	addToQueue: (track) => {
		set({
			queue: [...get().queue, track],
			trackMap: {
				...get().trackMap,
				[track.id]: track
			}
		});
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
		set({
			stationOn: true,
			showFullPlayer: true
		});
		get().notify("Radio avviata");
	},
	bumpPlay: (artist) => {
		if (!artist || get().settings.privateSession) return;
		const plays = {
			...get().plays,
			[artist]: (get().plays[artist] || 0) + 1
		};
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
		set({
			queue,
			queueIndex: Math.max(0, Math.min(queueIndex, Math.max(0, queue.length - 1)))
		});
	},
	clearQueue: () => {
		const current = get().current;
		set({
			queue: current ? [current] : [],
			queueIndex: 0
		});
	},
	toggleLike: (track) => {
		const liked = get().liked;
		const exists = liked.some((t) => t.id === track.id);
		const next = exists ? liked.filter((t) => t.id !== track.id) : [track, ...liked];
		writeJson(LIKED_KEY, next);
		set({
			liked: next,
			trackMap: {
				...get().trackMap,
				[track.id]: track
			}
		});
		get().notify(exists ? "Rimosso dai preferiti" : "Aggiunto ai preferiti");
	},
	isLiked: (id) => get().liked.some((t) => t.id === id),
	createPlaylist: (title) => {
		const clean = title.trim();
		if (!clean) return null;
		const id = `pl_${Date.now()}`;
		const playlists = [{
			id,
			title: clean,
			createdAt: Date.now(),
			trackIds: []
		}, ...get().playlists];
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
		const playlists = [{
			id,
			title: clean,
			createdAt: Date.now(),
			trackIds: tracks.map((t) => t.id)
		}, ...get().playlists];
		writeJson(PLAYLISTS_KEY, playlists);
		set({
			playlists,
			trackMap
		});
		get().notify(`${tracks.length} brani importati`);
		return id;
	},
	addToPlaylist: (playlistId, track) => {
		const playlists = get().playlists.map((p) => p.id === playlistId && !p.trackIds.includes(track.id) ? {
			...p,
			trackIds: [...p.trackIds, track.id]
		} : p);
		writeJson(PLAYLISTS_KEY, playlists);
		set({
			playlists,
			trackMap: {
				...get().trackMap,
				[track.id]: track
			}
		});
		get().notify("Salvato in playlist");
	},
	removeFromPlaylist: (playlistId, trackId) => {
		const playlists = get().playlists.map((p) => p.id === playlistId ? {
			...p,
			trackIds: p.trackIds.filter((id) => id !== trackId)
		} : p);
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
		const playlists = get().playlists.map((p) => p.id === id ? {
			...p,
			title: clean
		} : p);
		writeJson(PLAYLISTS_KEY, playlists);
		set({ playlists });
	},
	duplicatePlaylist: (id) => {
		const src = get().playlists.find((p) => p.id === id);
		if (!src) return;
		const playlists = [{
			...src,
			id: `pl_${Date.now()}`,
			title: `${src.title} (copia)`,
			createdAt: Date.now()
		}, ...get().playlists];
		writeJson(PLAYLISTS_KEY, playlists);
		set({ playlists });
		get().notify("Playlist duplicata");
	},
	setPlaylistFolder: (id, folder) => {
		const playlists = get().playlists.map((p) => p.id === id ? {
			...p,
			folder: folder.trim() || void 0
		} : p);
		writeJson(PLAYLISTS_KEY, playlists);
		set({ playlists });
	},
	setPlaylistPublic: (id, publicId, collab) => {
		const playlists = get().playlists.map((p) => p.id === id ? {
			...p,
			publicId,
			collab
		} : p);
		writeJson(PLAYLISTS_KEY, playlists);
		set({ playlists });
	},
	moveQueue: (from, to) => {
		const queue = [...get().queue];
		if (from < 0 || to < 0 || from >= queue.length || to >= queue.length) return;
		const [item] = queue.splice(from, 1);
		queue.splice(to, 0, item);
		const currentId = get().current?.id;
		set({
			queue,
			queueIndex: currentId ? Math.max(0, queue.findIndex((t) => t.id === currentId)) : get().queueIndex
		});
	},
	clearRecents: () => {
		writeJson(RECENT_KEY, []);
		set({ recents: [] });
	},
	setActionTrack: (track) => set({ actionTrack: track }),
	patchSettings: (partial) => {
		const settings = {
			...get().settings,
			...partial
		};
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
		const settings = {
			...get().settings,
			...data.settings ?? {}
		};
		const volume = typeof data.volume === "number" ? data.volume : get().volume;
		const listenMs = typeof data.listenMs === "number" ? data.listenMs : get().listenMs;
		const trackMap = { ...get().trackMap };
		for (const t of [...liked, ...recents]) trackMap[t.id] = t;
		writeJson(LIKED_KEY, liked);
		writeJson(RECENT_KEY, recents);
		writeJson(PLAYLISTS_KEY, playlists);
		writeJson(SETTINGS_KEY, settings);
		writeJson(VOLUME_KEY, volume);
		writeJson(STATS_KEY, listenMs);
		set({
			liked,
			recents,
			playlists,
			settings,
			volume,
			listenMs,
			trackMap,
			cloudReady: true
		});
	},
	dumpCloud: () => {
		const s = get();
		return {
			liked: s.liked,
			recents: s.recents,
			playlists: s.playlists,
			settings: s.settings,
			volume: s.volume,
			listenMs: s.listenMs
		};
	}
}));
function exponentialDelay(attempt, opts = {}) {
	const base = opts.baseMs ?? 400;
	const max = opts.maxMs ?? 12e3;
	const factor = opts.factor ?? 2;
	const jitter = opts.jitter ?? .25;
	const exp = Math.min(max, base * factor ** Math.max(0, attempt));
	const spread = exp * jitter;
	return Math.round(exp - spread + Math.random() * spread * 2);
}
function sleep(ms) {
	return new Promise((resolve) => {
		setTimeout(resolve, ms);
	});
}
async function withBackoff(task, opts = {}) {
	const maxAttempts = opts.maxAttempts ?? 5;
	let last;
	for (let attempt = 0; attempt < maxAttempts; attempt++) try {
		return await task(attempt);
	} catch (err) {
		last = err;
		if (attempt >= maxAttempts - 1) break;
		await sleep(exponentialDelay(attempt, opts));
	}
	throw last instanceof Error ? last : /* @__PURE__ */ new Error("retry failed");
}
var mem = /* @__PURE__ */ new Map();
var inflight = /* @__PURE__ */ new Map();
var pinned = /* @__PURE__ */ new Set();
var AUDIO_CACHE = "flow-audio-v1";
var META_KEY = "flow_download_meta";
var EVENT = "flow-downloads";
function trimMem() {
	while (mem.size > 12) {
		const id = [...mem.keys()].find((k) => !pinned.has(k));
		if (!id) break;
		const url = mem.get(id);
		if (url) URL.revokeObjectURL(url);
		mem.delete(id);
	}
}
function remember(id, url, pin = false) {
	const prev = mem.get(id);
	if (prev && prev !== url) URL.revokeObjectURL(prev);
	mem.set(id, url);
	if (pin) pinned.add(id);
	trimMem();
}
function cachedAudioUrl(id) {
	return mem.get(id);
}
function isDownloaded(id) {
	if (!id) return false;
	if (pinned.has(id)) return true;
	if (typeof window === "undefined") return false;
	return Boolean(readMeta()[id]);
}
function readMeta() {
	if (typeof window === "undefined") return {};
	try {
		const raw = localStorage.getItem(META_KEY);
		return raw ? JSON.parse(raw) : {};
	} catch {
		return {};
	}
}
function writeMeta(next) {
	if (typeof window === "undefined") return;
	try {
		localStorage.setItem(META_KEY, JSON.stringify(next));
	} catch {}
	window.dispatchEvent(new Event(EVENT));
}
function listDownloads() {
	return Object.values(readMeta()).sort((a, b) => b.savedAt - a.savedAt);
}
async function cacheApi() {
	if (typeof caches === "undefined") return null;
	try {
		return await caches.open(AUDIO_CACHE);
	} catch {
		return null;
	}
}
function offlineKey(id) {
	return `/offline-audio/${id}`;
}
async function fromPersistent(id) {
	const store = await cacheApi();
	if (!store) return null;
	const hit = await store.match(offlineKey(id));
	if (!hit) return null;
	const blob = await hit.blob();
	if (!blob.size) return null;
	const url = URL.createObjectURL(blob);
	remember(id, url, true);
	return url;
}
function prefetchAudio(id) {
	if (!id || mem.has(id) || inflight.has(id)) return;
	loadLocalAudio(id).catch(() => {});
}
async function loadLocalAudio(id) {
	const hit = mem.get(id);
	if (hit) return hit;
	const pending = inflight.get(id);
	if (pending) return pending;
	const job = (async () => {
		const persisted = await fromPersistent(id);
		if (persisted) return persisted;
		return withBackoff(async () => {
			const res = await fetch(`/api/stream?v=${id}`, {
				cache: "no-store",
				headers: { Accept: "audio/*,*/*" }
			});
			if (!res.ok && res.status !== 206) throw new Error(`stream ${res.status}`);
			const blob = await res.blob();
			if (!blob.size) throw new Error("empty");
			const url = URL.createObjectURL(blob);
			remember(id, url, pinned.has(id));
			return url;
		}, {
			baseMs: 400,
			maxMs: 6e3,
			maxAttempts: 5,
			factor: 2,
			jitter: .2
		});
	})();
	inflight.set(id, job);
	try {
		return await job;
	} finally {
		inflight.delete(id);
	}
}
async function downloadTrack(track) {
	const id = track.videoId;
	if (!id || track.isLive || track.source === "radio") throw new Error("non scaricabile");
	const store = await cacheApi();
	if (!store) throw new Error("Cache non disponibile");
	const url = await loadLocalAudio(id);
	const blob = await (await fetch(url)).blob();
	if (!blob.size) throw new Error("empty");
	await store.put(offlineKey(id), new Response(blob, { headers: { "Content-Type": blob.type || "audio/mpeg" } }));
	pinned.add(id);
	const meta = readMeta();
	meta[id] = {
		...track,
		savedAt: Date.now(),
		bytes: blob.size
	};
	writeMeta(meta);
}
function canDownloadTrack(track) {
	return Boolean(track.videoId) && !track.isLive && track.source !== "radio";
}
async function downloadTracks(tracks, onProgress) {
	const list = tracks.filter(canDownloadTrack);
	const total = list.length;
	let ok = 0;
	let fail = 0;
	let skipped = 0;
	let done = 0;
	const pending = [...list];
	const worker = async () => {
		while (pending.length) {
			const track = pending.shift();
			if (!track?.videoId) continue;
			try {
				if (isDownloaded(track.videoId)) skipped += 1;
				else {
					await downloadTrack(track);
					ok += 1;
				}
			} catch {
				fail += 1;
			} finally {
				done += 1;
				onProgress?.(done, total);
			}
		}
	};
	const n = Math.min(2, pending.length);
	await Promise.all(Array.from({ length: n }, () => worker()));
	return {
		ok,
		fail,
		skipped
	};
}
async function removeDownload(id) {
	if (!id) return;
	const store = await cacheApi();
	if (store) await store.delete(offlineKey(id));
	pinned.delete(id);
	const meta = readMeta();
	delete meta[id];
	writeMeta(meta);
}
function hydrateDownloads() {
	for (const id of Object.keys(readMeta())) pinned.add(id);
}
function useOfflineDownloads() {
	const [items, setItems] = (0, import_react.useState)([]);
	(0, import_react.useEffect)(() => {
		hydrateDownloads();
		const refresh = () => setItems(listDownloads());
		refresh();
		window.addEventListener(EVENT, refresh);
		return () => window.removeEventListener(EVENT, refresh);
	}, []);
	return items;
}
function useIsDownloaded(id) {
	const [on, setOn] = (0, import_react.useState)(() => Boolean(id && isDownloaded(id)));
	(0, import_react.useEffect)(() => {
		const refresh = () => setOn(Boolean(id && isDownloaded(id)));
		refresh();
		window.addEventListener(EVENT, refresh);
		return () => window.removeEventListener(EVENT, refresh);
	}, [id]);
	return on;
}
function formatBytes(n) {
	if (!Number.isFinite(n) || n <= 0) return "0 B";
	if (n < 1024) return `${Math.round(n)} B`;
	if (n < 1048576) return `${(n / 1024).toFixed(n < 10240 ? 1 : 0)} KB`;
	if (n < 1073741824) return `${(n / 1048576).toFixed(n < 10485760 ? 1 : 0)} MB`;
	return `${(n / 1073741824).toFixed(2)} GB`;
}
async function cacheStats() {
	const items = listDownloads();
	let bytes = items.reduce((sum, t) => sum + (t.bytes || 0), 0);
	if (!bytes) {
		const store = await cacheApi();
		if (store) {
			const keys = await store.keys();
			for (const req of keys) {
				const hit = await store.match(req);
				if (!hit) continue;
				const len = Number(hit.headers.get("content-length") || 0);
				bytes += len || 0;
			}
		}
	}
	let quota;
	let usage;
	try {
		const est = await navigator.storage?.estimate?.();
		quota = est?.quota;
		usage = est?.usage;
	} catch {}
	return {
		bytes,
		count: items.length,
		quota,
		usage
	};
}
async function clearAllDownloads() {
	const ids = Object.keys(readMeta());
	for (const id of ids) await removeDownload(id);
}
function useCacheStats() {
	const [stats, setStats] = (0, import_react.useState)({
		bytes: 0,
		count: 0
	});
	(0, import_react.useEffect)(() => {
		const refresh = () => {
			cacheStats().then(setStats);
		};
		refresh();
		window.addEventListener(EVENT, refresh);
		return () => window.removeEventListener(EVENT, refresh);
	}, []);
	return stats;
}
function TrackArt({ src, alt, className }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
		src: src || "/artwork-fallback.svg",
		alt,
		referrerPolicy: "no-referrer",
		className: cn("size-full object-cover", className),
		loading: "lazy",
		decoding: "async",
		onError: (e) => {
			const img = e.currentTarget;
			if (img.src.endsWith("/artwork-fallback.svg")) return;
			img.src = FALLBACK_ART;
		}
	});
}
function PlayingBars({ className }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
		className: cn("flex h-3.5 items-end gap-0.5", className),
		"aria-hidden": true,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "eq-bar h-full w-0.5 rounded-full bg-primary" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "eq-bar h-full w-0.5 rounded-full bg-primary",
				style: { animationDelay: "0.18s" }
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "eq-bar h-full w-0.5 rounded-full bg-primary",
				style: { animationDelay: "0.32s" }
			})
		]
	});
}
async function shareTrack(track) {
	const url = `${window.location.origin}/t/${track.videoId || track.id}`;
	const text = `${track.title} — ${track.artist}`;
	try {
		if (navigator.share) {
			await navigator.share({
				title: track.title,
				text,
				url
			});
			return;
		}
	} catch {
		return;
	}
	try {
		await navigator.clipboard.writeText(`${text} ${url}`);
	} catch {}
}
function TrackRow({ track, queue, index, showIndex }) {
	const current = useFlowStore((s) => s.current);
	const isPlaying = useFlowStore((s) => s.isPlaying);
	const playTrack = useFlowStore((s) => s.playTrack);
	const togglePlay = useFlowStore((s) => s.togglePlay);
	const toggleLike = useFlowStore((s) => s.toggleLike);
	const setActionTrack = useFlowStore((s) => s.setActionTrack);
	const liked = useFlowStore((s) => s.liked.some((t) => t.id === track.id));
	const active = current?.id === track.id;
	const onPlay = () => {
		if (active) togglePlay();
		else playTrack(track, queue);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: cn("list-row flex min-h-14 items-center gap-3 rounded-md px-2 py-2", active ? "bg-highlight" : "hover:bg-highlight"),
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
				type: "button",
				onClick: onPlay,
				className: "flex min-w-0 flex-1 items-center gap-3 text-left",
				"aria-label": active && isPlaying ? `Pausa ${track.title}` : `Riproduci ${track.title}`,
				children: [
					showIndex ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "w-5 shrink-0 text-center text-xs font-medium tabular-nums text-subtle",
						children: active && isPlaying ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PlayingBars, { className: "mx-auto" }) : (index ?? 0) + 1
					}) : null,
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "relative size-12 shrink-0 overflow-hidden rounded-md bg-elevated",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TrackArt, {
							src: track.artwork,
							alt: ""
						}), active && isPlaying ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "absolute inset-0 flex items-center justify-center bg-bg/55",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PlayingBars, {})
						}) : null]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "min-w-0 flex-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: cn("block truncate text-sm font-medium", active ? "text-primary" : "text-fg"),
							children: track.title
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "mt-0.5 flex items-center gap-1.5 text-xs text-muted",
							children: [track.isLive ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Radio, { className: "size-3 shrink-0" }) : null, /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "truncate",
								children: track.artist
							})]
						})]
					})
				]
			}),
			!track.isLive && track.duration > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "hidden w-10 text-right text-xs tabular-nums text-subtle sm:block",
				children: formatTime(track.duration)
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				onClick: () => toggleLike(track),
				className: cn("flex size-11 shrink-0 items-center justify-center rounded-full", liked ? "text-primary" : "text-subtle"),
				"aria-label": liked ? "Rimuovi dai preferiti" : "Aggiungi ai preferiti",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Heart, { className: cn("heart-icon size-4", liked && "is-on fill-current") })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				onClick: () => setActionTrack(track),
				className: "flex size-11 shrink-0 items-center justify-center rounded-full text-subtle",
				"aria-label": "Altre azioni",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Ellipsis, { className: "size-4" })
			})
		]
	});
}
function TrackCard({ track, queue }) {
	const current = useFlowStore((s) => s.current);
	const isPlaying = useFlowStore((s) => s.isPlaying);
	const playTrack = useFlowStore((s) => s.playTrack);
	const togglePlay = useFlowStore((s) => s.togglePlay);
	const setActionTrack = useFlowStore((s) => s.setActionTrack);
	const active = current?.id === track.id;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "spot-card group relative w-44 shrink-0 sm:w-48",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
			type: "button",
			onClick: () => active ? togglePlay() : playTrack(track, queue),
			className: "w-full text-left",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "art-shadow relative block aspect-square overflow-hidden rounded-md bg-elevated",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TrackArt, {
						src: track.artwork,
						alt: "",
						className: "art-zoom group-hover:scale-[1.04]"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: cn("play-fab absolute right-2 bottom-2 flex size-12 items-center justify-center rounded-full bg-primary text-primary-fg", active && isPlaying ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2 group-hover:translate-y-0 group-hover:opacity-100"),
						children: active && isPlaying ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pause, { className: "size-5 fill-current" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, { className: "ml-0.5 size-5 fill-current" })
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: cn("mt-3 block truncate text-sm font-bold", active ? "text-primary" : "text-fg"),
					children: track.title
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "mt-1 block truncate text-sm text-muted",
					children: track.artist
				})
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
			type: "button",
			onClick: () => setActionTrack(track),
			className: "absolute top-2 right-2 flex size-8 items-center justify-center rounded-full bg-bg/70 text-fg opacity-0 transition-[opacity,transform] duration-200 group-hover:opacity-100",
			"aria-label": "Altre azioni",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Ellipsis, { className: "size-4" })
		})]
	});
}
function CollectionCard({ title, subtitle, artwork, onPlay }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "spot-card group relative w-44 shrink-0 sm:w-48",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
			type: "button",
			onClick: onPlay,
			className: "w-full text-left",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "art-shadow relative block aspect-square overflow-hidden rounded-md bg-elevated",
					children: [artwork ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TrackArt, {
						src: artwork,
						alt: "",
						className: "art-zoom group-hover:scale-[1.04]"
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "liked-wash flex size-full items-center justify-center",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Heart, { className: "size-12 fill-current text-fg" })
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "play-fab absolute right-2 bottom-2 flex size-12 translate-y-2 items-center justify-center rounded-full bg-primary text-primary-fg opacity-0 group-hover:translate-y-0 group-hover:opacity-100",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, { className: "ml-0.5 size-5 fill-current" })
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "mt-3 block truncate text-sm font-bold",
					children: title
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "mt-1 block truncate text-sm text-muted",
					children: subtitle
				})
			]
		})
	});
}
function SectionHeader({ title, action, onAction }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mb-3 flex items-end justify-between gap-3",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
			className: "text-xl font-bold tracking-tight text-fg",
			children: title
		}), action && onAction ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
			type: "button",
			onClick: onAction,
			className: "text-sm font-bold text-muted hover:text-fg",
			children: action
		}) : null]
	});
}
function HScroll({ children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "scrollbar-none -mx-4 flex gap-3 overflow-x-auto px-4 pb-1 sm:-mx-6 sm:px-6",
		children
	});
}
function QuickTile({ track, queue }) {
	const current = useFlowStore((s) => s.current);
	const isPlaying = useFlowStore((s) => s.isPlaying);
	const playTrack = useFlowStore((s) => s.playTrack);
	const togglePlay = useFlowStore((s) => s.togglePlay);
	const active = current?.id === track.id;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
		type: "button",
		onClick: () => active ? togglePlay() : playTrack(track, queue),
		className: "quick-tile group flex min-h-[64px] items-center gap-3 overflow-hidden rounded-md bg-fg/10 text-left hover:bg-fg/20",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "size-16 shrink-0 overflow-hidden bg-surface",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TrackArt, {
					src: track.artwork,
					alt: ""
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "min-w-0 flex-1 pr-2",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: cn("block truncate text-sm font-bold", active ? "text-primary" : "text-fg"),
					children: track.title
				})
			}),
			active && isPlaying ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PlayingBars, { className: "mr-3" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "play-fab mr-3 hidden size-8 items-center justify-center rounded-full bg-primary text-primary-fg group-hover:flex",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, { className: "ml-0.5 size-3.5 fill-current" })
			})
		]
	});
}
function ActionSheet() {
	const navigate = useNavigate();
	const track = useFlowStore((s) => s.actionTrack);
	const setActionTrack = useFlowStore((s) => s.setActionTrack);
	const playTrack = useFlowStore((s) => s.playTrack);
	const playNext = useFlowStore((s) => s.playNext);
	const addToQueue = useFlowStore((s) => s.addToQueue);
	const toggleLike = useFlowStore((s) => s.toggleLike);
	const liked = useFlowStore((s) => track ? s.liked.some((t) => t.id === track.id) : false);
	const playlists = useFlowStore((s) => s.playlists);
	const addToPlaylist = useFlowStore((s) => s.addToPlaylist);
	const startStation = useFlowStore((s) => s.startStation);
	const toggleFollowArtist = useFlowStore((s) => s.toggleFollowArtist);
	const following = useFlowStore((s) => s.actionTrack ? s.followedArtists.includes(s.actionTrack.artist) : false);
	const createPlaylist = useFlowStore((s) => s.createPlaylist);
	const [picking, setPicking] = (0, import_react.useState)(false);
	const [newTitle, setNewTitle] = (0, import_react.useState)("");
	const last = (0, import_react.useRef)(track);
	if (track) last.current = track;
	const { mounted, open } = useOpenTransition(Boolean(track), 200);
	const view = track || last.current;
	if (!mounted || !view) return null;
	const close = () => {
		setPicking(false);
		setNewTitle("");
		setActionTrack(null);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: cn("sheet-backdrop fixed inset-0 z-[80] flex items-end justify-center bg-bg/70 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] md:items-center", open ? "is-open" : "is-closing"),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
			type: "button",
			className: "absolute inset-0",
			"aria-label": "Chiudi",
			onClick: close
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: cn("sheet-panel relative w-full max-w-md overflow-hidden rounded-2xl bg-elevated ring-1 ring-border", open ? "is-open" : "is-closing"),
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-3 border-b border-border px-4 py-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "size-12 overflow-hidden rounded-md bg-surface",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TrackArt, {
							src: view.artwork,
							alt: ""
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "min-w-0 flex-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "truncate text-sm font-medium",
							children: view.title
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "truncate text-xs text-muted",
							children: view.artist
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: close,
						className: "pressable flex size-11 items-center justify-center text-muted",
						"aria-label": "Chiudi",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-5" })
					})
				]
			}), picking ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "max-h-72 space-y-1 overflow-y-auto p-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
					className: "mb-2 flex gap-2",
					onSubmit: (e) => {
						e.preventDefault();
						if (!newTitle.trim()) return;
						createPlaylist(newTitle);
						setNewTitle("");
					},
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						value: newTitle,
						onChange: (e) => setNewTitle(e.target.value),
						placeholder: "Nuova playlist",
						className: "h-11 min-w-0 flex-1 rounded-lg bg-surface px-3 text-base outline-none ring-1 ring-border"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "submit",
						className: "h-11 rounded-lg bg-primary px-3 text-sm font-medium text-primary-fg",
						children: "Crea"
					})]
				}), playlists.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "px-2 py-6 text-center text-sm text-muted",
					children: "Nessuna playlist. Creane una."
				}) : playlists.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					onClick: () => {
						addToPlaylist(p.id, view);
						close();
					},
					className: "flex w-full items-center justify-between rounded-lg px-3 py-3 text-left text-sm hover:bg-surface",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: p.title }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-xs text-subtle",
						children: p.trackIds.length
					})]
				}, p.id))]
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "p-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SheetBtn, {
						icon: Play,
						label: "Riproduci",
						onClick: () => {
							playTrack(view);
							close();
						}
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SheetBtn, {
						icon: SkipForward,
						label: "Riproduci dopo",
						onClick: () => {
							playNext(view);
							close();
						}
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SheetBtn, {
						icon: ListMusic,
						label: "Aggiungi in coda",
						onClick: () => {
							addToQueue(view);
							close();
						}
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SheetBtn, {
						icon: Heart,
						label: liked ? "Rimuovi dai preferiti" : "Aggiungi ai preferiti",
						onClick: () => toggleLike(view)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SheetBtn, {
						icon: ListPlus,
						label: "Aggiungi a playlist",
						onClick: () => setPicking(true)
					}),
					view.videoId && !view.isLive && view.source !== "radio" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DownloadSheetBtn, {
						track: view,
						onDone: close
					}) : null,
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SheetBtn, {
						icon: Share2,
						label: "Condividi",
						onClick: () => {
							shareTrack(view);
							close();
						}
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SheetBtn, {
						icon: Search,
						label: "Cerca artista",
						onClick: () => {
							close();
							navigate({
								to: "/search",
								search: { q: view.artist }
							});
						}
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SheetBtn, {
						icon: Radio,
						label: "Radio da questo brano",
						onClick: () => {
							close();
							getRelatedTracks({ data: {
								artist: view.artist,
								title: view.title,
								excludeId: view.id
							} }).then((tracks) => startStation(view, tracks));
						}
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SheetBtn, {
						icon: Search,
						label: following ? "Non seguire artista" : "Segui artista",
						onClick: () => {
							toggleFollowArtist(view.artist);
							close();
						}
					})
				]
			})]
		})]
	});
}
function DownloadSheetBtn({ track, onDone }) {
	const downloaded = useIsDownloaded(track.videoId);
	const notify = useFlowStore((s) => s.notify);
	const [busy, setBusy] = (0, import_react.useState)(false);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SheetBtn, {
		icon: Download,
		label: busy ? "Attendi…" : downloaded ? "Rimuovi download" : "Scarica offline",
		onClick: () => {
			if (!track.videoId || busy) return;
			setBusy(true);
			(downloaded ? removeDownload(track.videoId) : downloadTrack(track)).then(() => {
				notify(downloaded ? "Download rimosso" : "Brano salvato offline");
				onDone();
			}).catch(() => notify("Download non riuscito")).finally(() => setBusy(false));
		}
	});
}
function SheetBtn({ icon: Icon, label, onClick }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
		type: "button",
		onClick,
		className: "flex h-12 w-full items-center gap-3 rounded-lg px-3 text-sm font-medium transition-colors duration-150 hover:bg-surface",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "size-4 text-muted" }), label]
	});
}
function isAppleMobile() {
	if (typeof navigator === "undefined") return false;
	return /iPad|iPhone|iPod/.test(navigator.userAgent) || navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1;
}
function isAndroid() {
	if (typeof navigator === "undefined") return false;
	return /Android/i.test(navigator.userAgent);
}
function artUrl(src) {
	if (!src || src.startsWith("data:") || src.startsWith("blob:")) return src;
	if (src.startsWith("/")) return `${window.location.origin}${src}`;
	return `${window.location.origin}/api/proxy?u=${encodeURIComponent(src)}`;
}
var lastMetaId = "";
var lastState = "none";
var lastPosAt = 0;
function pushLockScreen(track, isPlaying, currentTime, duration, rate) {
	if (typeof navigator === "undefined" || !("mediaSession" in navigator)) return;
	const src = artUrl(track.artwork);
	try {
		if (lastMetaId !== track.id) {
			navigator.mediaSession.metadata = new MediaMetadata({
				title: track.title,
				artist: track.artist,
				album: track.album || "Flow",
				artwork: src ? [
					{
						src,
						sizes: "96x96",
						type: "image/jpeg"
					},
					{
						src,
						sizes: "256x256",
						type: "image/jpeg"
					},
					{
						src,
						sizes: "512x512",
						type: "image/jpeg"
					}
				] : []
			});
			lastMetaId = track.id;
		}
		const state = isPlaying ? "playing" : "paused";
		if (lastState !== state) {
			navigator.mediaSession.playbackState = state;
			lastState = state;
		}
	} catch {}
	if (track.isLive) return;
	const now = Date.now();
	const gap = typeof document !== "undefined" && document.hidden ? 2500 : 900;
	if (now - lastPosAt < gap) return;
	lastPosAt = now;
	const dur = Number.isFinite(duration) && duration > 0 ? duration : 0;
	const pos = Number.isFinite(currentTime) ? Math.max(0, currentTime) : 0;
	if (dur <= 0) return;
	try {
		navigator.mediaSession.setPositionState({
			duration: dur,
			playbackRate: rate > 0 ? rate : 1,
			position: Math.min(pos, dur)
		});
	} catch {}
}
function bindLockScreenActions(handlers) {
	if (typeof navigator === "undefined" || !("mediaSession" in navigator)) return;
	const bind = (action, fn) => {
		try {
			navigator.mediaSession.setActionHandler(action, fn);
		} catch {}
	};
	bind("play", handlers.play);
	bind("pause", handlers.pause);
	bind("previoustrack", handlers.prev);
	bind("nexttrack", handlers.next);
	bind("stop", handlers.stop);
	bind("seekto", (d) => {
		if (typeof d.seekTime === "number") handlers.seek(d.seekTime);
	});
	bind("seekforward", () => handlers.skip(10));
	bind("seekbackward", () => handlers.skip(-10));
}
function getSession() {
	if (typeof navigator === "undefined") return null;
	return navigator.audioSession ?? null;
}
var lost = false;
var resumeWhenFree = false;
function claimAudioFocus() {
	const session = getSession();
	if (!session) return;
	try {
		session.type = "playback";
	} catch {}
}
function bindAudioFocus(handlers) {
	claimAudioFocus();
	const session = getSession();
	const onState = () => {
		const state = session?.state || (lost ? "interrupted" : "active");
		const locked = typeof document !== "undefined" && document.hidden;
		if (state === "interrupted" || state === "inactive") {
			if (lost) return;
			if (locked) {
				claimAudioFocus();
				return;
			}
			lost = true;
			handlers.onLost();
			return;
		}
		if (state === "active" && lost) {
			lost = false;
			handlers.onGained();
		}
	};
	session?.addEventListener("statechange", onState);
	return () => {
		session?.removeEventListener("statechange", onState);
	};
}
function markPlayingForFocus(playing) {
	if (playing) {
		claimAudioFocus();
		resumeWhenFree = true;
	} else if (!lost) resumeWhenFree = false;
}
function shouldResumeAfterFocus() {
	return resumeWhenFree;
}
var lastTag = "";
var primed = false;
function detectOem() {
	if (typeof navigator === "undefined") return "other";
	const blob = `${navigator.userAgent} ${(navigator.userAgentData?.brands || []).map((b) => b.brand).join(" ")}`;
	if (/samsung|sm-|oneui|sec-/i.test(blob)) return "samsung";
	if (/moto|motorola/i.test(blob)) return "motorola";
	if (/pixel|google/i.test(blob)) return "pixel";
	if (/xiaomi|redmi|poco|miui|hyperos/i.test(blob)) return "xiaomi";
	if (/huawei|honor|emui|harmony/i.test(blob)) return "huawei";
	if (/oppo|oneplus|realme|coloros|oxygen/i.test(blob)) return "oppo";
	return "other";
}
function openHref(href) {
	const a = document.createElement("a");
	a.href = href;
	a.rel = "noopener";
	a.style.display = "none";
	document.body.appendChild(a);
	a.click();
	a.remove();
}
function alreadyAsked() {
	try {
		return localStorage.getItem("flow_bg_default") === "1";
	} catch {
		return true;
	}
}
function markAsked() {
	try {
		localStorage.setItem("flow_bg_default", "1");
	} catch {}
}
/** Parte da solo al primo play: notifiche + dialogo batteria Android. */
function enableAndroidBackgroundDefaults() {
	if (!isAndroid() || primed) return;
	primed = true;
	if ("Notification" in window && Notification.permission === "default") Notification.requestPermission().catch(() => {});
	if (alreadyAsked()) return;
	markAsked();
	window.setTimeout(() => {
		openHref("intent://com.android.chrome/#Intent;scheme=package;action=android.settings.REQUEST_IGNORE_BATTERY_OPTIMIZATIONS;end");
	}, 400);
}
function showAndroidNowPlaying(track) {
	enableAndroidBackgroundDefaults();
	if (!isAndroid() || typeof Notification === "undefined") return;
	if (Notification.permission !== "granted") return;
	try {
		lastTag = "flow-now";
		new Notification(track.title, {
			body: track.artist,
			tag: lastTag,
			silent: true,
			icon: "/icon-192.png",
			badge: "/icon-192.png"
		});
	} catch {}
}
function androidBackgroundTips() {
	const oem = detectOem();
	const common = [
		"Installa Flow sulla Home e aprilo da lì, non dalla scheda del browser.",
		"Non chiudere Flow o Chrome dallo switcher delle app recenti.",
		"Lascia suonare 2–3 secondi, poi spegni lo schermo."
	];
	if (oem === "samsung") return [
		...common,
		"Samsung: Impostazioni → Batteria e device care → Batteria → Limiti in background → togli Chrome e Flow dal sonno.",
		"Samsung: App → Chrome → Batteria → Senza limiti. Disattiva “Metti in sospensione le app non utilizzate”."
	];
	if (oem === "motorola") return [...common, "Motorola: Impostazioni → App → Chrome → Batteria → Non ottimizzata."];
	if (oem === "pixel") return [...common, "Pixel: Impostazioni → App → Chrome → Batteria → Non ottimizzata."];
	return [...common, "Impostazioni → App → Chrome → Batteria → Nessuna limitazione."];
}
function oemBatteryIntents() {
	const oem = detectOem();
	const items = [{
		label: "Scheda Chrome",
		href: "intent://com.android.chrome/#Intent;scheme=package;action=android.settings.APPLICATION_DETAILS_SETTINGS;end"
	}, {
		label: "App non ottimizzate",
		href: "intent:#Intent;action=android.settings.IGNORE_BATTERY_OPTIMIZATION_SETTINGS;end"
	}];
	if (oem === "samsung") items.push({
		label: "Device Care Samsung",
		href: "intent:#Intent;component=com.samsung.android.lool/com.samsung.android.sm.ui.battery.BatteryActivity;end"
	});
	return items;
}
var W = 1080;
var H = 1350;
function proxiedArtwork(src) {
	if (!src) return src;
	if (src.startsWith("/") || src.startsWith("blob:") || src.startsWith("data:")) return src;
	try {
		const u = new URL(src, typeof window !== "undefined" ? window.location.href : "https://local");
		if (typeof window !== "undefined" && u.origin === window.location.origin) return src;
		if (u.protocol !== "https:") return src;
		return `/api/proxy?u=${encodeURIComponent(u.href)}`;
	} catch {
		return src;
	}
}
function loadImage(src, timeoutMs = 6e3) {
	return new Promise((resolve) => {
		if (!src) {
			resolve(null);
			return;
		}
		const img = new Image();
		img.crossOrigin = "anonymous";
		const done = (value) => {
			window.clearTimeout(timer);
			img.onload = null;
			img.onerror = null;
			resolve(value);
		};
		const timer = window.setTimeout(() => done(null), timeoutMs);
		img.onload = () => done(img);
		img.onerror = () => done(null);
		img.src = src;
	});
}
async function averageArtworkColor(src) {
	const img = await loadImage(proxiedArtwork(src), 4e3);
	if (!img) return null;
	const canvas = document.createElement("canvas");
	canvas.width = 8;
	canvas.height = 8;
	const ctx = canvas.getContext("2d", { willReadFrequently: true });
	if (!ctx) return null;
	try {
		ctx.drawImage(img, 0, 0, 8, 8);
		const data = ctx.getImageData(0, 0, 8, 8).data;
		let r = 0;
		let g = 0;
		let b = 0;
		let n = 0;
		for (let i = 0; i < data.length; i += 4) {
			if (data[i + 3] < 80) continue;
			r += data[i];
			g += data[i + 1];
			b += data[i + 2];
			n += 1;
		}
		if (!n) return null;
		r = Math.round(r / n);
		g = Math.round(g / n);
		b = Math.round(b / n);
		if (.2126 * r + .7152 * g + .0722 * b < 28) {
			r = Math.min(255, r + 40);
			g = Math.min(255, g + 40);
			b = Math.min(255, b + 40);
		}
		return `rgb(${r}, ${g}, ${b})`;
	} catch {
		return null;
	}
}
function wrapLines(ctx, text, maxWidth, maxLines) {
	const words = text.split(/\s+/).filter(Boolean);
	const lines = [];
	let cur = "";
	for (const word of words) {
		const next = cur ? `${cur} ${word}` : word;
		if (ctx.measureText(next).width <= maxWidth) cur = next;
		else {
			if (cur) lines.push(cur);
			cur = word;
			if (lines.length === maxLines - 1) break;
		}
	}
	if (cur && lines.length < maxLines) lines.push(cur);
	if (words.length && lines.length === maxLines) {
		let last = lines[maxLines - 1];
		while (ctx.measureText(`${last}…`).width > maxWidth && last.length > 4) last = last.slice(0, -1);
		lines[maxLines - 1] = `${last}…`;
	}
	return lines.length ? lines : [text];
}
function roundRect(ctx, x, y, w, h, r) {
	const rad = Math.min(r, w / 2, h / 2);
	ctx.beginPath();
	ctx.moveTo(x + rad, y);
	ctx.arcTo(x + w, y, x + w, y + h, rad);
	ctx.arcTo(x + w, y + h, x, y + h, rad);
	ctx.arcTo(x, y + h, x, y, rad);
	ctx.arcTo(x, y, x + w, y, rad);
	ctx.closePath();
}
function coverClip(ctx, img, x, y, size, radius) {
	ctx.save();
	roundRect(ctx, x, y, size, size, radius);
	ctx.clip();
	const scale = Math.max(size / img.width, size / img.height);
	const dw = img.width * scale;
	const dh = img.height * scale;
	ctx.drawImage(img, x + (size - dw) / 2, y + (size - dh) / 2, dw, dh);
	ctx.restore();
}
async function renderLyricsCard(input) {
	const canvas = document.createElement("canvas");
	canvas.width = W;
	canvas.height = H;
	const ctx = canvas.getContext("2d");
	if (!ctx) throw new Error("Canvas non disponibile");
	ctx.fillStyle = "#07080a";
	ctx.fillRect(0, 0, W, H);
	const art = await loadImage(proxiedArtwork(input.track.artwork));
	if (art) {
		ctx.save();
		ctx.filter = "blur(48px) saturate(1.35)";
		const scale = Math.max(W / art.width, H / art.height) * 1.25;
		const dw = art.width * scale;
		const dh = art.height * scale;
		ctx.drawImage(art, (W - dw) / 2, (H - dh) / 2, dw, dh);
		ctx.restore();
	} else {
		const g = ctx.createLinearGradient(0, 0, W, H);
		g.addColorStop(0, "#1a3a16");
		g.addColorStop(1, "#0b0c10");
		ctx.fillStyle = g;
		ctx.fillRect(0, 0, W, H);
	}
	const veil = ctx.createLinearGradient(0, 0, 0, H);
	veil.addColorStop(0, "rgba(0,0,0,0.25)");
	veil.addColorStop(.45, "rgba(0,0,0,0.45)");
	veil.addColorStop(1, "rgba(0,0,0,0.72)");
	ctx.fillStyle = veil;
	ctx.fillRect(0, 0, W, H);
	const cardX = 72;
	const cardY = 120;
	const cardW = 936;
	const cardH = 1110;
	ctx.save();
	roundRect(ctx, cardX, cardY, cardW, cardH, 48);
	ctx.fillStyle = "rgba(255,255,255,0.10)";
	ctx.fill();
	ctx.strokeStyle = "rgba(255,255,255,0.22)";
	ctx.lineWidth = 2;
	ctx.stroke();
	ctx.restore();
	const cover = 280;
	const coverX = 400;
	const coverY = 176;
	if (art) {
		ctx.save();
		ctx.shadowColor = "rgba(0,0,0,0.45)";
		ctx.shadowBlur = 36;
		coverClip(ctx, art, coverX, coverY, cover, 28);
		ctx.restore();
	}
	const line = (input.line || input.track.title || "").trim() || input.track.title;
	ctx.fillStyle = "#ffffff";
	ctx.textAlign = "center";
	ctx.textBaseline = "top";
	let size = 54;
	ctx.font = `700 ${size}px "Plus Jakarta Sans", ui-sans-serif, system-ui, sans-serif`;
	let wrapped = wrapLines(ctx, line, 840, 5);
	while (size > 34 && wrapped.length > 4) {
		size -= 4;
		ctx.font = `700 ${size}px "Plus Jakarta Sans", ui-sans-serif, system-ui, sans-serif`;
		wrapped = wrapLines(ctx, line, 840, 5);
	}
	const textY = 512;
	wrapped.forEach((row, i) => {
		ctx.fillText(row, W / 2, textY + i * (size + 14));
	});
	const metaY = textY + wrapped.length * (size + 14) + 36;
	ctx.font = `600 28px "Plus Jakarta Sans", ui-sans-serif, system-ui, sans-serif`;
	ctx.fillStyle = "rgba(255,255,255,0.92)";
	ctx.fillText(input.track.title.slice(0, 64), W / 2, metaY);
	ctx.font = `500 24px "Plus Jakarta Sans", ui-sans-serif, system-ui, sans-serif`;
	ctx.fillStyle = "rgba(255,255,255,0.62)";
	ctx.fillText(input.track.artist.slice(0, 64), W / 2, metaY + 40);
	ctx.font = `700 22px "Plus Jakarta Sans", ui-sans-serif, system-ui, sans-serif`;
	ctx.fillStyle = "#D4E84B";
	ctx.fillText("FLOW", W / 2, 1178);
	return await new Promise((resolve, reject) => {
		canvas.toBlob((blob) => {
			if (blob) resolve(blob);
			else reject(/* @__PURE__ */ new Error("Immagine non generata"));
		}, "image/png");
	});
}
function triggerDownload(blob, name) {
	const a = document.createElement("a");
	a.href = URL.createObjectURL(blob);
	a.download = name;
	a.click();
	window.setTimeout(() => URL.revokeObjectURL(a.href), 4e3);
}
async function shareLyricsCard(input) {
	const line = (input.line || "").trim() || input.track.title;
	const text = `"${line}" — ${input.track.title} · ${input.track.artist}`;
	const blob = await renderLyricsCard({
		...input,
		line
	});
	const file = new File([blob], "flow-lyrics.png", { type: "image/png" });
	const nav = navigator;
	try {
		if (nav.share && (!nav.canShare || nav.canShare({ files: [file] }))) {
			await nav.share({
				title: input.track.title,
				text,
				files: [file]
			});
			return "shared";
		}
	} catch (err) {
		if (err instanceof DOMException && err.name === "AbortError") return "shared";
	}
	try {
		if (nav.share) {
			await nav.share({
				title: input.track.title,
				text
			});
			triggerDownload(blob, "flow-lyrics.png");
			return "shared";
		}
	} catch (err) {
		if (err instanceof DOMException && err.name === "AbortError") return "shared";
	}
	try {
		await navigator.clipboard.writeText(text);
		triggerDownload(blob, "flow-lyrics.png");
		return "downloaded";
	} catch {
		triggerDownload(blob, "flow-lyrics.png");
		return "downloaded";
	}
}
function fallbackSrc(track) {
	if (track.source === "radio" && track.streamUrl) return track.streamUrl;
	if (track.videoId) return cachedAudioUrl(track.videoId) || `/api/stream?v=${track.videoId}`;
	return track.streamUrl || "";
}
function applyOutput(audio) {
	const s = useFlowStore.getState();
	const raw = s.isMuted ? 0 : s.volume;
	const norm = s.settings.normalize ? .92 : 1;
	const duck = s.voiceDuck ? .28 : 1;
	audio.volume = Math.max(0, Math.min(1, raw * norm * duck));
	try {
		audio.playbackRate = s.playbackRate || 1;
	} catch {}
}
function AudioEngine() {
	const audioRef = (0, import_react.useRef)(null);
	const current = useFlowStore((s) => s.current);
	const isPlaying = useFlowStore((s) => s.isPlaying);
	const volume = useFlowStore((s) => s.volume);
	const isMuted = useFlowStore((s) => s.isMuted);
	const voiceDuck = useFlowStore((s) => s.voiceDuck);
	const playbackRate = useFlowStore((s) => s.playbackRate);
	const normalize = useFlowStore((s) => s.settings.normalize);
	const seekVersion = useFlowStore((s) => s.seekVersion);
	const currentTime = useFlowStore((s) => s.currentTime);
	const setCurrentTime = useFlowStore((s) => s.setCurrentTime);
	const setDuration = useFlowStore((s) => s.setDuration);
	const onEnded = useFlowStore((s) => s.onEnded);
	const lastSeek = (0, import_react.useRef)(0);
	const lastSrc = (0, import_react.useRef)("");
	const lastMove = (0, import_react.useRef)(0);
	const lastPos = (0, import_react.useRef)(0);
	const recovering = (0, import_react.useRef)("");
	const resumeElement = (audio) => {
		if (!audio) return;
		if (useFlowStore.getState().isPlaying && audio.paused) audio.play().catch(() => {});
	};
	const applySrc = (audio, src, play, force = false) => {
		if (!src) return;
		if (document.hidden) {
			applyOutput(audio);
			if (play && audio.paused) audio.play().catch(() => {});
			return;
		}
		if (lastSrc.current === src) {
			applyOutput(audio);
			if (play) audio.play().catch(() => {});
			return;
		}
		const playing = !audio.paused && !audio.error;
		const blobUpgrade = src.startsWith("blob:") && lastSrc.current.includes("/api/stream");
		if (playing && blobUpgrade) return;
		if (playing && !force) return;
		const keep = audio.currentTime || 0;
		lastSrc.current = src;
		audio.src = src;
		audio.load();
		if (keep > .4) audio.addEventListener("loadedmetadata", () => {
			try {
				audio.currentTime = keep;
			} catch {}
			if (play || useFlowStore.getState().isPlaying) audio.play().catch(() => {});
		}, { once: true });
		applyOutput(audio);
		if (play) audio.play().catch(() => {});
	};
	const recover = (id, time) => {
		const audio = audioRef.current;
		if (!audio || recovering.current === id) return;
		if (document.hidden) {
			resumeElement(audio);
			return;
		}
		recovering.current = id;
		const ready = cachedAudioUrl(id);
		if (ready) {
			applySrc(audio, ready, true, true);
			audio.addEventListener("loadedmetadata", () => {
				try {
					if (time > 0) audio.currentTime = time;
				} catch {}
				audio.play().catch(() => {});
			}, { once: true });
			return;
		}
		loadLocalAudio(id).then((url) => {
			if (document.hidden) return;
			if (useFlowStore.getState().current?.videoId !== id) return;
			applySrc(audio, url, true, true);
			audio.addEventListener("loadedmetadata", () => {
				try {
					if (time > 0) audio.currentTime = time;
				} catch {}
				if (useFlowStore.getState().isPlaying) audio.play().catch(() => {});
			}, { once: true });
		}).catch(() => {
			if (recovering.current === id) recovering.current = "";
		});
	};
	(0, import_react.useEffect)(() => {
		if ("serviceWorker" in navigator) navigator.serviceWorker.register("/sw-audio.js").catch(() => {});
		const el = audioRef.current;
		if (el) {
			el.setAttribute("playsinline", "true");
			el.setAttribute("webkit-playsinline", "true");
		}
		claimAudioFocus();
		bindLockScreenActions({
			play: () => {
				useFlowStore.getState().resume();
				audioRef.current?.play().catch(() => {});
			},
			pause: () => {
				useFlowStore.getState().pause();
				audioRef.current?.pause();
			},
			prev: () => useFlowStore.getState().prev(),
			next: () => useFlowStore.getState().next(),
			seek: (t) => useFlowStore.getState().seek(t),
			skip: (d) => useFlowStore.getState().skipBy(d),
			stop: () => {
				useFlowStore.getState().pause();
				audioRef.current?.pause();
			}
		});
		return bindAudioFocus({
			onLost: () => {
				if (document.hidden) return;
				useFlowStore.getState().pause();
			},
			onGained: () => {
				if (!shouldResumeAfterFocus()) return;
				const s = useFlowStore.getState();
				if (s.current) s.resume();
				audioRef.current?.play().catch(() => {});
			}
		});
	}, []);
	(0, import_react.useEffect)(() => {
		const audio = audioRef.current;
		if (!audio || !current) return;
		recovering.current = "";
		lastMove.current = Date.now();
		lastPos.current = 0;
		if (current.duration && current.duration > 0) setDuration(current.duration);
		else setDuration(0);
		const wantPlay = useFlowStore.getState().isPlaying;
		applySrc(audio, fallbackSrc(current), wantPlay, true);
		claimAudioFocus();
		if (wantPlay) {
			markPlayingForFocus(true);
			showAndroidNowPlaying(current);
		}
		pushLockScreen(current, wantPlay, 0, current.duration || 0, 1);
		const st = useFlowStore.getState();
		const nxt = st.queue[st.queueIndex + 1];
		if (nxt?.videoId && nxt.videoId !== current.videoId) prefetchAudio(nxt.videoId);
	}, [
		current?.id,
		current?.videoId,
		current?.streamUrl,
		setDuration
	]);
	(0, import_react.useEffect)(() => {
		const audio = audioRef.current;
		if (!audio) return;
		markPlayingForFocus(isPlaying);
		claimAudioFocus();
		applyOutput(audio);
		if (isPlaying) audio.play().catch(() => {});
		else audio.pause();
		if (current) pushLockScreen(current, isPlaying, audio.currentTime || 0, audio.duration || 0, 1);
	}, [isPlaying, current]);
	(0, import_react.useEffect)(() => {
		const audio = audioRef.current;
		if (audio) applyOutput(audio);
	}, [
		volume,
		isMuted,
		voiceDuck,
		playbackRate,
		normalize
	]);
	(0, import_react.useEffect)(() => {
		if (seekVersion === lastSeek.current) return;
		lastSeek.current = seekVersion;
		const audio = audioRef.current;
		if (!audio) return;
		if (Math.abs(audio.currentTime - currentTime) > .4) audio.currentTime = currentTime;
	}, [seekVersion, currentTime]);
	(0, import_react.useEffect)(() => {
		const kick = () => {
			const audio = audioRef.current;
			const s = useFlowStore.getState();
			if (!audio || !s.isPlaying || !s.current) return;
			claimAudioFocus();
			if (document.hidden) {
				resumeElement(audio);
				return;
			}
			resumeElement(audio);
			const t = audio.currentTime || 0;
			if (t > lastPos.current + .15) {
				lastPos.current = t;
				lastMove.current = Date.now();
				return;
			}
			if (Date.now() - lastMove.current > 4e3 && s.current.videoId && audio.error) recover(s.current.videoId, t || s.currentTime);
		};
		document.addEventListener("visibilitychange", kick);
		window.addEventListener("pageshow", kick);
		window.addEventListener("focus", kick);
		window.addEventListener("freeze", kick);
		window.addEventListener("resume", kick);
		const watchdog = window.setInterval(kick, 2e3);
		return () => {
			document.removeEventListener("visibilitychange", kick);
			window.removeEventListener("pageshow", kick);
			window.removeEventListener("focus", kick);
			window.removeEventListener("freeze", kick);
			window.removeEventListener("resume", kick);
			window.clearInterval(watchdog);
		};
	}, []);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("audio", {
		ref: audioRef,
		playsInline: true,
		preload: "auto",
		className: "pointer-events-none fixed bottom-0 left-0 h-px w-px opacity-[0.01]",
		onTimeUpdate: (e) => {
			const el = e.currentTarget;
			const t = el.currentTime;
			if (!Number.isFinite(t)) return;
			setCurrentTime(t);
			if (t > lastPos.current) {
				lastPos.current = t;
				lastMove.current = Date.now();
			}
			const track = useFlowStore.getState().current;
			if (track) pushLockScreen(track, !el.paused, t, el.duration || 0, 1);
		},
		onDurationChange: (e) => {
			const d = e.currentTarget.duration;
			if (Number.isFinite(d) && d > 0) setDuration(d);
		},
		onPlaying: () => {
			lastMove.current = Date.now();
			recovering.current = "";
			const track = useFlowStore.getState().current;
			if (track) {
				markPlayingForFocus(true);
				pushLockScreen(track, true, audioRef.current?.currentTime || 0, audioRef.current?.duration || 0, 1);
			}
		},
		onPause: () => {
			resumeElement(audioRef.current);
		},
		onWaiting: () => {
			if (document.hidden) resumeElement(audioRef.current);
		},
		onError: () => {
			const s = useFlowStore.getState();
			const id = s.current?.videoId;
			const audio = audioRef.current;
			if (!id || !audio) return;
			if (document.hidden) {
				resumeElement(audio);
				return;
			}
			const blob = cachedAudioUrl(id);
			if (blob) applySrc(audio, blob, s.isPlaying, true);
			else if (!audio.src.includes("/api/stream")) applySrc(audio, `/api/stream?v=${id}`, s.isPlaying, true);
			else if (s.isPlaying) recover(id, s.currentTime);
		},
		onStalled: () => {
			if (document.hidden) resumeElement(audioRef.current);
		},
		onEnded
	});
}
function MiniPlayer() {
	const current = useFlowStore((s) => s.current);
	const isPlaying = useFlowStore((s) => s.isPlaying);
	const currentTime = useFlowStore((s) => s.currentTime);
	const duration = useFlowStore((s) => s.duration);
	const remainingTime = useFlowStore((s) => s.settings.remainingTime);
	const togglePlay = useFlowStore((s) => s.togglePlay);
	const next = useFlowStore((s) => s.next);
	const prev = useFlowStore((s) => s.prev);
	const seek = useFlowStore((s) => s.seek);
	const shuffle = useFlowStore((s) => s.shuffle);
	const repeat = useFlowStore((s) => s.repeat);
	const volume = useFlowStore((s) => s.volume);
	const isMuted = useFlowStore((s) => s.isMuted);
	const toggleShuffle = useFlowStore((s) => s.toggleShuffle);
	const cycleRepeat = useFlowStore((s) => s.cycleRepeat);
	const toggleLike = useFlowStore((s) => s.toggleLike);
	const liked = useFlowStore((s) => current ? s.liked.some((t) => t.id === current.id) : false);
	const setShowFullPlayer = useFlowStore((s) => s.setShowFullPlayer);
	const setVolume = useFlowStore((s) => s.setVolume);
	const toggleMute = useFlowStore((s) => s.toggleMute);
	const showFull = useFlowStore((s) => s.showFullPlayer);
	const { mounted, open } = useOpenTransition(Boolean(current), 280);
	if (!mounted || !current) return null;
	const progress = duration > 0 ? Math.min(100, currentTime / duration * 100) : 0;
	const RepeatIcon = repeat === "one" ? Repeat1 : Repeat;
	const rightTime = remainingTime && duration > 0 ? Math.max(0, duration - currentTime) : duration;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: cn("now-bar pointer-events-auto bg-elevated md:bg-bg", (!open || showFull) && "is-away"),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "md:hidden",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mx-2 mb-1 overflow-hidden rounded-lg bg-elevated",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2 px-2 py-1.5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						onClick: () => setShowFullPlayer(true),
						className: "flex min-w-0 flex-1 items-center gap-3 text-left",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "size-11 shrink-0 overflow-hidden rounded-md bg-surface",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TrackArt, {
								src: current.artwork,
								alt: ""
							})
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "min-w-0 flex-1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "block truncate text-sm font-medium",
								children: current.title
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "block truncate text-xs text-muted",
								children: current.artist
							})]
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: togglePlay,
						className: "flex size-11 items-center justify-center",
						"aria-label": "Play",
						children: isPlaying ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pause, { className: "size-5 fill-current" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, { className: "size-5 fill-current" })
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "h-0.5 w-full bg-subtle/40",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "h-full bg-primary",
						style: { width: `${progress}%` }
					})
				})]
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "hidden h-[90px] items-center gap-4 px-4 md:flex",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					onClick: () => setShowFullPlayer(true),
					className: "flex min-w-0 flex-1 items-center gap-3 text-left",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "size-14 shrink-0 overflow-hidden rounded bg-surface",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TrackArt, {
							src: current.artwork,
							alt: ""
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "min-w-0",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "block max-w-[14rem] truncate text-sm font-medium",
							children: current.title
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "block max-w-[14rem] truncate text-xs text-muted",
							children: current.artist
						})]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: () => toggleLike(current),
					className: cn("size-8", liked ? "text-primary" : "text-muted"),
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Heart, { className: cn("size-4", liked && "fill-current") })
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex w-[42%] max-w-xl min-w-[22rem] flex-col items-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								onClick: toggleShuffle,
								className: cn("size-8", shuffle ? "text-primary" : "text-muted"),
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Shuffle, { className: "size-4" })
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								onClick: prev,
								className: "size-8 text-muted",
								"aria-label": "Prev",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SkipBack, { className: "size-5 fill-current" })
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								onClick: togglePlay,
								className: "flex size-10 items-center justify-center rounded-full bg-fg text-bg",
								"aria-label": "Play",
								children: isPlaying ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pause, { className: "size-4 fill-current" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, { className: "size-4 fill-current" })
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								onClick: next,
								className: "size-8 text-muted",
								"aria-label": "Next",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SkipForward, { className: "size-5 fill-current" })
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								onClick: cycleRepeat,
								className: cn("size-8", repeat !== "off" ? "text-primary" : "text-muted"),
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RepeatIcon, { className: "size-4" })
							})
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex w-full items-center gap-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "w-10 text-right text-[11px] tabular-nums text-subtle",
								children: formatTime(currentTime)
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								type: "range",
								min: 0,
								max: duration || 1,
								step: .25,
								value: Math.min(currentTime, duration || 1),
								onChange: (e) => seek(Number(e.target.value)),
								className: "seek flex-1"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "w-10 text-[11px] tabular-nums text-subtle",
								children: remainingTime ? `-${formatTime(rightTime)}` : formatTime(rightTime)
							})
						]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-1 items-center justify-end gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: toggleMute,
						className: "text-muted",
						children: isMuted || volume === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(VolumeX, { className: "size-4" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Volume2, { className: "size-4" })
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						type: "range",
						min: 0,
						max: 1,
						step: .01,
						value: isMuted ? 0 : volume,
						onChange: (e) => setVolume(Number(e.target.value)),
						className: "seek w-24"
					})]
				})
			]
		})]
	});
}
var lyricsMem = /* @__PURE__ */ new Map();
function FullPlayer() {
	const current = useFlowStore((s) => s.current);
	const isPlaying = useFlowStore((s) => s.isPlaying);
	const currentTime = useFlowStore((s) => s.currentTime);
	const duration = useFlowStore((s) => s.duration);
	const remainingTime = useFlowStore((s) => s.settings.remainingTime);
	const queue = useFlowStore((s) => s.queue);
	const show = useFlowStore((s) => s.showFullPlayer);
	const showQueue = useFlowStore((s) => s.showQueue);
	const showLyrics = useFlowStore((s) => s.showLyrics);
	const shuffle = useFlowStore((s) => s.shuffle);
	const repeat = useFlowStore((s) => s.repeat);
	const playbackRate = useFlowStore((s) => s.playbackRate || 1);
	const sleepEndsAt = useFlowStore((s) => s.sleepEndsAt);
	const togglePlay = useFlowStore((s) => s.togglePlay);
	const next = useFlowStore((s) => s.next);
	const prev = useFlowStore((s) => s.prev);
	const seek = useFlowStore((s) => s.seek);
	const toggleShuffle = useFlowStore((s) => s.toggleShuffle);
	const cycleRepeat = useFlowStore((s) => s.cycleRepeat);
	const setPlaybackRate = useFlowStore((s) => s.setPlaybackRate);
	const setSleep = useFlowStore((s) => s.setSleep);
	const toggleLike = useFlowStore((s) => s.toggleLike);
	const playQueue = useFlowStore((s) => s.playQueue);
	const liked = useFlowStore((s) => current ? s.liked.some((t) => t.id === current.id) : false);
	const setShowFullPlayer = useFlowStore((s) => s.setShowFullPlayer);
	const setShowQueue = useFlowStore((s) => s.setShowQueue);
	const setShowLyrics = useFlowStore((s) => s.setShowLyrics);
	const notify = useFlowStore((s) => s.notify);
	const downloaded = useIsDownloaded(current?.videoId);
	const [busyDl, setBusyDl] = (0, import_react.useState)(false);
	const [busyQueue, setBusyQueue] = (0, import_react.useState)(false);
	const [queueProg, setQueueProg] = (0, import_react.useState)("");
	const [lyrics, setLyrics] = (0, import_react.useState)(null);
	const [lyricsLoading, setLyricsLoading] = (0, import_react.useState)(false);
	const [glow, setGlow] = (0, import_react.useState)(null);
	const [sharing, setSharing] = (0, import_react.useState)(false);
	const [showSleepMenu, setShowSleepMenu] = (0, import_react.useState)(false);
	const lyricsBox = (0, import_react.useRef)(null);
	const { mounted, open } = useOpenTransition(show, 260);
	(0, import_react.useEffect)(() => {
		if (!current?.artwork) {
			setGlow(null);
			return;
		}
		let cancelled = false;
		averageArtworkColor(current.artwork).then((color) => {
			if (!cancelled) setGlow(color);
		});
		return () => {
			cancelled = true;
		};
	}, [current?.artwork]);
	(0, import_react.useEffect)(() => {
		if (!current || current.isLive) {
			setLyrics(null);
			return;
		}
		const key = current.videoId || current.id;
		const hit = lyricsMem.get(key);
		if (hit) {
			setLyrics(hit);
			return;
		}
		let cancelled = false;
		setLyricsLoading(true);
		getTrackLyrics({ data: {
			videoId: current.videoId,
			title: current.title,
			artist: current.artist,
			album: current.album,
			duration: current.duration || duration || void 0
		} }).then((res) => {
			if (cancelled) return;
			lyricsMem.set(key, res);
			setLyrics(res);
		}).catch(() => {
			if (!cancelled) setLyrics(null);
		}).finally(() => {
			if (!cancelled) setLyricsLoading(false);
		});
		return () => {
			cancelled = true;
		};
	}, [
		current?.id,
		current?.videoId,
		current?.title,
		current?.artist,
		current?.album,
		current?.duration,
		current?.isLive,
		duration
	]);
	const activeIdx = lyrics?.synced ? lyrics.lines.reduce((acc, line, i) => currentTime * 1e3 >= line.timeMs ? i : acc, 0) : -1;
	(0, import_react.useEffect)(() => {
		if (!showLyrics || activeIdx < 0) return;
		(lyricsBox.current?.querySelector(`[data-ly="${activeIdx}"]`))?.scrollIntoView({
			block: "center",
			behavior: "smooth"
		});
	}, [activeIdx, showLyrics]);
	if (!mounted || !current) return null;
	const progress = duration > 0 ? Math.min(100, currentTime / duration * 100) : 0;
	const rightTime = remainingTime && duration > 0 ? Math.max(0, duration - currentTime) : duration;
	const RepeatIcon = repeat === "one" ? Repeat1 : Repeat;
	const canDownload = canDownloadTrack(current);
	const shareLine = (activeIdx >= 0 ? lyrics?.lines[activeIdx]?.text : lyrics?.lines[0]?.text) || current.title;
	const runShare = () => {
		if (sharing) return;
		setSharing(true);
		shareLyricsCard({
			track: current,
			line: shareLine
		}).then((how) => {
			if (how === "shared") notify("Testo condiviso");
			else if (how === "downloaded") notify("Immagine della card salvata");
			else notify("Testo copiato");
		}).catch(() => notify("Condivisione non riuscita")).finally(() => setSharing(false));
	};
	const cycleRate = () => {
		const rates = [
			1,
			1.25,
			1.5,
			.8
		];
		const nextRate = rates[(rates.indexOf(playbackRate) + 1) % rates.length];
		setPlaybackRate(nextRate);
	};
	const startRadioMix = async () => {
		if (!current) return;
		try {
			const related = await getRelatedTracks({ data: {
				artist: current.artist,
				title: current.title,
				excludeId: current.id
			} });
			if (related && related.length) {
				playQueue([current, ...related], 0);
				notify("Radio avviata");
			}
		} catch {
			notify("Impossibile avviare la radio");
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: cn("player-full fixed inset-0 z-50 flex h-dvh flex-col overflow-hidden bg-bg pt-[env(safe-area-inset-top)]", open ? "is-open" : "is-closing"),
		role: "dialog",
		style: glow ? { ["--player-glow"]: glow } : void 0,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "pointer-events-none absolute inset-0",
			"aria-hidden": true,
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
				src: current.artwork,
				alt: "",
				referrerPolicy: "no-referrer",
				className: "player-ambient size-full object-cover blur-3xl opacity-40 saturate-150"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "absolute inset-0",
				style: { background: glow ? `linear-gradient(180deg, color-mix(in oklab, ${glow} 55%, transparent) 0%, rgb(0 0 0 / 0.55) 42%, rgb(0 0 0 / 0.88) 100%)` : "linear-gradient(180deg, rgb(0 0 0 / 0.28) 0%, rgb(0 0 0 / 0.82) 100%)" }
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "relative z-10 flex min-h-0 flex-1 flex-col",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mx-2 mt-1 flex items-center justify-between rounded-2xl px-1 py-0.5 player-glass",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: () => setShowFullPlayer(false),
						className: "flex size-11 items-center justify-center rounded-full hover:bg-elevated/60",
						"aria-label": "Chiudi",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronDown, { className: "size-6" })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs font-medium tracking-wide text-muted uppercase",
						children: "In riproduzione"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								onClick: runShare,
								disabled: sharing,
								className: cn("flex size-11 items-center justify-center rounded-full transition-colors", sharing ? "text-primary" : "text-fg hover:text-primary"),
								"aria-label": "Condividi testo",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Share2, { className: "size-5" })
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								onClick: () => {
									setShowQueue(false);
									setShowLyrics(!showLyrics);
								},
								className: cn("flex size-11 items-center justify-center rounded-full transition-colors", showLyrics ? "text-primary" : "text-fg hover:text-primary"),
								"aria-label": "Testi",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MicVocal, { className: "size-5" })
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								onClick: () => {
									setShowLyrics(false);
									setShowQueue(!showQueue);
								},
								className: cn("flex size-11 items-center justify-center rounded-full transition-colors", showQueue ? "text-primary" : "text-fg hover:text-primary"),
								"aria-label": "Coda",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ListMusic, { className: "size-5" })
							})
						]
					})
				]
			}), showQueue ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "min-h-0 flex-1 overflow-y-auto px-3 pb-8",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "sticky top-0 z-10 mb-2 mt-3 flex items-center justify-between rounded-2xl px-3 py-2 player-glass",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-sm font-medium",
						children: [
							"Coda · ",
							queue.length,
							" brani"
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						disabled: busyQueue || !queue.some(canDownloadTrack),
						onClick: () => {
							setBusyQueue(true);
							setQueueProg("");
							downloadTracks(queue, (done, total) => setQueueProg(`${done}/${total}`)).then((r) => {
								const saved = r.ok + r.skipped;
								notify(r.fail ? `Salvati ${saved}, ${r.fail} errori` : `${saved} brani in cache`);
							}).catch(() => notify("Download coda non riuscito")).finally(() => {
								setBusyQueue(false);
								setQueueProg("");
							});
						},
						className: "h-9 rounded-full bg-primary px-3 text-xs font-semibold text-primary-fg disabled:opacity-50",
						children: busyQueue ? queueProg || "Scarico…" : "Scarica coda"
					})]
				}), queue.map((t, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TrackRow, {
					track: t,
					queue,
					index: i,
					showIndex: true
				}, `${t.id}-${i}`))]
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex min-h-0 flex-1 flex-col px-6 pb-4",
				children: [showLyrics ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					ref: lyricsBox,
					className: "player-glass mx-auto mt-3 min-h-0 w-full max-w-lg flex-1 overflow-y-auto rounded-2xl px-4 py-6 text-center space-y-4",
					children: lyricsLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-col items-center justify-center py-12 text-muted",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "size-7 animate-spin rounded-full border-2 border-primary border-t-transparent" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-4 text-sm",
							children: "Caricamento testi LRCLIB…"
						})]
					}) : !lyrics?.lines.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-col items-center justify-center py-12 text-muted",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MicVocal, { className: "size-12 opacity-25" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-3 text-base font-semibold text-fg",
								children: "Testo non disponibile"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1 text-xs text-subtle",
								children: "Nessun testo sincronizzato trovato per questo brano."
							})
						]
					}) : lyrics.lines.map((line, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						"data-ly": i,
						onClick: () => lyrics.synced && seek(line.timeMs / 1e3),
						className: cn("block w-full py-2 text-center text-lg leading-snug transition-all rounded-lg cursor-pointer", i === activeIdx ? "scale-105 font-extrabold text-primary text-xl" : i < activeIdx ? "text-fg/80 font-medium text-base" : "text-muted/60 text-base hover:text-fg/80"),
						children: line.text
					}, `${line.timeMs}-${i}`))
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: () => setShowLyrics(true),
					className: "player-art-float mx-auto mt-6 aspect-square w-[min(100%-2rem,22rem)] overflow-hidden rounded-3xl bg-elevated ring-1 ring-white/10",
					"aria-label": "Mostra testi",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TrackArt, {
						src: current.artwork,
						alt: current.title
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "player-glass mt-4 rounded-3xl px-4 py-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-start gap-3",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "min-w-0 flex-1",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
										className: "truncate text-2xl font-bold tracking-tight",
										children: current.title
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-1 truncate text-sm font-medium text-muted",
										children: current.artist
									})]
								}),
								canDownload ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									disabled: busyDl,
									onClick: () => {
										if (!current.videoId) return;
										setBusyDl(true);
										(downloaded ? removeDownload(current.videoId) : downloadTrack(current)).then(() => notify(downloaded ? "Download rimosso" : "Brano salvato offline")).catch(() => notify("Download non riuscito")).finally(() => setBusyDl(false));
									},
									className: cn("size-10 flex items-center justify-center rounded-full text-muted hover:text-fg", downloaded && "text-primary"),
									"aria-label": downloaded ? "Rimuovi download" : "Scarica",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { className: "size-5" })
								}) : null,
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									onClick: () => toggleLike(current),
									className: cn("size-10 flex items-center justify-center rounded-full", liked ? "text-primary" : "text-muted hover:text-fg"),
									"aria-label": "Mi piace",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Heart, { className: cn("size-6", liked && "fill-current") })
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							type: "range",
							min: 0,
							max: duration || 1,
							step: .25,
							value: Math.min(currentTime, duration || 1),
							onChange: (e) => seek(Number(e.target.value)),
							className: "mt-5 h-1.5 w-full appearance-none rounded-full bg-elevated cursor-pointer accent-primary",
							style: { background: `linear-gradient(to right, var(--color-primary) ${progress}%, rgb(255 255 255 / 0.18) ${progress}%)` }
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-1.5 flex justify-between text-xs tabular-nums text-subtle",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: formatTime(currentTime) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: remainingTime ? `-${formatTime(rightTime)}` : formatTime(rightTime) })]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-3 flex items-center justify-between",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									onClick: toggleShuffle,
									className: cn("size-10 flex items-center justify-center rounded-full transition-colors", shuffle ? "text-primary" : "text-muted hover:text-fg"),
									"aria-label": "Shuffle",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Shuffle, { className: "size-5" })
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									onClick: prev,
									className: "size-12 flex items-center justify-center rounded-full text-fg hover:bg-elevated/50 active:scale-95",
									"aria-label": "Brano precedente",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SkipBack, { className: "size-7 fill-current" })
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									onClick: togglePlay,
									className: "flex size-16 items-center justify-center rounded-full bg-primary text-primary-fg shadow-lg transition-transform active:scale-95 hover:scale-105",
									"aria-label": "Play/Pausa",
									children: isPlaying ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pause, { className: "size-7 fill-current" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, { className: "size-7 fill-current ml-0.5" })
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									onClick: next,
									className: "size-12 flex items-center justify-center rounded-full text-fg hover:bg-elevated/50 active:scale-95",
									"aria-label": "Brano successivo",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SkipForward, { className: "size-7 fill-current" })
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									onClick: cycleRepeat,
									className: cn("size-10 flex items-center justify-center rounded-full transition-colors", repeat !== "off" ? "text-primary" : "text-muted hover:text-fg"),
									"aria-label": "Ripeti",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RepeatIcon, { className: "size-5" })
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-3 flex items-center justify-between border-t border-border/30 pt-2 text-xs text-muted",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									type: "button",
									onClick: cycleRate,
									className: "flex items-center gap-1 rounded-full bg-elevated/60 px-2.5 py-1 font-semibold hover:text-fg",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Gauge, { className: "size-3.5" }),
										playbackRate,
										"x"
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "relative",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
										type: "button",
										onClick: () => setShowSleepMenu(!showSleepMenu),
										className: cn("flex items-center gap-1 rounded-full bg-elevated/60 px-2.5 py-1 font-semibold hover:text-fg", sleepEndsAt && "text-primary"),
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Moon, { className: "size-3.5" }), sleepEndsAt ? "Timer attivo" : "Timer"]
									}), showSleepMenu ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "absolute bottom-9 right-0 z-50 min-w-36 rounded-xl bg-elevated/95 p-2 shadow-2xl backdrop-blur-md ring-1 ring-border text-xs space-y-1",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "px-2 py-1 font-bold text-muted uppercase tracking-wider text-[10px]",
											children: "Timer sonno"
										}), [
											[null, "Disattivato"],
											[15, "15 minuti"],
											[30, "30 minuti"],
											[45, "45 minuti"],
											[60, "1 ora"]
										].map(([mins, label]) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
											type: "button",
											onClick: () => {
												setSleep(mins);
												setShowSleepMenu(false);
											},
											className: "block w-full rounded-lg px-2 py-1.5 text-left font-medium hover:bg-surface active:bg-primary active:text-primary-fg",
											children: label
										}, String(mins)))]
									}) : null]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									type: "button",
									onClick: () => void startRadioMix(),
									className: "flex items-center gap-1 rounded-full bg-elevated/60 px-2.5 py-1 font-semibold hover:text-fg",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Radio, { className: "size-3.5 text-primary" }), "Radio brano"]
								})
							]
						})
					]
				})]
			})]
		})]
	});
}
var loadLibrary = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(createSsrRpc("a647c0c3f3b4aeb4738fff3de93771df92b8a50843fdc50af33dc5655a22b8b9"));
var saveLibrary = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((data) => data).handler(createSsrRpc("24128d9fef7ed7b28e076e3ff5dd8aeb86eaa462cea934c8c730433ef91fb021"));
function wsErrorMessage(code, reason) {
	if (reason && reason.trim()) return reason.trim();
	switch (code) {
		case 1e3: return "Connessione chiusa";
		case 1001: return "Server non disponibile";
		case 1006: return "Connessione interrotta";
		case 1008: return "Connessione rifiutata";
		case 1011: return "Errore interno del server";
		case 1015: return "Certificato non valido";
		default: return "WebSocket non raggiungibile";
	}
}
function installWebSocketGuard(onNotice) {
	if (typeof window === "undefined") return () => {};
	const onError = (event) => {
		const text = `${event.message || ""} ${event.filename || ""}`;
		if (!/websocket|socket/i.test(text)) return;
		event.preventDefault();
		onNotice?.(wsErrorMessage(1006));
	};
	const onReject = (event) => {
		const reason = event.reason;
		const text = typeof reason === "string" ? reason : reason instanceof Error ? `${reason.name} ${reason.message}` : String(reason ?? "");
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
var dict = {
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
		lyrics: "Testi"
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
		lyrics: "Lyrics"
	}
};
function t(locale, key) {
	return dict[locale][key] ?? dict.it[key];
}
function useT() {
	const locale = useFlowStore((s) => s.settings.locale);
	return (key) => t(locale, key);
}
var STORE_KEY = "flow_lastfm";
var EMPTY_LASTFM = {
	apiKey: "",
	apiSecret: "",
	sessionKey: "",
	username: "",
	enabled: false
};
function readLastFmConfig() {
	if (typeof window === "undefined") return EMPTY_LASTFM;
	try {
		const raw = localStorage.getItem(STORE_KEY);
		return raw ? {
			...EMPTY_LASTFM,
			...JSON.parse(raw)
		} : EMPTY_LASTFM;
	} catch {
		return EMPTY_LASTFM;
	}
}
function writeLastFmConfig(cfg) {
	if (typeof window === "undefined") return;
	try {
		localStorage.setItem(STORE_KEY, JSON.stringify(cfg));
	} catch {}
}
var lastFmHandshake = createServerFn({ method: "POST" }).validator((d) => d).handler(createSsrRpc("6095f063f621f088fea9299e213229ee522c781627f94d6033222a923eeff0b0"));
var lastFmUpdate = createServerFn({ method: "POST" }).validator((d) => d).handler(createSsrRpc("351f225b34096eb08e6d35a1522b9a9fb7771752e02520f75204619318aa87bf"));
function PlaybackWatch() {
	const sleepEndsAt = useFlowStore((s) => s.sleepEndsAt);
	const current = useFlowStore((s) => s.current);
	const isPlaying = useFlowStore((s) => s.isPlaying);
	const currentTime = useFlowStore((s) => s.currentTime);
	const duration = useFlowStore((s) => s.duration);
	const scrobbled = (0, import_react.useRef)("");
	const startedAt = (0, import_react.useRef)(0);
	const nowPlayingSent = (0, import_react.useRef)("");
	(0, import_react.useEffect)(() => {
		hydrateDownloads();
	}, []);
	(0, import_react.useEffect)(() => {
		if (!sleepEndsAt) return;
		const tick = () => {
			const s = useFlowStore.getState();
			if (!s.sleepEndsAt) return;
			if (Date.now() < s.sleepEndsAt) return;
			s.pause();
			s.setSleep(null);
			s.notify("Timer spento");
		};
		tick();
		const id = window.setInterval(tick, 1e3);
		return () => window.clearInterval(id);
	}, [sleepEndsAt]);
	(0, import_react.useEffect)(() => {
		if (!current) return;
		startedAt.current = Math.floor(Date.now() / 1e3);
		nowPlayingSent.current = "";
	}, [current?.id]);
	(0, import_react.useEffect)(() => {
		const track = current;
		if (!track || track.isLive || track.source === "radio") return;
		const cfg = readLastFmConfig();
		if (!cfg.enabled || !cfg.apiKey || !cfg.apiSecret || !cfg.sessionKey) return;
		if (useFlowStore.getState().settings.privateSession) return;
		if (isPlaying && nowPlayingSent.current !== track.id) {
			nowPlayingSent.current = track.id;
			lastFmUpdate({ data: {
				apiKey: cfg.apiKey,
				apiSecret: cfg.apiSecret,
				sessionKey: cfg.sessionKey,
				artist: track.artist,
				title: track.title,
				album: track.album,
				duration: duration || track.duration || void 0,
				nowPlaying: true
			} }).catch(() => {});
		}
		const dur = duration || track.duration || 0;
		const listened = currentTime;
		const threshold = dur > 0 ? Math.min(dur * .5, 240) : 30;
		if (isPlaying && listened >= Math.max(30, threshold) && scrobbled.current !== track.id) {
			scrobbled.current = track.id;
			lastFmUpdate({ data: {
				apiKey: cfg.apiKey,
				apiSecret: cfg.apiSecret,
				sessionKey: cfg.sessionKey,
				artist: track.artist,
				title: track.title,
				album: track.album,
				duration: dur || void 0,
				timestamp: startedAt.current || Math.floor(Date.now() / 1e3),
				nowPlaying: false
			} }).catch(() => {});
		}
	}, [
		current,
		isPlaying,
		currentTime,
		duration
	]);
	return null;
}
function HelpOverlay() {
	const show = useFlowStore((s) => s.showHelp);
	const setShowHelp = useFlowStore((s) => s.setShowHelp);
	if (!show) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "fixed inset-0 z-[95] flex items-center justify-center bg-bg/80 p-4",
		onClick: () => setShowHelp(false),
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "w-full max-w-sm rounded-xl bg-elevated p-5 ring-1 ring-border",
			onClick: (e) => e.stopPropagation(),
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "text-lg font-bold",
					children: "Scorciatoie"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "mt-3 space-y-2 text-sm",
					children: [
						["Spazio", "Play / pausa"],
						["← / →", "Salta 10 secondi"],
						["Shift + frecce", "Brano precedente / successivo"],
						["↑ / ↓", "Volume"],
						["M", "Muto"],
						["S / R", "Casuale / Ripeti"],
						["F / L / Q", "Player / Testi / Coda"],
						["D", "Flow DJ"],
						["Esc", "Chiudi"]
					].map(([k, v]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "flex justify-between gap-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "font-medium",
							children: k
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-muted",
							children: v
						})]
					}, k))
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: () => setShowHelp(false),
					className: "mt-4 text-sm font-medium text-primary",
					children: "Chiudi"
				})
			]
		})
	});
}
function InstallHint() {
	const [text, setText] = (0, import_react.useState)(null);
	const [promptEvent, setPromptEvent] = (0, import_react.useState)(null);
	(0, import_react.useEffect)(() => {
		try {
			if (localStorage.getItem("flow_install_hide")) return;
		} catch {
			return;
		}
		if (window.matchMedia("(display-mode: standalone)").matches || Boolean(navigator.standalone)) return;
		if (/iPhone|iPad|iPod/i.test(navigator.userAgent)) {
			setText("Su iPhone: Condividi → Aggiungi a Home");
			return;
		}
		const onPrompt = (e) => {
			e.preventDefault();
			setPromptEvent(e);
			setText("Installa Flow sul telefono");
		};
		window.addEventListener("beforeinstallprompt", onPrompt);
		return () => window.removeEventListener("beforeinstallprompt", onPrompt);
	}, []);
	if (!text) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex items-center gap-2 bg-elevated px-3 py-2 text-xs text-fg md:hidden",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "min-w-0 flex-1",
				children: text
			}),
			promptEvent ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				className: "font-semibold text-primary",
				onClick: () => {
					promptEvent.prompt();
					setText(null);
				},
				children: "Installa"
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				className: "text-muted",
				onClick: () => {
					try {
						localStorage.setItem("flow_install_hide", "1");
					} catch {}
					setText(null);
				},
				children: "Chiudi"
			})
		]
	});
}
function AuthChip() {
	const { user, isPending } = useCurrentUserState();
	const [signingOut, setSigningOut] = (0, import_react.useState)(false);
	const t = useT();
	if (isPending) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "size-8 shrink-0 animate-pulse rounded-full bg-elevated" });
	if (!user) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
		to: "/login",
		className: "rounded-full bg-fg px-4 py-1.5 text-sm font-bold text-bg",
		children: t("login")
	});
	const label = user.displayName ?? user.primaryEmail ?? "Account";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex items-center gap-2",
		children: [
			user.profileImageUrl ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
				src: user.profileImageUrl,
				alt: "",
				className: "size-8 rounded-full object-cover"
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "grid size-8 place-items-center rounded-full bg-primary text-sm font-bold text-primary-fg",
				children: label.charAt(0).toUpperCase()
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "hidden max-w-[8rem] truncate text-sm font-medium md:inline",
				children: label
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				disabled: signingOut,
				onClick: () => {
					setSigningOut(true);
					signOut().catch(() => setSigningOut(false));
				},
				className: "text-xs font-medium text-muted hover:text-fg",
				children: signingOut ? "…" : t("logout")
			})
		]
	});
}
function CloudSync() {
	const { user, isPending } = useCurrentUserState();
	(0, import_react.useEffect)(() => {
		if (isPending || !user) return;
		let cancelled = false;
		let timer = 0;
		loadLibrary().then((data) => {
			if (cancelled) return;
			const local = useFlowStore.getState();
			if (data && (data.liked.length > 0 || data.playlists.length > 0 || data.recents.length > 0) && data) local.importCloud(data);
			else {
				saveLibrary({ data: local.dumpCloud() }).catch(() => {});
				useFlowStore.setState({ cloudReady: true });
			}
		}).catch(() => {
			useFlowStore.setState({ cloudReady: true });
		});
		const unsub = useFlowStore.subscribe((s, prev) => {
			if (!s.cloudReady) return;
			if (s.liked === prev.liked && s.recents === prev.recents && s.playlists === prev.playlists && s.settings === prev.settings && s.volume === prev.volume) return;
			window.clearTimeout(timer);
			timer = window.setTimeout(() => {
				saveLibrary({ data: useFlowStore.getState().dumpCloud() }).catch(() => {});
			}, 900);
		});
		return () => {
			cancelled = true;
			window.clearTimeout(timer);
			unsub();
		};
	}, [user?.id, isPending]);
	return null;
}
function Prefs() {
	const theme = useFlowStore((s) => s.settings.theme);
	const locale = useFlowStore((s) => s.settings.locale);
	const notify = useFlowStore((s) => s.notify);
	(0, import_react.useEffect)(() => {
		const root = document.documentElement;
		root.classList.toggle("theme-light", theme === "light");
		root.lang = locale;
		root.style.colorScheme = theme;
		const vis = () => root.classList.toggle("app-hidden", document.hidden);
		vis();
		document.addEventListener("visibilitychange", vis);
		return () => document.removeEventListener("visibilitychange", vis);
	}, [theme, locale]);
	(0, import_react.useEffect)(() => installWebSocketGuard((msg) => notify(msg)), [notify]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PlaybackWatch, {});
}
function StationEngine() {
	const stationOn = useFlowStore((s) => s.stationOn);
	const current = useFlowStore((s) => s.current);
	const queue = useFlowStore((s) => s.queue);
	const queueIndex = useFlowStore((s) => s.queueIndex);
	const appendQueue = useFlowStore((s) => s.appendQueue);
	(0, import_react.useEffect)(() => {
		if (!stationOn || !current) return;
		if (queue.length - queueIndex > 3) return;
		let cancelled = false;
		getRelatedTracks({ data: {
			artist: current.artist,
			title: current.title,
			excludeId: current.id
		} }).then((tracks) => {
			if (!cancelled && tracks.length) appendQueue(tracks);
		});
		return () => {
			cancelled = true;
		};
	}, [
		stationOn,
		current?.id,
		queueIndex,
		queue.length
	]);
	return null;
}
function ToastHost() {
	const notice = useFlowStore((s) => s.notice);
	if (!notice) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "pointer-events-none fixed inset-x-0 bottom-[calc(5.5rem+env(safe-area-inset-bottom))] z-[90] flex justify-center px-4 md:bottom-28",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "rounded-full bg-fg px-4 py-2 text-sm font-medium text-bg shadow-lg",
			children: notice
		})
	});
}
var chatTurn = createServerFn({ method: "POST" }).validator((d) => d).handler(createSsrRpc("73277765d67cecebc5623e3d311b5ab07b43284d7a420c462a42185468509542"));
var speakToken = 0;
function hasLetters(text) {
	return /[\p{L}]/u.test(text);
}
function takeTwoSentences(text) {
	const found = [];
	const re = /[^.!?…]+(?:[.!?…]+|(?=$))/g;
	let m;
	while (m = re.exec(text)) {
		const piece = m[0].trim();
		if (!piece) continue;
		found.push(piece);
		if (found.length >= 2) break;
	}
	return (found.join(" ") || text).trim();
}
function collapseWs(text) {
	return text.replace(/\s+/g, " ").trim();
}
function speakable(text) {
	const src = (text || "").replace(/\r/g, "").trim();
	if (!src) return "";
	const letters = hasLetters(src);
	let out = takeTwoSentences(collapseWs(src.split(/\n\s*\n/, 1)[0] ?? src) || (letters ? collapseWs(src) : ""));
	if (out.length > 280) out = out.slice(0, 280).trim();
	if (!out && letters) out = collapseWs(src).slice(0, 280);
	return out;
}
function getSynth() {
	if (typeof window === "undefined") return null;
	return window.speechSynthesis ?? null;
}
function stopSpeaking() {
	speakToken += 1;
	getSynth()?.cancel();
}
function waitVoices(synth) {
	const have = synth.getVoices();
	if (have.length) return Promise.resolve(have);
	return new Promise((resolve) => {
		let settled = false;
		const finish = () => {
			if (settled) return;
			settled = true;
			synth.removeEventListener("voiceschanged", finish);
			window.clearTimeout(timer);
			resolve(synth.getVoices());
		};
		synth.addEventListener("voiceschanged", finish);
		const timer = window.setTimeout(finish, 1500);
	});
}
function pickVoice(voices, lang) {
	const prefix = lang === "it" ? "it" : "en";
	const exact = lang === "it" ? "it-it" : "en-us";
	const match = voices.filter((v) => v.lang.replace("_", "-").toLowerCase().startsWith(prefix));
	if (!match.length) return void 0;
	const score = (v) => {
		const code = v.lang.replace("_", "-").toLowerCase();
		const name = v.name.toLowerCase();
		let n = 1;
		if (code === exact || code.startsWith(`${exact}-`)) n += 2;
		if (name.includes("google") || name.includes("microsoft")) n += 4;
		if (name.includes("neural") || name.includes("natural")) n += 3;
		return n;
	};
	return [...match].sort((a, b) => score(b) - score(a))[0];
}
function speakDj(text, lang, opts) {
	const synth = getSynth();
	if (!synth) {
		opts?.onEnd?.();
		return;
	}
	synth.cancel();
	const spoken = speakable(text);
	const token = speakToken += 1;
	if (!spoken) {
		opts?.onEnd?.();
		return;
	}
	let ended = false;
	const end = () => {
		if (ended) return;
		ended = true;
		opts?.onEnd?.();
	};
	waitVoices(synth).then((voices) => {
		if (token !== speakToken) {
			end();
			return;
		}
		const utt = new SpeechSynthesisUtterance(spoken);
		utt.lang = lang === "it" ? "it-IT" : "en-US";
		utt.rate = lang === "it" ? 1.02 : 1;
		utt.pitch = 1;
		const voice = pickVoice(voices, lang);
		if (voice) utt.voice = voice;
		utt.onstart = () => {
			if (ended || token !== speakToken) return;
			opts?.onStart?.();
		};
		utt.onend = end;
		utt.onerror = end;
		window.setTimeout(() => {
			if (token !== speakToken) {
				end();
				return;
			}
			try {
				synth.speak(utt);
			} catch {
				end();
			}
		}, 40);
	});
}
function recognitionCtor() {
	if (typeof window === "undefined") return void 0;
	const w = window;
	return w.SpeechRecognition || w.webkitSpeechRecognition;
}
function canListen() {
	return Boolean(recognitionCtor());
}
function startListening(lang, handlers) {
	const Ctor = recognitionCtor();
	if (!Ctor) {
		handlers.onEnd?.();
		return () => {};
	}
	const rec = new Ctor();
	rec.lang = lang === "it" ? "it-IT" : "en-US";
	rec.interimResults = true;
	rec.continuous = false;
	let finals = "";
	let stopped = false;
	let closed = false;
	const close = () => {
		if (closed) return;
		closed = true;
		if (finals) handlers.onFinal(finals);
		handlers.onEnd?.();
	};
	rec.onresult = (ev) => {
		let interim = "";
		for (let i = ev.resultIndex; i < ev.results.length; i++) {
			const res = ev.results[i];
			const t = (res?.[0]?.transcript || "").trim();
			if (!t) continue;
			if (res.isFinal) finals = `${finals} ${t}`.trim();
			else interim = `${interim} ${t}`.trim();
		}
		const live = `${finals} ${interim}`.trim();
		if (live) handlers.onPartial?.(live);
	};
	rec.onerror = (ev) => {
		const err = ev.error || "";
		if (err === "no-speech" || err === "aborted") return;
		if (err === "not-allowed") {
			handlers.onError?.("Microfono bloccato");
			return;
		}
		handlers.onError?.(err);
	};
	rec.onend = close;
	try {
		rec.start();
	} catch {
		close();
		return () => {};
	}
	return () => {
		if (stopped) return;
		stopped = true;
		try {
			rec.stop();
		} catch {
			close();
		}
	};
}
var CHIPS = [
	"Suona qualcosa di simile",
	"Radio Italia",
	"Testi",
	"Mix focus",
	"Party",
	"Chill"
];
function uid() {
	return `m_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}
function applyChatResult(result) {
	const s = useFlowStore.getState();
	switch (result.intent) {
		case "skip":
			s.next();
			break;
		case "pause":
			s.pause();
			break;
		case "resume":
			s.resume();
			break;
		case "love":
			if (s.current) s.toggleLike(s.current);
			break;
		case "play":
		case "search":
		case "similar":
		case "mood":
			if (result.tracks?.length) s.playQueue(result.tracks);
			break;
		case "queue":
			for (const track of result.tracks ?? []) s.addToQueue(track);
			break;
		case "radio": {
			const first = result.radios?.[0];
			if (first) s.playTrack(stationToTrack(first));
			break;
		}
	}
}
function TypingDots() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex items-end gap-2",
		"aria-live": "polite",
		"aria-label": "Flow DJ sta scrivendo",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "grid size-8 shrink-0 place-items-center rounded-full bg-elevated text-primary",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bot, { className: "size-4" })
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex h-10 items-center gap-1 rounded-2xl bg-elevated px-3",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "size-2 animate-bounce rounded-full bg-muted" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "size-2 animate-bounce rounded-full bg-muted",
					style: { animationDelay: "0.12s" }
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "size-2 animate-bounce rounded-full bg-muted",
					style: { animationDelay: "0.24s" }
				})
			]
		})]
	});
}
function ChatPanel() {
	const showChat = useFlowStore((s) => s.showChat);
	const setShowChat = useFlowStore((s) => s.setShowChat);
	const current = useFlowStore((s) => s.current);
	const isPlaying = useFlowStore((s) => s.isPlaying);
	const playTrack = useFlowStore((s) => s.playTrack);
	const next = useFlowStore((s) => s.next);
	const pause = useFlowStore((s) => s.pause);
	const toggleLike = useFlowStore((s) => s.toggleLike);
	const notify = useFlowStore((s) => s.notify);
	const liked = useFlowStore((s) => s.current ? s.liked.some((t) => t.id === s.current.id) : false);
	const voiceOn = useFlowStore((s) => s.settings.voiceOn);
	const locale = useFlowStore((s) => s.settings.locale);
	const patchSettings = useFlowStore((s) => s.patchSettings);
	const setVoiceDuck = useFlowStore((s) => s.setVoiceDuck);
	const [messages, setMessages] = (0, import_react.useState)([]);
	const [draft, setDraft] = (0, import_react.useState)("");
	const [busy, setBusy] = (0, import_react.useState)(false);
	const [listening, setListening] = (0, import_react.useState)(false);
	const [heard, setHeard] = (0, import_react.useState)("");
	const busyRef = (0, import_react.useRef)(false);
	const inputRef = (0, import_react.useRef)(null);
	const endRef = (0, import_react.useRef)(null);
	const stopListenRef = (0, import_react.useRef)(null);
	const listenLiveRef = (0, import_react.useRef)(false);
	const lang = locale === "en" ? "en" : "it";
	const micOk = canListen();
	const haltSpeech = () => {
		stopSpeaking();
		setVoiceDuck(false);
	};
	const haltListen = () => {
		listenLiveRef.current = false;
		stopListenRef.current?.();
		stopListenRef.current = null;
		setListening(false);
		setHeard("");
	};
	const talk = (text) => {
		if (!useFlowStore.getState().settings.voiceOn) return;
		speakDj(speakable(text), lang, {
			onStart: () => setVoiceDuck(true),
			onEnd: () => setVoiceDuck(false)
		});
	};
	(0, import_react.useEffect)(() => {
		if (showChat && !voiceOn) inputRef.current?.focus();
	}, [showChat, voiceOn]);
	(0, import_react.useEffect)(() => {
		endRef.current?.scrollIntoView({ block: "end" });
	}, [messages, busy]);
	(0, import_react.useEffect)(() => {
		return () => {
			stopListenRef.current?.();
			stopListenRef.current = null;
			listenLiveRef.current = false;
			stopSpeaking();
			useFlowStore.getState().setVoiceDuck(false);
		};
	}, []);
	const send = async (raw) => {
		const text = raw.trim();
		if (!text || busyRef.current) return;
		haltListen();
		haltSpeech();
		busyRef.current = true;
		setBusy(true);
		setDraft("");
		setMessages((prev) => [...prev, {
			id: uid(),
			role: "user",
			text
		}]);
		try {
			const state = useFlowStore.getState();
			const history = messages.slice(-8).map((m) => ({
				role: m.role,
				text: m.text
			}));
			const result = await chatTurn({ data: {
				message: text,
				title: state.current?.title,
				artist: state.current?.artist,
				history
			} });
			applyChatResult(result);
			const reply = result.reply?.trim() || "Ecco cosa ho trovato.";
			setMessages((prev) => [...prev, {
				id: uid(),
				role: "assistant",
				text: reply,
				tracks: result.tracks,
				radios: result.radios
			}]);
			talk(reply);
		} catch {
			notify("Non riesco a rispondere ora");
			const reply = "Qualcosa è andato storto. Riprova tra un attimo.";
			setMessages((prev) => [...prev, {
				id: uid(),
				role: "assistant",
				text: reply
			}]);
			talk(reply);
		} finally {
			busyRef.current = false;
			setBusy(false);
		}
	};
	const toggleVoice = () => {
		if (voiceOn) {
			patchSettings({ voiceOn: false });
			haltSpeech();
			return;
		}
		patchSettings({ voiceOn: true });
		speakDj(speakable(lang === "en" ? "Hi, I'm Flow DJ. What should we play?" : "Ciao, sono Flow DJ. Dimmi cosa vuoi ascoltare."), lang, {
			onStart: () => setVoiceDuck(true),
			onEnd: () => setVoiceDuck(false)
		});
	};
	const onMic = () => {
		if (!micOk || busyRef.current) return;
		if (listening) {
			haltListen();
			return;
		}
		haltSpeech();
		listenLiveRef.current = true;
		setListening(true);
		setHeard("");
		try {
			stopListenRef.current = startListening(lang, {
				onPartial: (text) => {
					setHeard(text);
					setDraft(text);
				},
				onFinal: (text) => {
					if (!listenLiveRef.current) return;
					setHeard(text);
					setDraft(text);
					send(text);
				},
				onError: (msg) => notify(msg),
				onEnd: () => {
					listenLiveRef.current = false;
					stopListenRef.current = null;
					setListening(false);
					setHeard("");
				}
			});
		} catch {
			listenLiveRef.current = false;
			setListening(false);
			setHeard("");
		}
	};
	const closeChat = () => {
		haltListen();
		haltSpeech();
		setShowChat(false);
	};
	const empty = messages.length === 0;
	const placeholder = listening ? heard || (lang === "en" ? "Listening…" : "Ti ascolto…") : "Chiedi un brano, un mood…";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: cn("flex h-full min-h-0 flex-col overflow-hidden bg-surface"),
		"aria-label": "Flow DJ",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "flex shrink-0 items-center gap-3 border-b border-border px-3 py-2 pt-[max(0.5rem,env(safe-area-inset-top))] md:pt-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "grid size-10 shrink-0 place-items-center rounded-full bg-elevated",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "size-5 text-primary" })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "min-w-0 flex-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "truncate text-sm font-bold",
							children: "Flow DJ"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "truncate text-xs text-muted",
							children: "Parla o scrivi: brani, mood, testi"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: toggleVoice,
						className: cn("pressable flex size-11 shrink-0 items-center justify-center rounded-full hover:text-fg", voiceOn ? "text-primary" : "text-muted"),
						"aria-label": "Attiva voce",
						"aria-pressed": voiceOn,
						children: voiceOn ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Volume2, { className: "size-5" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(VolumeOff, { className: "size-5" })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: closeChat,
						className: "pressable flex size-11 shrink-0 items-center justify-center rounded-full text-muted hover:text-fg",
						"aria-label": "Chiudi",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-5" })
					})
				]
			}),
			current ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex shrink-0 items-center gap-2 border-b border-border px-3 py-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "size-10 shrink-0 overflow-hidden rounded-md bg-elevated",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TrackArt, {
							src: current.artwork,
							alt: ""
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "min-w-0 flex-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "truncate text-xs font-medium",
							children: current.title
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "truncate text-xs text-muted",
							children: current.artist
						})]
					}),
					isPlaying ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: () => pause(),
						className: "pressable flex size-10 shrink-0 items-center justify-center rounded-full text-fg",
						"aria-label": "Pausa",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pause, { className: "size-4 fill-current" })
					}) : null,
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: () => next(),
						className: "pressable flex size-10 shrink-0 items-center justify-center rounded-full text-fg",
						"aria-label": "Brano successivo",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SkipForward, { className: "size-4 fill-current" })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: () => toggleLike(current),
						className: cn("pressable flex size-10 shrink-0 items-center justify-center rounded-full", liked ? "text-primary" : "text-muted"),
						"aria-label": liked ? "Rimuovi dai preferiti" : "Aggiungi ai preferiti",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Heart, { className: cn("heart-icon size-4", liked && "is-on fill-current") })
					})
				]
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "scrollbar-none min-h-0 flex-1 overflow-y-auto px-3 py-4",
				children: [empty ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-col gap-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-start gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "grid size-8 shrink-0 place-items-center rounded-full bg-elevated text-primary",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bot, { className: "size-4" })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "rounded-2xl bg-elevated px-3 py-2.5 text-sm leading-relaxed",
							children: "Ciao. Dimmi un artista, un mood o cosa sta suonando."
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex flex-wrap gap-2",
						children: CHIPS.map((chip) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: () => void send(chip),
							className: "chip min-h-10 rounded-full bg-elevated px-3 text-sm font-medium ring-1 ring-border",
							children: chip
						}, chip))
					})]
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-col gap-3",
					children: [
						messages.map((msg) => msg.role === "user" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "flex justify-end",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "max-w-[85%] rounded-2xl bg-primary px-3 py-2 text-sm leading-relaxed text-primary-fg",
								children: msg.text
							})
						}, msg.id) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-col gap-2",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-start gap-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "mt-0.5 grid size-8 shrink-0 place-items-center rounded-full bg-elevated text-primary",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bot, { className: "size-4" })
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "max-w-[85%] whitespace-pre-wrap rounded-2xl bg-elevated px-3 py-2 text-sm leading-relaxed",
										children: msg.text
									})]
								}),
								msg.tracks?.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "ml-10",
									children: msg.tracks.map((track) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TrackRow, {
										track,
										queue: msg.tracks
									}, track.id))
								}) : null,
								msg.radios?.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "ml-10 flex flex-col gap-1",
									children: msg.radios.map((station) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
										type: "button",
										onClick: () => playTrack(stationToTrack(station)),
										className: "pressable flex min-h-10 items-center gap-2 rounded-lg bg-elevated px-2 py-1.5 text-left hover:bg-highlight",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "size-8 shrink-0 overflow-hidden rounded-md bg-surface",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TrackArt, {
													src: station.artwork,
													alt: ""
												})
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Radio, { className: "size-3.5 shrink-0 text-primary" }),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "min-w-0 flex-1 truncate text-sm font-medium",
												children: station.name
											})
										]
									}, station.id))
								}) : null
							]
						}, msg.id)),
						busy ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TypingDots, {}) : null,
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { ref: endRef })
					]
				}), empty && busy ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-4",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TypingDots, {})
				}) : null]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				className: "flex shrink-0 items-center gap-2 border-t border-border px-3 py-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] md:pb-2",
				onSubmit: (e) => {
					e.preventDefault();
					send(draft);
				},
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						ref: inputRef,
						value: draft,
						onChange: (e) => setDraft(e.target.value),
						placeholder,
						autoComplete: "off",
						enterKeyHint: "send",
						disabled: busy,
						className: "h-11 min-w-0 flex-1 rounded-lg bg-elevated px-3 text-base outline-none ring-1 ring-border placeholder:text-subtle disabled:opacity-60",
						"aria-label": "Messaggio per Flow DJ"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: onMic,
						disabled: !micOk || busy,
						className: cn("pressable flex size-11 shrink-0 items-center justify-center rounded-full disabled:opacity-40", listening ? "animate-pulse bg-primary text-primary-fg" : "text-muted hover:text-fg"),
						"aria-label": "Parla",
						"aria-pressed": listening,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mic, { className: "size-4" })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "submit",
						disabled: busy || !draft.trim(),
						className: "pressable flex size-11 shrink-0 items-center justify-center rounded-full bg-primary text-primary-fg disabled:opacity-40",
						"aria-label": "Invia",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Send, { className: "size-4" })
					})
				]
			})
		]
	});
}
function ChatFab() {
	const showChat = useFlowStore((s) => s.showChat);
	const setShowChat = useFlowStore((s) => s.setShowChat);
	const showFullPlayer = useFlowStore((s) => s.showFullPlayer);
	if (showChat || showFullPlayer) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
		type: "button",
		"aria-label": "Flow DJ",
		onClick: () => setShowChat(!showChat),
		className: cn("fixed right-4 z-50 flex size-12 items-center justify-center rounded-full bg-primary text-primary-fg shadow md:hidden", "bottom-[calc(5.5rem+env(safe-area-inset-bottom))]"),
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "size-5" })
	});
}
function ChatToggle() {
	const showChat = useFlowStore((s) => s.showChat);
	const setShowChat = useFlowStore((s) => s.setShowChat);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
		type: "button",
		title: "Flow DJ",
		"aria-label": "Flow DJ",
		onClick: () => setShowChat(!showChat),
		className: cn("rounded-full p-2 hover:text-fg", showChat ? "text-primary" : "text-muted"),
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "size-5" })
	});
}
var NAV = [
	{
		to: "/",
		label: "Home",
		icon: House
	},
	{
		to: "/search",
		label: "Cerca",
		icon: Search
	},
	{
		to: "/radio",
		label: "Radio",
		icon: Radio
	},
	{
		to: "/library",
		label: "Libreria",
		icon: Library
	}
];
function FlowMark({ className }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
		viewBox: "0 0 32 32",
		className,
		"aria-hidden": true,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
				width: "32",
				height: "32",
				rx: "8",
				fill: "currentColor",
				className: "text-primary"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
				x: "8",
				y: "12",
				width: "2.4",
				height: "8",
				rx: "1.2",
				fill: "currentColor",
				className: "text-primary-fg"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
				x: "12.2",
				y: "8",
				width: "2.4",
				height: "16",
				rx: "1.2",
				fill: "currentColor",
				className: "text-primary-fg"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
				x: "16.4",
				y: "11",
				width: "2.4",
				height: "10",
				rx: "1.2",
				fill: "currentColor",
				className: "text-primary-fg"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
				cx: "23",
				cy: "18",
				r: "3.2",
				fill: "currentColor",
				className: "text-primary-fg"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
				x: "21.6",
				y: "7.5",
				width: "2.4",
				height: "11",
				rx: "1.2",
				fill: "currentColor",
				className: "text-primary-fg"
			})
		]
	});
}
function isTypingTarget(el) {
	if (!(el instanceof HTMLElement)) return false;
	const tag = el.tagName;
	return tag === "INPUT" || tag === "TEXTAREA" || el.isContentEditable;
}
function LibraryRail() {
	const pathname = useRouterState({ select: (s) => s.location.pathname });
	const playlists = useFlowStore((s) => s.playlists);
	const liked = useFlowStore((s) => s.liked);
	const recents = useFlowStore((s) => s.recents);
	const trackMap = useFlowStore((s) => s.trackMap);
	const createPlaylist = useFlowStore((s) => s.createPlaylist);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex min-h-0 flex-1 flex-col rounded-lg bg-surface",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center justify-between px-4 py-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
					to: "/library",
					className: cn("nav-link flex items-center gap-2 text-sm font-semibold", pathname.startsWith("/library") ? "is-active text-fg" : "text-muted hover:text-fg"),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Library, { className: "size-5" }), "La tua libreria"]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: () => createPlaylist("Nuova playlist"),
					className: "pressable flex size-8 items-center justify-center rounded-full text-muted hover:bg-elevated hover:text-fg",
					"aria-label": "Crea playlist",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "size-4" })
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex gap-2 px-3 pb-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/library",
					className: "chip rounded-full bg-elevated px-3 py-1 text-xs font-medium",
					children: "Playlist"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/radio",
					className: "chip rounded-full bg-elevated px-3 py-1 text-xs font-medium",
					children: "Radio"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "scrollbar-none min-h-0 flex-1 overflow-y-auto px-2 pb-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
						to: "/library",
						className: "flex items-center gap-3 rounded-md px-2 py-2 hover:bg-elevated",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "liked-wash flex size-12 items-center justify-center rounded-md text-fg",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Heart, { className: "size-5 fill-current" })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "min-w-0",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "block truncate text-sm font-medium",
								children: "Brani che ti piacciono"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "text-xs text-muted",
								children: [
									"Playlist · ",
									liked.length,
									" brani"
								]
							})]
						})]
					}),
					recents[0] ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
						to: "/library",
						className: "flex items-center gap-3 rounded-md px-2 py-2 hover:bg-elevated",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "size-12 overflow-hidden rounded-md bg-elevated",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TrackArt, {
								src: recents[0].artwork,
								alt: ""
							})
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "min-w-0",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "block truncate text-sm font-medium",
								children: "Ascoltati di recente"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "text-xs text-muted",
								children: [recents.length, " brani"]
							})]
						})]
					}) : null,
					playlists.map((p) => {
						const cover = p.trackIds.map((id) => trackMap[id]).find(Boolean);
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
							to: "/library",
							className: "flex items-center gap-3 rounded-md px-2 py-2 hover:bg-elevated",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "size-12 overflow-hidden rounded-md bg-elevated",
								children: cover ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TrackArt, {
									src: cover.artwork,
									alt: ""
								}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "block size-full bg-elevated" })
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "min-w-0",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "block truncate text-sm font-medium",
									children: p.title
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "text-xs text-muted",
									children: [
										"Playlist · ",
										p.trackIds.length,
										" brani"
									]
								})]
							})]
						}, p.id);
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
						to: "/settings",
						className: "mt-2 flex items-center gap-3 rounded-md px-2 py-2 text-muted hover:bg-elevated hover:text-fg",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Settings, { className: "size-5" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-sm font-medium",
							children: "Impostazioni"
						})]
					})
				]
			})
		]
	});
}
function AppShell({ children }) {
	const pathname = useRouterState({ select: (s) => s.location.pathname });
	const nextPath = useRouterState({ select: (s) => {
		const n = s.location.search.next;
		return typeof n === "string" && n.startsWith("/") && !n.startsWith("//") ? n : "/";
	} });
	const { user, isPending } = useCurrentUserState();
	const hydrate = useFlowStore((s) => s.hydrate);
	const showChat = useFlowStore((s) => s.showChat);
	const isLogin = pathname === "/login";
	(0, import_react.useEffect)(() => {
		hydrate();
	}, [hydrate]);
	(0, import_react.useEffect)(() => {
		const t = window.setInterval(() => {
			if (document.hidden) return;
			const s = useFlowStore.getState();
			if (s.isPlaying && s.current) s.addListenMs(5e3);
		}, 5e3);
		return () => window.clearInterval(t);
	}, []);
	(0, import_react.useEffect)(() => {
		const onKey = (e) => {
			if (isTypingTarget(e.target) || e.metaKey || e.ctrlKey || e.altKey) return;
			const s = useFlowStore.getState();
			if (e.code === "Space") {
				e.preventDefault();
				s.togglePlay();
				return;
			}
			if (e.key === "ArrowRight") {
				e.preventDefault();
				if (e.shiftKey) s.next();
				else s.skipBy(10);
				return;
			}
			if (e.key === "ArrowLeft") {
				e.preventDefault();
				if (e.shiftKey) s.prev();
				else s.skipBy(-10);
				return;
			}
			if (e.key === "ArrowUp") {
				e.preventDefault();
				s.setVolume(Math.min(1, s.volume + .05));
				return;
			}
			if (e.key === "ArrowDown") {
				e.preventDefault();
				s.setVolume(Math.max(0, s.volume - .05));
				return;
			}
			if (e.key === "m" || e.key === "M") s.toggleMute();
			if (e.key === "l" || e.key === "L") {
				if (s.current) {
					s.setShowFullPlayer(true);
					s.setShowLyrics(!s.showLyrics);
				}
			}
			if (e.key === "f" || e.key === "F") s.setShowFullPlayer(!s.showFullPlayer);
			if (e.key === "s" || e.key === "S") s.toggleShuffle();
			if (e.key === "r" || e.key === "R") s.cycleRepeat();
			if (e.key === "q" || e.key === "Q") {
				if (s.current) {
					s.setShowFullPlayer(true);
					s.setShowQueue(!s.showQueue);
				}
				return;
			}
			if (e.key === "?" || e.shiftKey && e.key === "/") {
				e.preventDefault();
				s.setShowHelp(!s.showHelp);
				return;
			}
			if (e.key === "d" || e.key === "D") {
				e.preventDefault();
				s.setShowChat(!s.showChat);
				return;
			}
			if (e.key === "Escape") {
				if (s.actionTrack) s.setActionTrack(null);
				else if (s.showChat) s.setShowChat(false);
				else if (s.showFullPlayer) s.setShowFullPlayer(false);
			}
		};
		window.addEventListener("keydown", onKey);
		return () => window.removeEventListener("keydown", onKey);
	}, []);
	if (isLogin) {
		if (user && !isPending) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Navigate, { to: nextPath });
		return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "h-dvh overflow-y-auto bg-bg text-fg",
			children
		});
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex h-dvh flex-col bg-bg text-fg",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(InstallHint, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CloudSync, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Prefs, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StationEngine, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AudioEngine, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex min-h-0 flex-1 gap-2 p-0 md:p-2 md:pb-0",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
						className: "hidden w-72 shrink-0 flex-col gap-2 md:flex",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "rounded-lg bg-surface px-3 py-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
								to: "/",
								className: "mb-2 flex items-center gap-2.5 px-2 py-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FlowMark, { className: "size-8" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "font-heading text-lg font-semibold tracking-tight",
									children: "Flow"
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
								className: "flex flex-col",
								children: NAV.slice(0, 2).map((item) => {
									const active = item.to === "/" ? pathname === "/" : pathname.startsWith(item.to);
									const Icon = item.icon;
									return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
										to: item.to,
										className: cn("nav-link flex h-11 items-center gap-4 rounded-md px-3 text-base font-bold", active ? "is-active text-fg" : "text-muted hover:text-fg"),
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "size-6" }), item.label]
									}, item.to);
								})
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LibraryRail, {})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex min-h-0 min-w-0 flex-1 flex-col",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
								className: "flex items-center gap-3 px-4 py-3 md:hidden pt-[max(0.75rem,env(safe-area-inset-top))]",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
									to: "/",
									className: "flex items-center gap-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FlowMark, { className: "size-8" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "font-heading text-base font-semibold",
										children: "Flow"
									})]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "ml-auto flex items-center gap-2",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChatToggle, {}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AuthChip, {}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
											to: "/settings",
											className: "rounded-full p-2 text-muted",
											"aria-label": "Impostazioni",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Settings, { className: "size-5" })
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
											to: "/charts",
											className: "rounded-full px-3 py-2 text-xs font-medium text-muted",
											children: "Chart"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
											to: "/explore",
											className: "rounded-full px-3 py-2 text-xs font-medium text-muted",
											children: "Esplora"
										})
									]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "hidden items-center gap-2 px-6 py-3 md:flex",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
										to: "/charts",
										className: "nav-link flex items-center gap-2 text-sm font-medium text-muted hover:text-fg",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trophy, { className: "size-4" }), "Classifiche"]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
										to: "/explore",
										className: "nav-link flex items-center gap-2 text-sm font-medium text-muted hover:text-fg",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Compass, { className: "size-4" }), "Esplora"]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
										to: "/discover",
										className: "nav-link flex items-center gap-2 text-sm font-medium text-muted hover:text-fg",
										children: "Scopri"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
										to: "/fresh",
										className: "nav-link flex items-center gap-2 text-sm font-medium text-muted hover:text-fg",
										children: "Novità"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
										to: "/mix",
										className: "nav-link flex items-center gap-2 text-sm font-medium text-muted hover:text-fg",
										children: "Mix"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
										to: "/radio",
										className: "nav-link flex items-center gap-2 text-sm font-medium text-muted hover:text-fg",
										children: "Radio"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
										to: "/settings",
										className: "nav-link ml-auto flex items-center gap-2 text-sm font-medium text-muted hover:text-fg",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Settings, { className: "size-4" }), "Impostazioni"]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChatToggle, {}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "pl-2",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AuthChip, {})
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
								className: cn("spot-main scrollbar-none min-h-0 flex-1 overflow-y-auto overscroll-y-contain px-4 pb-4 sm:px-6 md:rounded-lg md:px-6 md:pt-4"),
								children
							})
						]
					}),
					showChat ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("aside", {
						className: "fixed inset-0 z-[45] overflow-hidden bg-surface md:static md:z-auto md:w-80 md:shrink-0 md:rounded-lg",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChatPanel, {})
					}) : null
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "relative z-40 shrink-0",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MiniPlayer, {}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChatFab, {}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
						className: "flex border-t border-border bg-bg pt-1 pb-[max(0.35rem,env(safe-area-inset-bottom))] md:hidden",
						children: NAV.map((item) => {
							const active = item.to === "/" ? pathname === "/" : pathname.startsWith(item.to);
							const Icon = item.icon;
							return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
								to: item.to,
								className: cn("nav-link flex min-h-14 flex-1 flex-col items-center justify-center gap-0.5 text-[11px] font-medium", active ? "is-active text-fg" : "text-muted"),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "size-6" }), item.label]
							}, item.to);
						})
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FullPlayer, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ActionSheet, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ToastHost, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(HelpOverlay, {})
		]
	});
}
var styles_default = "/assets/styles-kbX5ZWTD.css";
var APP_NAME = "Flow";
var Route$20 = createRootRoute({
	errorComponent: ({ error }) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("html", {
		lang: "it",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("head", { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("meta", { charSet: "utf-8" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("meta", {
				name: "viewport",
				content: "width=device-width, initial-scale=1, viewport-fit=cover"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("title", { children: "Flow" })
		] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("body", {
			className: "antialiased",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid min-h-dvh place-items-center bg-bg px-6 text-fg",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "max-w-sm text-center",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "font-heading text-2xl font-bold",
							children: "Flow"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 text-sm text-muted",
							children: "Qualcosa è andato storto. Ricarica e riprova."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
							href: "/",
							className: "mt-6 inline-flex h-11 items-center rounded-full bg-primary px-5 text-sm font-bold text-primary-fg",
							children: "Torna alla home"
						}),
						error?.message ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-4 text-xs text-subtle",
							children: error.message
						}) : null
					]
				})
			})
		})]
	}),
	head: () => ({
		meta: [
			{ charSet: "utf-8" },
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1, viewport-fit=cover"
			},
			{ title: APP_NAME },
			{
				name: "theme-color",
				content: "#000000"
			},
			{
				name: "description",
				content: "Musica, radio live e testi. Ascolta ovunque, anche sul telefono."
			},
			{
				property: "og:title",
				content: APP_NAME
			},
			{
				property: "og:description",
				content: "Musica, radio live, playlist e testi. Ascolta ovunque."
			},
			{
				property: "og:type",
				content: "website"
			},
			{
				property: "og:image",
				content: "/og.svg"
			},
			{
				name: "twitter:card",
				content: "summary_large_image"
			},
			{
				name: "twitter:title",
				content: APP_NAME
			},
			{
				name: "twitter:description",
				content: "Musica, radio live, playlist e testi. Ascolta ovunque."
			},
			{
				name: "twitter:image",
				content: "/og.svg"
			},
			{
				name: "apple-mobile-web-app-capable",
				content: "yes"
			},
			{
				name: "apple-mobile-web-app-status-bar-style",
				content: "black-translucent"
			},
			{
				name: "apple-mobile-web-app-title",
				content: APP_NAME
			},
			{
				name: "mobile-web-app-capable",
				content: "yes"
			},
			{
				name: "format-detection",
				content: "telephone=no"
			}
		],
		links: [
			{
				rel: "icon",
				type: "image/svg+xml",
				href: "/favicon.svg"
			},
			{
				rel: "stylesheet",
				href: styles_default
			},
			{
				rel: "manifest",
				href: "/__grok/manifest.webmanifest"
			},
			{
				rel: "apple-touch-icon",
				href: "/favicon.svg"
			},
			{
				rel: "stylesheet",
				href: "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,400;0,500;0,600;0,700;0,800&display=swap"
			}
		]
	}),
	component: () => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("html", {
		lang: "it",
		suppressHydrationWarning: true,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("head", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HeadContent, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("body", {
			className: "antialiased",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PreviewHostBridge, {}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AuthProvider, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppShell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Outlet, {}) }) }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Scripts, {})
			]
		})]
	})
});
var $$splitComponentImporter$15 = () => import("./routes-DvuRnV2t.mjs");
var Route$19 = createFileRoute("/")({
	loader: async () => {
		try {
			return await getHomeFeed();
		} catch {
			return {
				trending: [],
				hitsMix: [],
				independent: [],
				radios: [],
				discoverWeekly: [],
				curated: [],
				dailyPlaylists: []
			};
		}
	},
	component: lazyRouteComponent($$splitComponentImporter$15, "component")
});
var $$splitComponentImporter$14 = () => import("./charts-BzAxd3Ab.mjs");
var Route$18 = createFileRoute("/charts")({
	validateSearch: (search) => ({ id: typeof search.id === "string" ? search.id : void 0 }),
	loaderDeps: ({ search }) => ({ id: search.id }),
	loader: async ({ deps }) => {
		const chart = CHARTS.find((c) => c.id === deps.id) || CHARTS[0];
		try {
			return await getChartTracks({ data: {
				query: chart.query,
				playlistId: chart.playlistId
			} });
		} catch {
			return [];
		}
	},
	component: lazyRouteComponent($$splitComponentImporter$14, "component")
});
var $$splitComponentImporter$13 = () => import("./discover-DsrwwstZ.mjs");
var Route$17 = createFileRoute("/discover")({ component: lazyRouteComponent($$splitComponentImporter$13, "component") });
var $$splitComponentImporter$12 = () => import("./explore-C_eQ-uo1.mjs");
var Route$16 = createFileRoute("/explore")({
	validateSearch: (search) => ({ genre: typeof search.genre === "string" ? search.genre : void 0 }),
	loaderDeps: ({ search }) => ({ genre: search.genre }),
	loader: async ({ deps }) => {
		const selected = GENRES.find((g) => g.id === deps.genre) || GENRES[0];
		try {
			return await getGenreMix({ data: { query: selected.query } });
		} catch {
			return [];
		}
	},
	component: lazyRouteComponent($$splitComponentImporter$12, "component")
});
var $$splitComponentImporter$11 = () => import("./fresh-DuThqUHb.mjs");
var Route$15 = createFileRoute("/fresh")({ component: lazyRouteComponent($$splitComponentImporter$11, "component") });
var $$splitComponentImporter$10 = () => import("./friends-BcKlr4R3.mjs");
var Route$14 = createFileRoute("/friends")({ component: lazyRouteComponent($$splitComponentImporter$10, "component") });
var $$splitComponentImporter$9 = () => import("./library-CBRPYa_m.mjs");
var Route$13 = createFileRoute("/library")({ component: lazyRouteComponent($$splitComponentImporter$9, "component") });
var $$splitComponentImporter$8 = () => import("./login-Dy7BjZS7.mjs");
var Route$12 = createFileRoute("/login")({
	validateSearch: (search) => ({
		mode: search.mode === "up" ? "up" : search.mode === "in" ? "in" : void 0,
		next: typeof search.next === "string" && search.next.startsWith("/") && !search.next.startsWith("//") ? search.next : void 0
	}),
	component: lazyRouteComponent($$splitComponentImporter$8, "component")
});
var $$splitComponentImporter$7 = () => import("./mix-8lJGbY24.mjs");
var Route$11 = createFileRoute("/mix")({
	validateSearch: (search) => ({
		mood: typeof search.mood === "string" ? search.mood : void 0,
		q: typeof search.q === "string" ? search.q : void 0
	}),
	component: lazyRouteComponent($$splitComponentImporter$7, "component")
});
var $$splitComponentImporter$6 = () => import("./radio-Df9yVANi.mjs");
var Route$10 = createFileRoute("/radio")({
	validateSearch: (search) => ({ c: typeof search.c === "string" ? search.c : void 0 }),
	loaderDeps: ({ search }) => ({ c: search.c || "IT" }),
	loader: async ({ deps }) => {
		const [top, country] = await Promise.all([getTopRadios().catch(() => []), getCountryRadios({ data: { countryCode: deps.c } }).catch(() => [])]);
		return {
			top,
			country
		};
	},
	component: lazyRouteComponent($$splitComponentImporter$6, "component")
});
var $$splitComponentImporter$5 = () => import("./search-CZ--vDOP.mjs");
var Route$9 = createFileRoute("/search")({
	validateSearch: (search) => ({ q: typeof search.q === "string" ? search.q : void 0 }),
	component: lazyRouteComponent($$splitComponentImporter$5, "component")
});
var $$splitComponentImporter$4 = () => import("./settings-oS4HZ7lJ.mjs");
var Route$8 = createFileRoute("/settings")({ component: lazyRouteComponent($$splitComponentImporter$4, "component") });
var $$splitComponentImporter$3 = () => import("./stats-CN7FzUjj.mjs");
var Route$7 = createFileRoute("/stats")({ component: lazyRouteComponent($$splitComponentImporter$3, "component") });
var Route$6 = createFileRoute("/api/play")({ server: { handlers: { GET: async ({ request }) => {
	const id = new URL(request.url).searchParams.get("v") || "";
	if (!/^[\w-]{11}$/.test(id)) return Response.json({ url: null }, {
		status: 400,
		headers: { "Cache-Control": "no-store" }
	});
	const url = await getAudioUrl(id);
	return Response.json({ url: url || null }, {
		status: url ? 200 : 404,
		headers: {
			"Content-Type": "application/json; charset=utf-8",
			"Cache-Control": "no-store",
			"Access-Control-Allow-Origin": "*"
		}
	});
} } } });
var BLOCKED_HOSTS = /^(localhost|127\.|10\.|192\.168\.|172\.(1[6-9]|2\d|3[0-1])\.|169\.254\.|0\.|\[::1\]|\[::ffff:127)/i;
function isBlockedUrl(raw) {
	try {
		const u = new URL(raw);
		if (u.protocol !== "https:") return true;
		if (BLOCKED_HOSTS.test(u.hostname)) return true;
		return false;
	} catch {
		return true;
	}
}
async function handleProxy(request) {
	const target = new URL(request.url).searchParams.get("u") || "";
	if (!target || isBlockedUrl(target)) return new Response("Forbidden", { status: 403 });
	const headers = new Headers();
	const range = request.headers.get("range");
	if (range) headers.set("Range", range);
	const ua = request.headers.get("user-agent");
	headers.set("User-Agent", ua || "FlowMusic/1.0");
	headers.set("Accept", "*/*");
	let upstream;
	try {
		upstream = await fetch(target, {
			headers,
			redirect: "follow",
			signal: AbortSignal.timeout(2e4)
		});
	} catch {
		return new Response("Upstream unavailable", { status: 502 });
	}
	const out = new Headers();
	for (const key of [
		"content-type",
		"content-length",
		"content-range",
		"accept-ranges",
		"cache-control"
	]) {
		const v = upstream.headers.get(key);
		if (v) out.set(key, v);
	}
	if (!out.has("accept-ranges")) out.set("Accept-Ranges", "bytes");
	out.set("Cache-Control", out.get("Cache-Control") || "private, max-age=60");
	return new Response(request.method === "HEAD" ? null : upstream.body, {
		status: upstream.status,
		headers: out
	});
}
var Route$5 = createFileRoute("/api/proxy")({ server: { handlers: {
	GET: async ({ request }) => handleProxy(request),
	HEAD: async ({ request }) => handleProxy(request)
} } });
var cache = /* @__PURE__ */ new Map();
async function resolveUrl(id, force = false) {
	const hit = cache.get(id);
	if (!force && hit && hit.exp > Date.now()) return hit.url;
	const url = await getAudioUrl(id);
	if (url) cache.set(id, {
		url,
		exp: Date.now() + 72e4
	});
	else cache.delete(id);
	return url;
}
async function handleStream(request) {
	const parsed = new URL(request.url);
	const id = parsed.searchParams.get("v") || "";
	if (!/^[\w-]{11}$/.test(id)) return new Response("Bad request", { status: 400 });
	if ((parsed.searchParams.has("src") || (request.headers.get("accept") || "").includes("application/json")) && parsed.searchParams.has("src")) {
		let target = await resolveUrl(id, false);
		if (!target) target = await resolveUrl(id, true);
		if (!target) return Response.json({ url: null }, {
			status: 404,
			headers: {
				"Content-Type": "application/json; charset=utf-8",
				"Cache-Control": "no-store",
				Vary: "Accept"
			}
		});
		return Response.json({ url: target }, { headers: {
			"Content-Type": "application/json; charset=utf-8",
			"Cache-Control": "no-store",
			"Access-Control-Allow-Origin": "*",
			Vary: "Accept"
		} });
	}
	const play = async (force) => {
		const target = await resolveUrl(id, force);
		if (!target) return null;
		const headers = new Headers();
		const range = request.headers.get("range");
		if (range) headers.set("Range", range);
		headers.set("User-Agent", "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1");
		headers.set("Accept", "*/*");
		headers.set("Referer", "https://www.youtube.com/");
		return fetch(target, {
			headers,
			redirect: "follow"
		});
	};
	let upstream = await play(false);
	if (!upstream || upstream.status === 403 || upstream.status === 410) {
		cache.delete(id);
		upstream = await play(true);
	}
	if (!upstream) return new Response("No stream", { status: 404 });
	const out = new Headers();
	for (const key of [
		"content-type",
		"content-length",
		"content-range",
		"accept-ranges"
	]) {
		const v = upstream.headers.get(key);
		if (v) out.set(key, v);
	}
	if (!out.has("accept-ranges")) out.set("Accept-Ranges", "bytes");
	if (!out.has("content-type")) out.set("Content-Type", "audio/mp4");
	out.set("Cache-Control", "private, max-age=120");
	out.set("Vary", "Accept, Range");
	return new Response(request.method === "HEAD" ? null : upstream.body, {
		status: upstream.status,
		headers: out
	});
}
var Route$4 = createFileRoute("/api/stream")({ server: { handlers: {
	GET: async ({ request }) => handleStream(request),
	HEAD: async ({ request }) => handleStream(request)
} } });
var $$splitComponentImporter$2 = () => import("./p._id-DfzynFFt.mjs");
var Route$3 = createFileRoute("/p/$id")({
	loader: async ({ params }) => getSharedPlaylist({ data: { id: params.id } }),
	component: lazyRouteComponent($$splitComponentImporter$2, "component")
});
var $$splitComponentImporter$1 = () => import("./t._id-CMz6z7BG.mjs");
var Route$2 = createFileRoute("/t/$id")({
	loader: async ({ params }) => getVideoTrack({ data: { id: params.id } }),
	component: lazyRouteComponent($$splitComponentImporter$1, "component")
});
var $$splitComponentImporter = () => import("./u._id-gjbARSiY.mjs");
var Route$1 = createFileRoute("/u/$id")({
	loader: async ({ params }) => listUserPlaylists({ data: { userId: params.id } }),
	component: lazyRouteComponent($$splitComponentImporter, "component")
});
async function handle(request) {
	try {
		return await auth.handler(request);
	} catch (err) {
		console.error("[auth]", err);
		if (new URL(request.url).pathname.endsWith("/get-session")) return Response.json(null, { status: 200 });
		return Response.json({ error: "Auth non disponibile" }, { status: 503 });
	}
}
var Route = createFileRoute("/api/auth/$")({ server: { handlers: {
	GET: ({ request }) => handle(request),
	POST: ({ request }) => handle(request)
} } });
var rootRouteChildren = {
	IndexRoute: Route$19.update({
		id: "/",
		path: "/",
		getParentRoute: () => Route$20
	}),
	ChartsRoute: Route$18.update({
		id: "/charts",
		path: "/charts",
		getParentRoute: () => Route$20
	}),
	DiscoverRoute: Route$17.update({
		id: "/discover",
		path: "/discover",
		getParentRoute: () => Route$20
	}),
	ExploreRoute: Route$16.update({
		id: "/explore",
		path: "/explore",
		getParentRoute: () => Route$20
	}),
	FreshRoute: Route$15.update({
		id: "/fresh",
		path: "/fresh",
		getParentRoute: () => Route$20
	}),
	FriendsRoute: Route$14.update({
		id: "/friends",
		path: "/friends",
		getParentRoute: () => Route$20
	}),
	LibraryRoute: Route$13.update({
		id: "/library",
		path: "/library",
		getParentRoute: () => Route$20
	}),
	LoginRoute: Route$12.update({
		id: "/login",
		path: "/login",
		getParentRoute: () => Route$20
	}),
	MixRoute: Route$11.update({
		id: "/mix",
		path: "/mix",
		getParentRoute: () => Route$20
	}),
	RadioRoute: Route$10.update({
		id: "/radio",
		path: "/radio",
		getParentRoute: () => Route$20
	}),
	SearchRoute: Route$9.update({
		id: "/search",
		path: "/search",
		getParentRoute: () => Route$20
	}),
	SettingsRoute: Route$8.update({
		id: "/settings",
		path: "/settings",
		getParentRoute: () => Route$20
	}),
	StatsRoute: Route$7.update({
		id: "/stats",
		path: "/stats",
		getParentRoute: () => Route$20
	}),
	ApiPlayRoute: Route$6.update({
		id: "/api/play",
		path: "/api/play",
		getParentRoute: () => Route$20
	}),
	ApiProxyRoute: Route$5.update({
		id: "/api/proxy",
		path: "/api/proxy",
		getParentRoute: () => Route$20
	}),
	ApiStreamRoute: Route$4.update({
		id: "/api/stream",
		path: "/api/stream",
		getParentRoute: () => Route$20
	}),
	PIdRoute: Route$3.update({
		id: "/p/$id",
		path: "/p/$id",
		getParentRoute: () => Route$20
	}),
	TIdRoute: Route$2.update({
		id: "/t/$id",
		path: "/t/$id",
		getParentRoute: () => Route$20
	}),
	UIdRoute: Route$1.update({
		id: "/u/$id",
		path: "/u/$id",
		getParentRoute: () => Route$20
	}),
	ApiAuthSplatRoute: Route.update({
		id: "/api/auth/$",
		path: "/api/auth/$",
		getParentRoute: () => Route$20
	})
};
var routeTree = Route$20._addFileChildren(rootRouteChildren)._addFileTypes();
var router_exports = /* @__PURE__ */ __exportAll({ getRouter: () => getRouter });
function getRouter() {
	return createRouter({
		routeTree,
		defaultErrorComponent: AppErrorComponent
	});
}
//#endregion
export { downloadTracks as A, useCurrentUser as B, QuickTile as C, TrackRow as D, TrackCard as E, DEFAULT_SETTINGS as F, publishPlaylist as G, addSharedTrack as H, useFlowStore as I, cn as L, removeDownload as M, useCacheStats as N, canDownloadTrack as O, useOfflineDownloads as P, greetingIt as R, HScroll as S, TrackArt as T, followUser as U, useCurrentUserState as V, listFriendsFeed as W, detectOem as _, Route$9 as a, isAppleMobile as b, Route$12 as c, Route$19 as d, EMPTY_LASTFM as f, androidBackgroundTips as g, writeLastFmConfig as h, Route$3 as i, formatBytes as j, clearAllDownloads as k, Route$16 as l, readLastFmConfig as m, Route$1 as n, Route$10 as o, lastFmHandshake as p, Route$2 as r, Route$11 as s, router_exports as t, Route$18 as u, oemBatteryIntents as v, SectionHeader as w, CollectionCard as x, isAndroid as y, hashHue as z };
