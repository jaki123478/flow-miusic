import { i as __toESM } from "../_runtime.mjs";
import { V as require_react, _ as createRootRoute, b as useRouter, d as useRouterState, g as createFileRoute, h as lazyRouteComponent, l as Scripts, m as Outlet, p as createRouter, u as HeadContent, v as Link, x as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as TSS_SERVER_FUNCTION, r as getServerFnById, t as createServerFn } from "./ssr.mjs";
import { n as FALLBACK_ART, r as GENRES, t as CHARTS } from "./types-CuQ6ClJX.mjs";
import { C as Heart, E as ChevronDown, S as House, T as Clock, _ as Pause, a as TriangleAlert, c as SkipForward, d as Search, f as Repeat, g as Play, l as SkipBack, m as Radio, n as VolumeX, p as Repeat1, r as Volume2, t as X, u as Shuffle, x as ListMusic, y as MicVocal } from "../_libs/lucide-react.mjs";
import { a as union, i as string, n as number, r as object, t as literal } from "../_libs/zod.mjs";
import { t as clsx } from "../_libs/clsx.mjs";
import { t as twMerge } from "../_libs/tailwind-merge.mjs";
import { t as create } from "../_libs/zustand.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/catalog-Aq7kaDdf.js
var createSsrRpc = (functionId) => {
	const url = "/_serverFn/" + functionId;
	const serverFnMeta = { id: functionId };
	const fn = async (...args) => {
		return (await getServerFnById(functionId, { origin: "server" }))(...args);
	};
	return Object.assign(fn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
function stationToTrack(station) {
	return {
		id: `rd_${station.id}`,
		title: station.name,
		artist: [station.city, station.country].filter(Boolean).join(" · ") || "Radio",
		artwork: station.artwork || "/artwork-fallback.svg",
		duration: 0,
		streamUrl: `/api/proxy?u=${encodeURIComponent(station.streamUrl)}`,
		source: "radio",
		isLive: true
	};
}
var getHomeFeed = createServerFn({ method: "GET" }).handler(createSsrRpc("8cf6eee8babbaea2485437d5cb4b2c235dbd85b74941fe6109bbf26b9db42407"));
var searchCatalog = createServerFn({ method: "GET" }).validator((d) => d).handler(createSsrRpc("6eeca8432c020e4488999a9f520d136ca6d359bf146e4fc720286117cfb8c004"));
var getChartTracks = createServerFn({ method: "GET" }).validator((d) => d).handler(createSsrRpc("74d2cdb2d98c87a08e4dcc4ab358f071ee955183d53df01037b0507f9a6648c3"));
var getGenreMix = createServerFn({ method: "GET" }).validator((d) => d).handler(createSsrRpc("73f83a45f51d7430d01c6ba65abb1226397cf20c8962951e26bac99785823176"));
var getCountryRadios = createServerFn({ method: "GET" }).validator((d) => d).handler(createSsrRpc("e717f14110eb25ec0b39ab5ab4b7f9b3b857b73869aee0b9e1025fd5f0dba8d9"));
var getTopRadios = createServerFn({ method: "GET" }).handler(createSsrRpc("02870f145ed293cf162bbe007ee1f2f3e2e84304ede96df4483cd43ae7997e20"));
var createMoodMix = createServerFn({ method: "POST" }).validator((d) => d).handler(createSsrRpc("ec02d6163239e7f655cf1fccbdc3f61e78a074317e13902650d1532a6e9f3fe4"));
//#endregion
//#region node_modules/.nitro/vite/services/ssr/assets/router-CHLvWwov.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var __defProp = Object.defineProperty;
var __exportAll = (all, no_symbols) => {
	let target = {};
	for (var name in all) __defProp(target, name, {
		get: all[name],
		enumerable: true
	});
	if (!no_symbols) __defProp(target, Symbol.toStringTag, { value: "Module" });
	return target;
};
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
var LIKED_KEY = "flow_liked_tracks";
var RECENT_KEY = "flow_recent_tracks";
var PLAYLISTS_KEY = "flow_playlists";
var VOLUME_KEY = "flow_volume";
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
function remember(track, recents) {
	return [track, ...recents.filter((t) => t.id !== track.id)].slice(0, 80);
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
	liked: [],
	recents: [],
	playlists: [],
	trackMap: {},
	hydrate: () => {
		const liked = readJson(LIKED_KEY, []);
		const recents = readJson(RECENT_KEY, []);
		const playlists = readJson(PLAYLISTS_KEY, []);
		const volume = readJson(VOLUME_KEY, .9);
		const trackMap = {};
		for (const t of [...liked, ...recents]) trackMap[t.id] = t;
		set({
			liked,
			recents,
			playlists,
			volume,
			trackMap
		});
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
				recents
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
			recents
		});
		else set({
			current: track,
			queue: [track, ...existing],
			queueIndex: 0,
			isPlaying: true,
			currentTime: 0,
			recents
		});
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
		const recents = remember(track, get().recents);
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
			set({ currentTime: 0 });
			return;
		}
		const prevIndex = queueIndex <= 0 ? 0 : queueIndex - 1;
		const track = queue[prevIndex];
		if (!track) return;
		set({
			current: track,
			queueIndex: prevIndex,
			currentTime: 0,
			isPlaying: true
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
	setShowQueue: (v) => set({ showQueue: v }),
	setShowLyrics: (v) => set({ showLyrics: v }),
	addToQueue: (track) => set({ queue: [...get().queue, track] }),
	removeFromQueue: (index) => {
		const queue = get().queue.filter((_, i) => i !== index);
		let queueIndex = get().queueIndex;
		if (index < queueIndex) queueIndex -= 1;
		set({
			queue,
			queueIndex: Math.max(0, Math.min(queueIndex, queue.length - 1))
		});
	},
	toggleLike: (track) => {
		const liked = get().liked;
		const next = liked.some((t) => t.id === track.id) ? liked.filter((t) => t.id !== track.id) : [track, ...liked];
		writeJson(LIKED_KEY, next);
		set({
			liked: next,
			trackMap: {
				...get().trackMap,
				[track.id]: track
			}
		});
	},
	isLiked: (id) => get().liked.some((t) => t.id === id),
	createPlaylist: (title) => {
		const clean = title.trim();
		if (!clean) return;
		const playlists = [{
			id: `pl_${Date.now()}`,
			title: clean,
			createdAt: Date.now(),
			trackIds: []
		}, ...get().playlists];
		writeJson(PLAYLISTS_KEY, playlists);
		set({ playlists });
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
	},
	removePlaylist: (id) => {
		const playlists = get().playlists.filter((p) => p.id !== id);
		writeJson(PLAYLISTS_KEY, playlists);
		set({ playlists });
	}
}));
var getTrackLyrics = createServerFn({ method: "GET" }).validator((d) => d).handler(createSsrRpc("ce8a487e4cbefbdf4ec0ffa79cb9704d62902152f43f9d7d07bca5a65759f7c5"));
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
function TrackRow({ track, queue, index, showIndex }) {
	const current = useFlowStore((s) => s.current);
	const isPlaying = useFlowStore((s) => s.isPlaying);
	const playTrack = useFlowStore((s) => s.playTrack);
	const togglePlay = useFlowStore((s) => s.togglePlay);
	const toggleLike = useFlowStore((s) => s.toggleLike);
	const liked = useFlowStore((s) => s.liked.some((t) => t.id === track.id));
	const active = current?.id === track.id;
	const onPlay = () => {
		if (active) togglePlay();
		else playTrack(track, queue);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: cn("flex min-h-14 items-center gap-3 rounded-xl px-2 py-1.5 transition-colors duration-150", active ? "bg-elevated" : "hover:bg-elevated/70"),
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
							children: [
								track.isLive ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Radio, { className: "size-3 shrink-0" }) : null,
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "truncate",
									children: track.artist
								}),
								track.isPreview ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "shrink-0 text-subtle",
									children: "30s"
								}) : null
							]
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
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Heart, { className: cn("size-4", liked && "fill-current") })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				onClick: onPlay,
				className: "flex size-11 shrink-0 items-center justify-center rounded-full text-fg",
				"aria-hidden": true,
				tabIndex: -1,
				children: active && isPlaying ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pause, { className: "size-4 fill-current" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, { className: "size-4 fill-current" })
			})
		]
	});
}
function TrackCard({ track, queue }) {
	const current = useFlowStore((s) => s.current);
	const isPlaying = useFlowStore((s) => s.isPlaying);
	const playTrack = useFlowStore((s) => s.playTrack);
	const togglePlay = useFlowStore((s) => s.togglePlay);
	const active = current?.id === track.id;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
		type: "button",
		onClick: () => active ? togglePlay() : playTrack(track, queue),
		className: "group w-36 shrink-0 text-left sm:w-40",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
				className: "relative block aspect-square overflow-hidden rounded-xl bg-elevated",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TrackArt, {
					src: track.artwork,
					alt: "",
					className: "transition-transform duration-300 group-hover:scale-105"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: cn("absolute right-2 bottom-2 flex size-10 items-center justify-center rounded-full bg-primary text-primary-fg shadow-md transition-opacity duration-150", active && isPlaying ? "opacity-100" : "opacity-0 group-hover:opacity-100"),
					children: active && isPlaying ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pause, { className: "size-4 fill-current" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, { className: "ml-0.5 size-4 fill-current" })
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: cn("mt-2 block truncate text-sm font-medium", active ? "text-primary" : "text-fg"),
				children: track.title
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "mt-0.5 block truncate text-xs text-muted",
				children: track.artist
			})
		]
	});
}
function SectionHeader({ title, action, onAction }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mb-3 flex items-end justify-between gap-3",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
			className: "text-lg font-semibold tracking-tight text-fg",
			children: title
		}), action && onAction ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
			type: "button",
			onClick: onAction,
			className: "text-xs font-medium text-primary",
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
		className: "flex min-h-14 items-center gap-3 overflow-hidden rounded-xl bg-surface text-left ring-1 ring-border",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "size-14 shrink-0 overflow-hidden bg-elevated",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TrackArt, {
					src: track.artwork,
					alt: ""
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "min-w-0 flex-1 pr-2",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: cn("block truncate text-sm font-medium", active ? "text-primary" : "text-fg"),
					children: track.title
				})
			}),
			active && isPlaying ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PlayingBars, { className: "mr-3" }) : null
		]
	});
}
function loadYouTubeApi() {
	if (typeof window === "undefined") return Promise.reject(/* @__PURE__ */ new Error("ssr"));
	if (window.YT?.Player) return Promise.resolve(window.YT);
	return new Promise((resolve, reject) => {
		const prev = window.onYouTubeIframeAPIReady;
		window.onYouTubeIframeAPIReady = () => {
			try {
				prev?.();
			} catch {}
			if (window.YT?.Player) resolve(window.YT);
			else reject(/* @__PURE__ */ new Error("YT missing"));
		};
		if (!document.querySelector("script[src=\"https://www.youtube.com/iframe_api\"]")) {
			const s = document.createElement("script");
			s.src = "https://www.youtube.com/iframe_api";
			s.async = true;
			s.onerror = () => reject(/* @__PURE__ */ new Error("YT script"));
			document.head.appendChild(s);
		}
		window.setTimeout(() => {
			if (window.YT?.Player) resolve(window.YT);
		}, 1e4);
	});
}
function AudioEngine() {
	const audioRef = (0, import_react.useRef)(null);
	const hostRef = (0, import_react.useRef)(null);
	const ytRef = (0, import_react.useRef)(null);
	const ytReady = (0, import_react.useRef)(false);
	const ytVideo = (0, import_react.useRef)(null);
	const current = useFlowStore((s) => s.current);
	const isPlaying = useFlowStore((s) => s.isPlaying);
	const volume = useFlowStore((s) => s.volume);
	const isMuted = useFlowStore((s) => s.isMuted);
	const playbackRate = useFlowStore((s) => s.playbackRate);
	const seekVersion = useFlowStore((s) => s.seekVersion);
	const currentTime = useFlowStore((s) => s.currentTime);
	const sleepEndsAt = useFlowStore((s) => s.sleepEndsAt);
	const showFullPlayer = useFlowStore((s) => s.showFullPlayer);
	const showQueue = useFlowStore((s) => s.showQueue);
	const showLyrics = useFlowStore((s) => s.showLyrics);
	const setCurrentTime = useFlowStore((s) => s.setCurrentTime);
	const setDuration = useFlowStore((s) => s.setDuration);
	const onEnded = useFlowStore((s) => s.onEnded);
	const pause = useFlowStore((s) => s.pause);
	const resume = useFlowStore((s) => s.resume);
	const next = useFlowStore((s) => s.next);
	const prev = useFlowStore((s) => s.prev);
	const lastSeek = (0, import_react.useRef)(0);
	const isYt = current?.source === "ytmusic" && Boolean(current.videoId);
	const hero = isYt && showFullPlayer && !showQueue && !showLyrics;
	(0, import_react.useEffect)(() => {
		if (!isYt || !hostRef.current) return;
		let cancelled = false;
		loadYouTubeApi().then((YT) => {
			if (cancelled || !hostRef.current || ytRef.current) return;
			ytRef.current = new YT.Player(hostRef.current, {
				width: "100%",
				height: "100%",
				host: "https://www.youtube-nocookie.com",
				playerVars: {
					autoplay: 1,
					controls: 0,
					disablekb: 1,
					fs: 0,
					modestbranding: 1,
					rel: 0,
					iv_load_policy: 3,
					playsinline: 1,
					origin: window.location.origin,
					widget_referrer: window.location.origin
				},
				events: {
					onReady: (e) => {
						ytReady.current = true;
						e.target.setVolume(isMuted ? 0 : Math.round(volume * 100));
						const id = useFlowStore.getState().current?.videoId;
						if (id) {
							ytVideo.current = id;
							e.target.loadVideoById(id);
						}
					},
					onStateChange: (e) => {
						const YT = window.YT;
						if (!YT) return;
						if (e.data === YT.PlayerState.ENDED) onEnded();
						if (e.data === YT.PlayerState.PLAYING) {
							const p = ytRef.current;
							if (p) {
								const d = p.getDuration();
								if (Number.isFinite(d) && d > 0) setDuration(d);
							}
						}
					},
					onError: () => {
						if (useFlowStore.getState().current) onEnded();
					}
				}
			});
		}).catch(() => {
			if (useFlowStore.getState().current?.source === "ytmusic") onEnded();
		});
		return () => {
			cancelled = true;
		};
	}, [isYt]);
	(0, import_react.useEffect)(() => {
		const id = current?.videoId;
		if (!isYt || !id || !ytReady.current || !ytRef.current) return;
		if (ytVideo.current === id) {
			if (isPlaying) ytRef.current.playVideo();
			return;
		}
		ytVideo.current = id;
		ytRef.current.loadVideoById(id);
	}, [
		current?.id,
		current?.videoId,
		isYt,
		isPlaying
	]);
	(0, import_react.useEffect)(() => {
		const audio = audioRef.current;
		if (isYt) {
			if (audio) {
				audio.pause();
				audio.removeAttribute("src");
			}
			return;
		}
		if (!audio) return;
		if (!current?.streamUrl) {
			audio.pause();
			audio.removeAttribute("src");
			return;
		}
		audio.src = current.streamUrl;
		audio.setAttribute("referrerpolicy", "no-referrer");
		audio.load();
		if (isPlaying) audio.play().catch(() => pause());
	}, [
		current?.id,
		current?.streamUrl,
		isYt
	]);
	(0, import_react.useEffect)(() => {
		if (isYt) {
			const p = ytRef.current;
			if (!p || !ytReady.current) return;
			if (isPlaying) p.playVideo();
			else p.pauseVideo();
			return;
		}
		const audio = audioRef.current;
		if (!audio) return;
		if (isPlaying) audio.play().catch(() => pause());
		else audio.pause();
	}, [isPlaying, isYt]);
	(0, import_react.useEffect)(() => {
		const p = ytRef.current;
		if (p && ytReady.current) {
			if (isMuted) p.mute();
			else {
				p.unMute();
				p.setVolume(Math.round(volume * 100));
			}
			try {
				p.setPlaybackRate(current?.isLive ? 1 : playbackRate);
			} catch {}
		}
		const audio = audioRef.current;
		if (audio) {
			audio.volume = isMuted ? 0 : volume;
			audio.playbackRate = current?.isLive ? 1 : playbackRate;
		}
	}, [
		volume,
		isMuted,
		playbackRate,
		current?.isLive
	]);
	(0, import_react.useEffect)(() => {
		if (seekVersion === lastSeek.current) return;
		lastSeek.current = seekVersion;
		if (current?.isLive) return;
		if (isYt && ytRef.current && ytReady.current) {
			ytRef.current.seekTo(currentTime, true);
			return;
		}
		const audio = audioRef.current;
		if (!audio) return;
		if (Math.abs(audio.currentTime - currentTime) > .35) audio.currentTime = currentTime;
	}, [
		seekVersion,
		currentTime,
		current?.isLive,
		isYt
	]);
	(0, import_react.useEffect)(() => {
		if (!isYt || !isPlaying) return;
		const t = window.setInterval(() => {
			const p = ytRef.current;
			if (!p || !ytReady.current) return;
			const time = p.getCurrentTime();
			const dur = p.getDuration();
			if (Number.isFinite(time)) setCurrentTime(time);
			if (Number.isFinite(dur) && dur > 0) setDuration(dur);
		}, 250);
		return () => window.clearInterval(t);
	}, [
		isYt,
		isPlaying,
		setCurrentTime,
		setDuration
	]);
	(0, import_react.useEffect)(() => {
		const host = hostRef.current;
		const p = ytRef.current;
		if (!host || !p || !ytReady.current) return;
		p.setSize(host.clientWidth, host.clientHeight);
	}, [showFullPlayer, isYt]);
	(0, import_react.useEffect)(() => {
		if (!sleepEndsAt) return;
		const wait = sleepEndsAt - Date.now();
		if (wait <= 0) {
			pause();
			useFlowStore.getState().setSleep(null);
			return;
		}
		const t = window.setTimeout(() => {
			pause();
			useFlowStore.getState().setSleep(null);
		}, wait);
		return () => window.clearTimeout(t);
	}, [sleepEndsAt, pause]);
	(0, import_react.useEffect)(() => {
		if (!current || typeof navigator === "undefined" || !("mediaSession" in navigator)) return;
		navigator.mediaSession.metadata = new MediaMetadata({
			title: current.title,
			artist: current.artist,
			album: current.album || "Flow",
			artwork: current.artwork ? [{
				src: current.artwork,
				sizes: "512x512",
				type: "image/jpeg"
			}] : []
		});
		navigator.mediaSession.playbackState = isPlaying ? "playing" : "paused";
		navigator.mediaSession.setActionHandler("play", () => resume());
		navigator.mediaSession.setActionHandler("pause", () => pause());
		navigator.mediaSession.setActionHandler("previoustrack", () => prev());
		navigator.mediaSession.setActionHandler("nexttrack", () => next());
		navigator.mediaSession.setActionHandler("seekto", (d) => {
			if (typeof d.seekTime === "number") useFlowStore.getState().seek(d.seekTime);
		});
	}, [
		current,
		isPlaying,
		resume,
		pause,
		prev,
		next
	]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("audio", {
		ref: audioRef,
		className: "hidden",
		playsInline: true,
		preload: "metadata",
		onTimeUpdate: (e) => setCurrentTime(e.currentTarget.currentTime),
		onDurationChange: (e) => {
			const d = e.currentTarget.duration;
			if (Number.isFinite(d)) setDuration(d);
		},
		onEnded,
		onError: () => {
			if (current && current.source !== "ytmusic") onEnded();
		}
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: cn("overflow-hidden bg-black shadow-2xl ring-1 ring-border", !isYt && "pointer-events-none invisible absolute", isYt && hero ? "pointer-events-none fixed top-14 left-1/2 z-40 w-[min(100%-3rem,24rem)] -translate-x-1/2 rounded-2xl aspect-square" : isYt ? "pointer-events-auto fixed right-3 bottom-24 z-[60] size-[200px] rounded-xl md:bottom-8" : "hidden"),
		"aria-hidden": !isYt,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			ref: hostRef,
			className: "size-full"
		})
	})] });
}
function MiniPlayer() {
	const current = useFlowStore((s) => s.current);
	const isPlaying = useFlowStore((s) => s.isPlaying);
	const currentTime = useFlowStore((s) => s.currentTime);
	const duration = useFlowStore((s) => s.duration);
	const togglePlay = useFlowStore((s) => s.togglePlay);
	const next = useFlowStore((s) => s.next);
	const setShowFullPlayer = useFlowStore((s) => s.setShowFullPlayer);
	if (!current) return null;
	const progress = duration > 0 ? Math.min(100, currentTime / duration * 100) : 0;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "pointer-events-auto mx-3 mb-2 overflow-hidden rounded-xl bg-elevated ring-1 ring-border md:mx-4",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex w-full items-center gap-3 px-3 py-2",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					onClick: () => setShowFullPlayer(true),
					className: "flex min-w-0 flex-1 items-center gap-3 text-left",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "size-11 shrink-0 overflow-hidden rounded-md bg-surface",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TrackArt, {
								src: current.artwork,
								alt: ""
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "min-w-0 flex-1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "block truncate text-sm font-medium text-fg",
								children: current.title
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "block truncate text-xs text-muted",
								children: current.artist
							})]
						}),
						isPlaying ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PlayingBars, { className: "mr-1 hidden sm:flex" }) : null
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: togglePlay,
					className: "flex size-11 items-center justify-center rounded-full text-fg",
					"aria-label": isPlaying ? "Pausa" : "Riproduci",
					children: isPlaying ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pause, { className: "size-5 fill-current" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, { className: "size-5 fill-current" })
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: next,
					className: "hidden size-11 items-center justify-center rounded-full text-fg sm:flex",
					"aria-label": "Successivo",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SkipForward, { className: "size-5 fill-current" })
				})
			]
		}), !current.isLive ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "h-0.5 bg-surface",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "h-full bg-primary",
				style: { width: `${progress}%` }
			})
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center gap-1.5 px-3 pb-1.5 text-[10px] font-medium tracking-wide text-primary uppercase",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "size-1.5 rounded-full bg-primary" }), "Live"]
		})]
	});
}
function FullPlayer() {
	const current = useFlowStore((s) => s.current);
	const isPlaying = useFlowStore((s) => s.isPlaying);
	const currentTime = useFlowStore((s) => s.currentTime);
	const duration = useFlowStore((s) => s.duration);
	const shuffle = useFlowStore((s) => s.shuffle);
	const repeat = useFlowStore((s) => s.repeat);
	const volume = useFlowStore((s) => s.volume);
	const isMuted = useFlowStore((s) => s.isMuted);
	const queue = useFlowStore((s) => s.queue);
	const showQueue = useFlowStore((s) => s.showQueue);
	const showLyrics = useFlowStore((s) => s.showLyrics);
	const sleepEndsAt = useFlowStore((s) => s.sleepEndsAt);
	const show = useFlowStore((s) => s.showFullPlayer);
	const togglePlay = useFlowStore((s) => s.togglePlay);
	const next = useFlowStore((s) => s.next);
	const prev = useFlowStore((s) => s.prev);
	const seek = useFlowStore((s) => s.seek);
	const toggleShuffle = useFlowStore((s) => s.toggleShuffle);
	const cycleRepeat = useFlowStore((s) => s.cycleRepeat);
	const toggleLike = useFlowStore((s) => s.toggleLike);
	const liked = useFlowStore((s) => current ? s.liked.some((t) => t.id === current.id) : false);
	const setShowFullPlayer = useFlowStore((s) => s.setShowFullPlayer);
	const setShowQueue = useFlowStore((s) => s.setShowQueue);
	const setShowLyrics = useFlowStore((s) => s.setShowLyrics);
	const setVolume = useFlowStore((s) => s.setVolume);
	const toggleMute = useFlowStore((s) => s.toggleMute);
	const setSleep = useFlowStore((s) => s.setSleep);
	const [lyrics, setLyrics] = (0, import_react.useState)([]);
	const lyricsRef = (0, import_react.useRef)(null);
	(0, import_react.useEffect)(() => {
		if (!current || current.isLive) {
			setLyrics([]);
			return;
		}
		let cancelled = false;
		getTrackLyrics({ data: {
			videoId: current.videoId,
			title: current.title,
			artist: current.artist
		} }).then((lines) => {
			if (!cancelled) setLyrics(lines);
		});
		return () => {
			cancelled = true;
		};
	}, [current?.id]);
	const lyricIndex = lyrics.reduce((acc, line, i) => line.timeMs <= currentTime * 1e3 ? i : acc, -1);
	(0, import_react.useEffect)(() => {
		if (!showLyrics || lyricIndex < 0) return;
		(lyricsRef.current?.querySelector(`[data-i="${lyricIndex}"]`))?.scrollIntoView({
			block: "center",
			behavior: "smooth"
		});
	}, [lyricIndex, showLyrics]);
	if (!show || !current) return null;
	const progress = duration > 0 ? Math.min(100, currentTime / duration * 100) : 0;
	const RepeatIcon = repeat === "one" ? Repeat1 : Repeat;
	const ytPlaying = current.source === "ytmusic";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: cn("fixed inset-0 z-50 flex flex-col pt-[env(safe-area-inset-top)]", ytPlaying && !showQueue && !showLyrics ? "bg-transparent" : "bg-bg"),
		role: "dialog",
		"aria-modal": "true",
		"aria-label": "Player",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "relative z-[70] flex items-center justify-between bg-bg px-3 py-2",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: () => {
						if (showLyrics) setShowLyrics(false);
						else if (showQueue) setShowQueue(false);
						else setShowFullPlayer(false);
					},
					className: "flex size-11 items-center justify-center rounded-full text-fg",
					"aria-label": "Chiudi",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronDown, { className: "size-6" })
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs font-medium tracking-wide text-muted uppercase",
					children: "In riproduzione"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: () => setShowQueue(!showQueue),
					className: cn("flex size-11 items-center justify-center rounded-full", showQueue ? "text-primary" : "text-fg"),
					"aria-label": "Coda",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ListMusic, { className: "size-5" })
				})
			]
		}), showQueue ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex-1 overflow-y-auto px-3 pb-8",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mb-3 flex items-center justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "text-base font-semibold",
					children: "Coda"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: () => setShowQueue(false),
					className: "text-muted",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-5" })
				})]
			}), queue.map((t, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TrackRow, {
				track: t,
				queue,
				index: i,
				showIndex: true
			}, `${t.id}-${i}`))]
		}) : showLyrics ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			ref: lyricsRef,
			className: "flex-1 overflow-y-auto px-6 pb-8",
			children: lyrics.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "pt-16 text-center text-sm text-muted",
				children: "Testi non disponibili per questo brano."
			}) : lyrics.map((line, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				"data-i": i,
				className: cn("py-2 text-center text-lg leading-snug transition-colors duration-150", i === lyricIndex ? "font-semibold text-fg" : "text-subtle"),
				children: line.text
			}, `${line.timeMs}-${i}`))
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex flex-1 flex-col px-6 pb-4",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: cn("mx-auto mt-2 aspect-square w-full max-w-sm overflow-hidden rounded-2xl shadow-2xl", ytPlaying ? "bg-transparent" : "bg-elevated"),
				children: ytPlaying ? null : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TrackArt, {
					src: current.artwork,
					alt: current.title
				})
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "-mx-6 mt-0 flex-1 bg-bg px-6 pt-6",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-start gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "min-w-0 flex-1",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
									className: "truncate text-2xl font-semibold tracking-tight text-fg",
									children: current.title
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-1 truncate text-sm text-muted",
									children: current.artist
								}),
								current.isLive ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "mt-1 flex items-center gap-1.5 text-xs font-medium text-primary",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Radio, { className: "size-3.5" }), " In diretta"]
								}) : ytPlaying ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-1 text-xs text-subtle",
									children: "YouTube Music · testi SimpMusic"
								}) : null
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: () => toggleLike(current),
							className: cn("flex size-11 items-center justify-center rounded-full", liked ? "text-primary" : "text-muted"),
							"aria-label": "Preferito",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Heart, { className: cn("size-6", liked && "fill-current") })
						})]
					}),
					!current.isLive ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-6",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							type: "range",
							min: 0,
							max: duration || 30,
							step: .25,
							value: Math.min(currentTime, duration || 30),
							onChange: (e) => seek(Number(e.target.value)),
							className: "h-1.5 w-full cursor-pointer appearance-none rounded-full bg-elevated accent-primary",
							"aria-label": "Posizione",
							style: { background: `linear-gradient(to right, var(--color-primary) ${progress}%, var(--color-elevated) ${progress}%)` }
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-1.5 flex justify-between text-xs tabular-nums text-subtle",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: formatTime(currentTime) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: formatTime(duration) })]
						})]
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-8 h-1.5 overflow-hidden rounded-full bg-elevated",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-full w-1/3 animate-pulse rounded-full bg-primary" })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-4 flex items-center justify-between",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								onClick: toggleShuffle,
								className: cn("flex size-11 items-center justify-center", shuffle ? "text-primary" : "text-muted"),
								"aria-label": "Shuffle",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Shuffle, { className: "size-5" })
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								onClick: prev,
								className: "flex size-14 items-center justify-center text-fg",
								"aria-label": "Precedente",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SkipBack, { className: "size-7 fill-current" })
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								onClick: togglePlay,
								className: "flex size-16 items-center justify-center rounded-full bg-fg text-bg",
								"aria-label": isPlaying ? "Pausa" : "Riproduci",
								children: isPlaying ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pause, { className: "size-7 fill-current" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, { className: "ml-0.5 size-7 fill-current" })
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								onClick: next,
								className: "flex size-14 items-center justify-center text-fg",
								"aria-label": "Successivo",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SkipForward, { className: "size-7 fill-current" })
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								onClick: cycleRepeat,
								className: cn("flex size-11 items-center justify-center", repeat !== "off" ? "text-primary" : "text-muted"),
								"aria-label": "Ripeti",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RepeatIcon, { className: "size-5" })
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-5 hidden items-center gap-3 md:flex",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: toggleMute,
							className: "text-muted",
							"aria-label": "Volume",
							children: isMuted || volume === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(VolumeX, { className: "size-4" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Volume2, { className: "size-4" })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							type: "range",
							min: 0,
							max: 1,
							step: .01,
							value: isMuted ? 0 : volume,
							onChange: (e) => setVolume(Number(e.target.value)),
							className: "h-1 w-full appearance-none rounded-full bg-elevated accent-primary"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-auto flex items-center justify-between pb-[env(safe-area-inset-bottom)] pt-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							onClick: () => {
								setShowLyrics(!showLyrics);
								setShowQueue(false);
							},
							className: cn("flex items-center gap-2 rounded-full px-3 py-2 text-xs font-medium", showLyrics ? "text-primary" : "text-muted"),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MicVocal, { className: "size-4" }), "Testi"]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-1",
							children: [[
								15,
								30,
								45
							].map((m) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								onClick: () => setSleep(sleepEndsAt ? null : m),
								className: cn("rounded-full px-2.5 py-1.5 text-[11px] font-medium", sleepEndsAt ? "text-primary" : "text-muted"),
								children: [m, "m"]
							}, m)), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Clock, { className: "ml-1 size-3.5 text-subtle" })]
						})]
					})
				]
			})]
		})]
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
		icon: Heart
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
function AppShell({ children }) {
	const pathname = useRouterState({ select: (s) => s.location.pathname });
	const hasTrack = useFlowStore((s) => Boolean(s.current));
	const hydrate = useFlowStore((s) => s.hydrate);
	(0, import_react.useEffect)(() => {
		hydrate();
	}, [hydrate]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-dvh bg-bg text-fg",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AudioEngine, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
				className: "fixed top-0 bottom-0 left-0 z-30 hidden w-56 flex-col border-r border-border bg-bg pt-6 md:flex",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
						to: "/",
						className: "mb-8 flex items-center gap-2.5 px-5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FlowMark, { className: "size-8" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-lg font-semibold tracking-tight",
							children: "Flow"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
						className: "flex flex-col gap-1 px-3",
						children: NAV.map((item) => {
							const active = item.to === "/" ? pathname === "/" : pathname.startsWith(item.to);
							const Icon = item.icon;
							return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
								to: item.to,
								className: cn("flex h-11 items-center gap-3 rounded-lg px-3 text-sm font-medium transition-colors duration-150", active ? "bg-elevated text-fg" : "text-muted hover:bg-surface hover:text-fg"),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "size-5" }), item.label]
							}, item.to);
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-8 px-5",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-[11px] font-medium tracking-wide text-subtle uppercase",
								children: "Scopri"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/explore",
								className: "mt-2 block py-2 text-sm text-muted hover:text-fg",
								children: "Generi & mood"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/charts",
								className: "block py-2 text-sm text-muted hover:text-fg",
								children: "Classifiche"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/mix",
								className: "block py-2 text-sm text-muted hover:text-fg",
								children: "Mix intelligente"
							})
						]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "sticky top-0 z-20 flex items-center gap-3 border-b border-border bg-bg/90 px-4 py-3 backdrop-blur-md md:hidden pt-[max(0.75rem,env(safe-area-inset-top))]",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
					to: "/",
					className: "flex items-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FlowMark, { className: "size-8" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-base font-semibold",
						children: "Flow"
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "ml-auto flex items-center gap-1",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/charts",
						className: "rounded-full px-3 py-2 text-xs font-medium text-muted",
						children: "Chart"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/explore",
						className: "rounded-full px-3 py-2 text-xs font-medium text-muted",
						children: "Esplora"
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
				className: cn("mx-auto w-full max-w-5xl px-4 pt-4 sm:px-6 md:ml-56 md:pt-8", hasTrack ? "pb-40 md:pb-28" : "pb-28 md:pb-16"),
				children
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "pointer-events-none fixed right-0 bottom-0 left-0 z-40 md:left-56",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MiniPlayer, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
					className: "pointer-events-auto flex border-t border-border bg-bg/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md md:hidden",
					children: NAV.map((item) => {
						const active = item.to === "/" ? pathname === "/" : pathname.startsWith(item.to);
						const Icon = item.icon;
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
							to: item.to,
							className: cn("flex min-h-14 flex-1 flex-col items-center justify-center gap-0.5 text-[11px] font-medium", active ? "text-primary" : "text-muted"),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "size-5" }), item.label]
						}, item.to);
					})
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FullPlayer, {})
		]
	});
}
var styles_default = "/assets/styles-LflNQpzR.css";
var APP_NAME = "Flow";
var Route$8 = createRootRoute({
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
				content: "#08090c"
			},
			{
				name: "description",
				content: "Musica da YouTube Music, testi SimpMusic, radio live."
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
				name: "mobile-web-app-capable",
				content: "yes"
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
				href: "/__grok/icon-180.png"
			},
			{
				rel: "stylesheet",
				href: "https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700&display=swap"
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
var $$splitComponentImporter$6 = () => import("./routes-BVxjXUuW.mjs");
var Route$7 = createFileRoute("/")({
	loader: async () => {
		try {
			return await getHomeFeed();
		} catch {
			return {
				trending: [],
				hitsMix: [],
				independent: [],
				radios: []
			};
		}
	},
	component: lazyRouteComponent($$splitComponentImporter$6, "component")
});
var $$splitComponentImporter$5 = () => import("./charts-Cl1jcFcc.mjs");
var Route$6 = createFileRoute("/charts")({
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
	component: lazyRouteComponent($$splitComponentImporter$5, "component")
});
var $$splitComponentImporter$4 = () => import("./explore-CfIkqrTq.mjs");
var Route$5 = createFileRoute("/explore")({
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
	component: lazyRouteComponent($$splitComponentImporter$4, "component")
});
var $$splitComponentImporter$3 = () => import("./library-DQ7lkyGT.mjs");
var Route$4 = createFileRoute("/library")({ component: lazyRouteComponent($$splitComponentImporter$3, "component") });
var $$splitComponentImporter$2 = () => import("./mix-BW5NLQ3B.mjs");
var Route$3 = createFileRoute("/mix")({
	validateSearch: (search) => ({ mood: typeof search.mood === "string" ? search.mood : void 0 }),
	component: lazyRouteComponent($$splitComponentImporter$2, "component")
});
var $$splitComponentImporter$1 = () => import("./radio-u9F64asi.mjs");
var Route$2 = createFileRoute("/radio")({
	validateSearch: (search) => ({ c: typeof search.c === "string" ? search.c : void 0 }),
	loaderDeps: ({ search }) => ({ c: search.c || "IT" }),
	loader: async ({ deps }) => {
		const [top, country] = await Promise.all([getTopRadios().catch(() => []), getCountryRadios({ data: { countryCode: deps.c } }).catch(() => [])]);
		return {
			top,
			country
		};
	},
	component: lazyRouteComponent($$splitComponentImporter$1, "component")
});
var $$splitComponentImporter = () => import("./search-6vBkqUV3.mjs");
var Route$1 = createFileRoute("/search")({
	validateSearch: (search) => ({ q: typeof search.q === "string" ? search.q : void 0 }),
	component: lazyRouteComponent($$splitComponentImporter, "component")
});
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
var Route = createFileRoute("/api/proxy")({ server: { handlers: {
	GET: async ({ request }) => handleProxy(request),
	HEAD: async ({ request }) => handleProxy(request)
} } });
var rootRouteChildren = {
	IndexRoute: Route$7.update({
		id: "/",
		path: "/",
		getParentRoute: () => Route$8
	}),
	ChartsRoute: Route$6.update({
		id: "/charts",
		path: "/charts",
		getParentRoute: () => Route$8
	}),
	ExploreRoute: Route$5.update({
		id: "/explore",
		path: "/explore",
		getParentRoute: () => Route$8
	}),
	LibraryRoute: Route$4.update({
		id: "/library",
		path: "/library",
		getParentRoute: () => Route$8
	}),
	MixRoute: Route$3.update({
		id: "/mix",
		path: "/mix",
		getParentRoute: () => Route$8
	}),
	RadioRoute: Route$2.update({
		id: "/radio",
		path: "/radio",
		getParentRoute: () => Route$8
	}),
	SearchRoute: Route$1.update({
		id: "/search",
		path: "/search",
		getParentRoute: () => Route$8
	}),
	ApiProxyRoute: Route.update({
		id: "/api/proxy",
		path: "/api/proxy",
		getParentRoute: () => Route$8
	})
};
var routeTree = Route$8._addFileChildren(rootRouteChildren)._addFileTypes();
var router_exports = /* @__PURE__ */ __exportAll({ getRouter: () => getRouter });
function getRouter() {
	return createRouter({
		routeTree,
		defaultErrorComponent: AppErrorComponent
	});
}
//#endregion
export { searchCatalog as _, Route$5 as a, HScroll as c, TrackArt as d, TrackCard as f, createMoodMix as g, greetingIt as h, Route$3 as i, QuickTile as l, useFlowStore as m, Route$1 as n, Route$6 as o, TrackRow as p, Route$2 as r, Route$7 as s, router_exports as t, SectionHeader as u, stationToTrack as v };
