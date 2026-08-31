import { r as createServerFn } from "./ssr.mjs";
import { t as createServerRpc } from "./createServerRpc-CcvdN_gc.mjs";
import { n as FALLBACK_ART } from "./types-CuQ6ClJX.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/catalog-CTqlkoak.js
var UA = "FlowMusic/1.0 (https://grok.x.ai)";
async function fetchJson(url, timeoutMs = 1e4) {
	try {
		const res = await fetch(url, {
			headers: {
				"User-Agent": UA,
				Accept: "application/json"
			},
			signal: AbortSignal.timeout(timeoutMs)
		});
		if (!res.ok) return null;
		return await res.json();
	} catch {
		return null;
	}
}
function uniqueTracks(list) {
	const seen = /* @__PURE__ */ new Set();
	const out = [];
	for (const t of list) {
		const key = t.videoId || t.id;
		if (seen.has(key) || seen.has(t.id)) continue;
		seen.add(key);
		seen.add(t.id);
		out.push(t);
	}
	return out;
}
function toStation(s) {
	const stream = (s.url_resolved || s.url || "").trim();
	if (!s.stationuuid || !s.name || !stream.startsWith("https://")) return null;
	if (s.lastcheckok === 0) return null;
	return {
		id: s.stationuuid,
		name: s.name.trim(),
		country: s.country || "",
		countryCode: (s.countrycode || "").toUpperCase(),
		city: s.state,
		tags: s.tags || "",
		artwork: FALLBACK_ART,
		streamUrl: stream,
		bitrate: s.bitrate,
		votes: s.votes
	};
}
var RB_HOSTS = [
	"https://de1.api.radio-browser.info",
	"https://fi1.api.radio-browser.info",
	"https://at1.api.radio-browser.info"
];
async function radioBrowser(path) {
	return await Promise.any(RB_HOSTS.map(async (host) => {
		const data = await fetchJson(`${host}${path}`, 4500);
		if (!Array.isArray(data) || data.length === 0) throw new Error("empty");
		return data;
	})).catch(() => []);
}
var HOME_PLAYLISTS = [
	{
		id: "hits",
		title: "Hit del momento",
		subtitle: "Dal catalogo YouTube Music",
		playlistId: "PL4fGSI1pDJn77aK7sAW2AT0oOzo5inWY8"
	},
	{
		id: "viral",
		title: "Virali",
		subtitle: "Cosa sta esplodendo",
		playlistId: "PL4fGSI1pDJn61unMfmrUSz68RT8IFFnks"
	},
	{
		id: "global",
		title: "Global Top",
		subtitle: "Classifica ufficiale",
		playlistId: "PL4fGSI1pDJn69On1f-8NAvX_CYlx7QyZc"
	},
	{
		id: "latino",
		title: "Latino",
		subtitle: "Reggaeton e oltre",
		playlistId: "PL4fGSI1pDJn5O8siDeZuI_4hbk6JWtTX1"
	}
];
var getHomeFeed_createServerFn_handler = createServerRpc({
	id: "8cf6eee8babbaea2485437d5cb4b2c235dbd85b74941fe6109bbf26b9db42407",
	name: "getHomeFeed",
	filename: "src/lib/music/catalog.ts"
}, (opts) => getHomeFeed.__executeServer(opts));
var getHomeFeed = createServerFn({ method: "GET" }).handler(getHomeFeed_createServerFn_handler, async () => {
	const yt = await import("./ytmusic.server-DNnXosk4.mjs").then((n) => n.n);
	const settled = await Promise.allSettled([
		yt.searchYtMusic("top hits official audio 2026", 16),
		yt.searchYtMusic("hit italia canzone official audio", 12),
		yt.getPlaylistTracks(HOME_PLAYLISTS[0].playlistId, 16),
		yt.getPlaylistTracks(HOME_PLAYLISTS[1].playlistId, 12),
		radioBrowser("/json/stations/search?hidebroken=true&order=clickcount&reverse=true&limit=40"),
		yt.getExploreTracks(),
		yt.getPlaylistTracks(HOME_PLAYLISTS[2].playlistId, 12),
		yt.getPlaylistTracks(HOME_PLAYLISTS[3].playlistId, 12)
	]);
	const hits = settled[0].status === "fulfilled" ? settled[0].value : [];
	const italy = settled[1].status === "fulfilled" ? settled[1].value : [];
	const pop = settled[2].status === "fulfilled" ? settled[2].value : [];
	const viral = settled[3].status === "fulfilled" ? settled[3].value : [];
	const radiosRaw = settled[4].status === "fulfilled" ? settled[4].value : [];
	const explore = settled[5].status === "fulfilled" ? settled[5].value : {
		trending: [],
		fresh: []
	};
	const global = settled[6].status === "fulfilled" ? settled[6].value : [];
	const latino = settled[7].status === "fulfilled" ? settled[7].value : [];
	const stations = radiosRaw.map(toStation).filter((s) => Boolean(s)).slice(0, 18);
	const trending = uniqueTracks([
		...hits,
		...pop,
		...explore.trending
	]).slice(0, 24);
	const playlistTracks = [
		pop,
		viral,
		global,
		latino
	];
	const curated = HOME_PLAYLISTS.map((spec, i) => ({
		id: spec.id,
		title: spec.title,
		subtitle: spec.subtitle,
		tracks: uniqueTracks(playlistTracks[i] || []).slice(0, 16)
	})).filter((c) => c.tracks.length >= 4);
	const discoverWeekly = uniqueTracks([
		...explore.trending,
		...hits,
		...viral
	]).slice(0, 20);
	const dailyPlaylists = curated;
	return {
		trending,
		hitsMix: uniqueTracks(italy.length ? italy : viral).slice(0, 16),
		independent: uniqueTracks([...explore.fresh, ...viral]).slice(0, 16),
		radios: stations,
		discoverWeekly,
		curated,
		dailyPlaylists
	};
});
var searchCatalog_createServerFn_handler = createServerRpc({
	id: "6eeca8432c020e4488999a9f520d136ca6d359bf146e4fc720286117cfb8c004",
	name: "searchCatalog",
	filename: "src/lib/music/catalog.ts"
}, (opts) => searchCatalog.__executeServer(opts));
var searchCatalog = createServerFn({ method: "GET" }).validator((d) => d).handler(searchCatalog_createServerFn_handler, async ({ data }) => {
	const q = (data.q || "").trim();
	if (!q) return {
		tracks: [],
		radios: [],
		independent: []
	};
	const yt = await import("./ytmusic.server-DNnXosk4.mjs").then((n) => n.n);
	const [tracks, rb] = await Promise.all([yt.searchYtMusic(q, 28).catch(() => []), radioBrowser(`/json/stations/search?name=${encodeURIComponent(q)}&hidebroken=true&limit=12&order=votes&reverse=true`)]);
	return {
		tracks: uniqueTracks(tracks),
		independent: [],
		radios: rb.map(toStation).filter((s) => Boolean(s)).slice(0, 10)
	};
});
var getChartTracks_createServerFn_handler = createServerRpc({
	id: "74d2cdb2d98c87a08e4dcc4ab358f071ee955183d53df01037b0507f9a6648c3",
	name: "getChartTracks",
	filename: "src/lib/music/catalog.ts"
}, (opts) => getChartTracks.__executeServer(opts));
var getChartTracks = createServerFn({ method: "GET" }).validator((d) => d).handler(getChartTracks_createServerFn_handler, async ({ data }) => {
	const yt = await import("./ytmusic.server-DNnXosk4.mjs").then((n) => n.n);
	const fromPl = data.playlistId ? await yt.getPlaylistTracks(data.playlistId, 40).catch(() => []) : [];
	if (fromPl.length >= 8) return uniqueTracks(fromPl);
	const query = (data.query || "").trim();
	const tracks = query ? await yt.searchYtMusic(query, 30) : await yt.getExploreTracks().then((e) => e.trending);
	return uniqueTracks([...fromPl, ...tracks]).slice(0, 40);
});
var getGenreMix_createServerFn_handler = createServerRpc({
	id: "73f83a45f51d7430d01c6ba65abb1226397cf20c8962951e26bac99785823176",
	name: "getGenreMix",
	filename: "src/lib/music/catalog.ts"
}, (opts) => getGenreMix.__executeServer(opts));
var getGenreMix = createServerFn({ method: "GET" }).validator((d) => d).handler(getGenreMix_createServerFn_handler, async ({ data }) => {
	return uniqueTracks(await (await import("./ytmusic.server-DNnXosk4.mjs").then((n) => n.n)).searchYtMusic(data.query, 30)).slice(0, 30);
});
var getCountryRadios_createServerFn_handler = createServerRpc({
	id: "e717f14110eb25ec0b39ab5ab4b7f9b3b857b73869aee0b9e1025fd5f0dba8d9",
	name: "getCountryRadios",
	filename: "src/lib/music/catalog.ts"
}, (opts) => getCountryRadios.__executeServer(opts));
var getCountryRadios = createServerFn({ method: "GET" }).validator((d) => d).handler(getCountryRadios_createServerFn_handler, async ({ data }) => {
	const code = (data.countryCode || "IT").toUpperCase();
	return (await radioBrowser(`/json/stations/search?countrycode=${encodeURIComponent(code)}&hidebroken=true&order=clickcount&reverse=true&limit=40`)).map(toStation).filter((s) => Boolean(s)).slice(0, 30);
});
var getTopRadios_createServerFn_handler = createServerRpc({
	id: "02870f145ed293cf162bbe007ee1f2f3e2e84304ede96df4483cd43ae7997e20",
	name: "getTopRadios",
	filename: "src/lib/music/catalog.ts"
}, (opts) => getTopRadios.__executeServer(opts));
var getTopRadios = createServerFn({ method: "GET" }).handler(getTopRadios_createServerFn_handler, async () => {
	return (await radioBrowser("/json/stations/search?hidebroken=true&order=clickcount&reverse=true&limit=50")).map(toStation).filter((s) => Boolean(s)).slice(0, 36);
});
var createMoodMix_createServerFn_handler = createServerRpc({
	id: "ec02d6163239e7f655cf1fccbdc3f61e78a074317e13902650d1532a6e9f3fe4",
	name: "createMoodMix",
	filename: "src/lib/music/catalog.ts"
}, (opts) => createMoodMix.__executeServer(opts));
var createMoodMix = createServerFn({ method: "POST" }).validator((d) => d).handler(createMoodMix_createServerFn_handler, async ({ data }) => {
	const mood = (data.mood || "").trim();
	const prompt = (data.prompt || mood).trim();
	if (!prompt) return {
		tracks: [],
		blurb: ""
	};
	let queries = [prompt];
	let blurb = "";
	const apiKey = process.env.XAI_API_KEY;
	if (apiKey) try {
		const res = await fetch("https://api.x.ai/v1/chat/completions", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${apiKey}`
			},
			body: JSON.stringify({
				model: "grok-4.5",
				max_tokens: 400,
				messages: [{
					role: "system",
					content: "Sei un DJ. Rispondi SOLO con JSON: {\"blurb\":\"frase breve in italiano\",\"queries\":[\"titolo canzone artista\", ...]} con esattamente 8 query di brani reali adatti al mood."
				}, {
					role: "user",
					content: `Mood: ${prompt}`
				}]
			}),
			signal: AbortSignal.timeout(12e3)
		});
		if (res.ok) {
			const match = ((await res.json()).choices?.[0]?.message?.content || "").match(/\{[\s\S]*\}/);
			if (match) {
				const parsed = JSON.parse(match[0]);
				if (Array.isArray(parsed.queries) && parsed.queries.length) {
					queries = parsed.queries.slice(0, 8);
					blurb = String(parsed.blurb || "");
				}
			}
		}
	} catch {}
	const yt = await import("./ytmusic.server-DNnXosk4.mjs").then((n) => n.n);
	const batches = await Promise.all(queries.slice(0, 8).map((q) => yt.searchYtMusic(q, 2).catch(() => [])));
	const extra = await yt.searchYtMusic(prompt, 12).catch(() => []);
	return {
		tracks: uniqueTracks([...batches.flat(), ...extra]).slice(0, 16),
		blurb: blurb || `Mix per: ${mood || prompt}`
	};
});
var getRelatedTracks_createServerFn_handler = createServerRpc({
	id: "7580feac10e6253205f841f28f3415ddc74e772b735c0f713a7d07cdd35c926f",
	name: "getRelatedTracks",
	filename: "src/lib/music/catalog.ts"
}, (opts) => getRelatedTracks.__executeServer(opts));
var getRelatedTracks = createServerFn({ method: "GET" }).validator((d) => d).handler(getRelatedTracks_createServerFn_handler, async ({ data }) => {
	const yt = await import("./ytmusic.server-DNnXosk4.mjs").then((n) => n.n);
	const artist = (data.artist || "").trim();
	const queries = [
		`${artist} ${(data.title || "").trim()} mix official audio`,
		`${artist} radio mix official audio`,
		`${artist} similar songs official audio`
	].filter((q) => q.replace(/official audio|mix|radio|similar songs/gi, "").trim().length > 1);
	return uniqueTracks((await Promise.all(queries.map((q) => yt.searchYtMusic(q, 10).catch(() => [])))).flat()).filter((t) => t.id !== data.excludeId && t.videoId !== data.excludeId).slice(0, 24);
});
var getDiscoverMix_createServerFn_handler = createServerRpc({
	id: "3a61f6d9a5b2a72932f3b42ae25bd9fea4a51eb3d0412a5c2087bade843a5521",
	name: "getDiscoverMix",
	filename: "src/lib/music/catalog.ts"
}, (opts) => getDiscoverMix.__executeServer(opts));
var getDiscoverMix = createServerFn({ method: "POST" }).validator((d) => d).handler(getDiscoverMix_createServerFn_handler, async ({ data }) => {
	const artists = (data.artists || []).map((a) => a.trim()).filter(Boolean).slice(0, 6);
	const yt = await import("./ytmusic.server-DNnXosk4.mjs").then((n) => n.n);
	if (!artists.length) {
		const explore = await yt.getExploreTracks();
		return uniqueTracks([...explore.trending, ...explore.fresh]).slice(0, 24);
	}
	return uniqueTracks((await Promise.all(artists.map((a) => yt.searchYtMusic(`${a} mix official audio`, 8).catch(() => [])))).flat()).slice(0, 28);
});
var getFreshTracks_createServerFn_handler = createServerRpc({
	id: "92d821464d41705d2e2089b73ce3a31822baedf41ef8a9033b3d6d8e81197a28",
	name: "getFreshTracks",
	filename: "src/lib/music/catalog.ts"
}, (opts) => getFreshTracks.__executeServer(opts));
var getFreshTracks = createServerFn({ method: "POST" }).validator((d) => d).handler(getFreshTracks_createServerFn_handler, async ({ data }) => {
	const yt = await import("./ytmusic.server-DNnXosk4.mjs").then((n) => n.n);
	const explore = await yt.getExploreTracks();
	const artists = (data.artists || []).map((a) => a.trim()).filter(Boolean).slice(0, 5);
	const year = (/* @__PURE__ */ new Date()).getFullYear();
	const batches = await Promise.all(artists.map((a) => yt.searchYtMusic(`${a} ${year} official audio`, 6).catch(() => [])));
	return uniqueTracks([...explore.fresh, ...batches.flat()]).slice(0, 28);
});
var getVideoTrack_createServerFn_handler = createServerRpc({
	id: "afa95265f4f577d598099ad132c957a676be41bec0b1c639083bdf97fe9f4946",
	name: "getVideoTrack",
	filename: "src/lib/music/catalog.ts"
}, (opts) => getVideoTrack.__executeServer(opts));
var getVideoTrack = createServerFn({ method: "GET" }).validator((d) => d).handler(getVideoTrack_createServerFn_handler, async ({ data }) => {
	const id = (data.id || "").trim();
	if (!id) return null;
	const hits = await (await import("./ytmusic.server-DNnXosk4.mjs").then((n) => n.n)).searchYtMusic(id, 6).catch(() => []);
	return hits.find((t) => t.videoId === id || t.id === id) || hits[0] || null;
});
var getPlayUrl_createServerFn_handler = createServerRpc({
	id: "ab37ff9b70b544c9bbbc85c414574743846319983fa1544ae2f39e0b18722c41",
	name: "getPlayUrl",
	filename: "src/lib/music/catalog.ts"
}, (opts) => getPlayUrl.__executeServer(opts));
var getPlayUrl = createServerFn({ method: "GET" }).validator((d) => d).handler(getPlayUrl_createServerFn_handler, async ({ data }) => {
	const id = (data.v || "").trim();
	if (!/^[\w-]{11}$/.test(id)) return { url: null };
	return { url: await (await import("./ytmusic.server-DNnXosk4.mjs").then((n) => n.n)).getAudioUrl(id) || null };
});
//#endregion
export { createMoodMix_createServerFn_handler, getChartTracks_createServerFn_handler, getCountryRadios_createServerFn_handler, getDiscoverMix_createServerFn_handler, getFreshTracks_createServerFn_handler, getGenreMix_createServerFn_handler, getHomeFeed_createServerFn_handler, getPlayUrl_createServerFn_handler, getRelatedTracks_createServerFn_handler, getTopRadios_createServerFn_handler, getVideoTrack_createServerFn_handler, searchCatalog_createServerFn_handler };
