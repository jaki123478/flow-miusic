import { t as createServerFn } from "./ssr.mjs";
import { t as createServerRpc } from "./createServerRpc-A6pJPYTF.mjs";
import { n as FALLBACK_ART } from "./types-CuQ6ClJX.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/catalog-rZTI_b7V.js
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
var getHomeFeed_createServerFn_handler = createServerRpc({
	id: "8cf6eee8babbaea2485437d5cb4b2c235dbd85b74941fe6109bbf26b9db42407",
	name: "getHomeFeed",
	filename: "src/lib/music/catalog.ts"
}, (opts) => getHomeFeed.__executeServer(opts));
var getHomeFeed = createServerFn({ method: "GET" }).handler(getHomeFeed_createServerFn_handler, async () => {
	const yt = await import("./ytmusic.server-Dey1FpvL.mjs");
	const settled = await Promise.allSettled([
		yt.searchYtMusic("top hits official audio 2026", 16),
		yt.searchYtMusic("hit italia canzone official audio", 12),
		yt.getPlaylistTracks("PL4fGSI1pDJn77aK7sAW2AT0oOzo5inWY8", 16),
		yt.getPlaylistTracks("PL4fGSI1pDJn61unMfmrUSz68RT8IFFnks", 12),
		radioBrowser("/json/stations/search?hidebroken=true&order=clickcount&reverse=true&limit=40"),
		yt.getExploreTracks()
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
	const stations = radiosRaw.map(toStation).filter((s) => Boolean(s)).slice(0, 18);
	return {
		trending: uniqueTracks([
			...hits,
			...pop,
			...explore.trending
		]).slice(0, 24),
		hitsMix: uniqueTracks(italy.length ? italy : viral).slice(0, 16),
		independent: uniqueTracks([...explore.fresh, ...viral]).slice(0, 16),
		radios: stations
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
	const yt = await import("./ytmusic.server-Dey1FpvL.mjs");
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
	const yt = await import("./ytmusic.server-Dey1FpvL.mjs");
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
	return uniqueTracks(await (await import("./ytmusic.server-Dey1FpvL.mjs")).searchYtMusic(data.query, 30)).slice(0, 30);
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
	const yt = await import("./ytmusic.server-Dey1FpvL.mjs");
	const batches = await Promise.all(queries.slice(0, 8).map((q) => yt.searchYtMusic(q, 2).catch(() => [])));
	const extra = await yt.searchYtMusic(prompt, 12).catch(() => []);
	return {
		tracks: uniqueTracks([...batches.flat(), ...extra]).slice(0, 16),
		blurb: blurb || `Mix per: ${mood || prompt}`
	};
});
//#endregion
export { createMoodMix_createServerFn_handler, getChartTracks_createServerFn_handler, getCountryRadios_createServerFn_handler, getGenreMix_createServerFn_handler, getHomeFeed_createServerFn_handler, getTopRadios_createServerFn_handler, searchCatalog_createServerFn_handler };
