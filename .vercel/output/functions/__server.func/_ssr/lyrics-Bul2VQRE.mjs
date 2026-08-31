import { r as createServerFn } from "./ssr.mjs";
import { t as createServerRpc } from "./createServerRpc-CcvdN_gc.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/lyrics-Bul2VQRE.js
var EMPTY = {
	videoId: "",
	lines: [],
	synced: false,
	source: ""
};
var cache = /* @__PURE__ */ new Map();
var MAX_CACHE = 64;
function cacheGet(key) {
	return cache.get(key);
}
function cacheSet(key, value) {
	if (!key) return;
	if (cache.has(key)) cache.delete(key);
	cache.set(key, value);
	while (cache.size > MAX_CACHE) {
		const oldest = cache.keys().next().value;
		if (!oldest) break;
		cache.delete(oldest);
	}
}
function parseSynced(raw) {
	const lines = [];
	for (const line of raw.split("\n")) {
		const match = line.match(/\[(\d+):(\d+(?:\.\d+)?)\](.*)/);
		if (!match) continue;
		const text = match[3].trim();
		if (!text) continue;
		lines.push({
			timeMs: (parseInt(match[1], 10) * 60 + parseFloat(match[2])) * 1e3,
			text
		});
	}
	return lines;
}
function parsePlain(raw) {
	return raw.split("\n").map((text, i) => ({
		timeMs: i * 4e3,
		text: text.trim()
	})).filter((l) => l.text && l.text !== "♪");
}
function fromRaw(raw, source, videoId) {
	if (!raw) return null;
	const synced = parseSynced(raw);
	if (synced.length) return {
		videoId,
		lines: synced,
		synced: true,
		source
	};
	const plain = parsePlain(raw);
	if (plain.length) return {
		videoId,
		lines: plain,
		synced: false,
		source
	};
	return null;
}
async function lrclib(title, artist, album, duration, videoId) {
	const cleanTitle = title.replace(/\(official.*?\)|\[official.*?\]|feat\..*|ft\..*/gi, "").trim();
	const cleanArtist = (artist || "").replace(/feat\..*|ft\..*/gi, "").trim();
	const params = new URLSearchParams({
		track_name: cleanTitle || title,
		artist_name: cleanArtist || artist
	});
	if (album) params.set("album_name", album);
	if (duration && duration > 20) params.set("duration", String(Math.round(duration)));
	try {
		const res = await fetch(`https://lrclib.net/api/get?${params}`, {
			headers: {
				"User-Agent": "FlowMusic/1.0 (https://grok.x.ai)",
				Accept: "application/json"
			},
			signal: AbortSignal.timeout(8e3)
		});
		if (res.ok) {
			const data = await res.json();
			const hit = fromRaw(data.syncedLyrics, "lrclib", videoId) || fromRaw(data.plainLyrics, "lrclib", videoId);
			if (hit) return hit;
		}
	} catch {}
	try {
		const q = new URLSearchParams({ track_name: cleanTitle || title });
		if (cleanArtist || artist) q.set("artist_name", cleanArtist || artist);
		const res = await fetch(`https://lrclib.net/api/search?${q}`, {
			headers: {
				"User-Agent": "FlowMusic/1.0 (https://grok.x.ai)",
				Accept: "application/json"
			},
			signal: AbortSignal.timeout(8e3)
		});
		if (!res.ok) return null;
		const list = await res.json();
		if (!Array.isArray(list)) return null;
		for (const data of list.slice(0, 5)) {
			const hit = fromRaw(data.syncedLyrics, "lrclib", videoId) || fromRaw(data.plainLyrics, "lrclib", videoId);
			if (hit) return hit;
		}
	} catch {}
	return null;
}
async function kugou(title, artist, duration, videoId) {
	const keyword = [title, artist].filter(Boolean).join(" ").trim();
	if (!keyword) return null;
	try {
		const durMs = duration && duration > 20 ? Math.round(duration * 1e3) : 0;
		const search = new URLSearchParams({
			ver: "1",
			man: "yes",
			client: "pc",
			keyword,
			hash: ""
		});
		if (durMs) search.set("duration", String(durMs));
		const res = await fetch(`https://lyrics.kugou.com/search?${search}`, {
			headers: { Accept: "application/json" },
			signal: AbortSignal.timeout(8e3)
		});
		if (!res.ok) return null;
		const cand = (await res.json()).candidates?.[0];
		if (!cand?.id || !cand.accesskey) return null;
		const dl = await fetch(`https://lyrics.kugou.com/download?ver=1&client=pc&id=${encodeURIComponent(String(cand.id))}&accesskey=${encodeURIComponent(cand.accesskey)}&fmt=lrc&charset=utf8`, {
			headers: { Accept: "application/json" },
			signal: AbortSignal.timeout(8e3)
		});
		if (!dl.ok) return null;
		const data = await dl.json();
		if (!data.content) return null;
		return fromRaw(Buffer.from(data.content, "base64").toString("utf8"), "kugou", videoId);
	} catch {
		return null;
	}
}
var getTrackLyrics_createServerFn_handler = createServerRpc({
	id: "ce8a487e4cbefbdf4ec0ffa79cb9704d62902152f43f9d7d07bca5a65759f7c5",
	name: "getTrackLyrics",
	filename: "src/lib/music/lyrics.ts"
}, (opts) => getTrackLyrics.__executeServer(opts));
var getTrackLyrics = createServerFn({ method: "GET" }).validator((d) => d).handler(getTrackLyrics_createServerFn_handler, async ({ data }) => {
	const videoId = (data.videoId || "").trim();
	const title = (data.title || "").trim();
	const artist = (data.artist || "").trim();
	const album = (data.album || "").trim() || void 0;
	const duration = typeof data.duration === "number" && data.duration > 0 ? data.duration : void 0;
	const cacheKey = videoId || `${title}|${artist}`.toLowerCase();
	const cached = cacheGet(cacheKey);
	if (cached) return cached;
	if (title) {
		const fromLrc = await lrclib(title, artist, album, duration, videoId);
		if (fromLrc?.lines.length) {
			cacheSet(cacheKey, fromLrc);
			return fromLrc;
		}
	}
	if (title) {
		const fromKugou = await kugou(title, artist, duration, videoId);
		if (fromKugou?.lines.length) {
			cacheSet(cacheKey, fromKugou);
			return fromKugou;
		}
	}
	cacheSet(cacheKey, {
		...EMPTY,
		videoId
	});
	return {
		...EMPTY,
		videoId
	};
});
var getTranslatedLyrics_createServerFn_handler = createServerRpc({
	id: "8c6ad06ba8ef8e631af51a75efe1fcf89a937c103156b28c185e496e1e08a7b2",
	name: "getTranslatedLyrics",
	filename: "src/lib/music/lyrics.ts"
}, (opts) => getTranslatedLyrics.__executeServer(opts));
var getTranslatedLyrics = createServerFn({ method: "POST" }).validator((d) => d).handler(getTranslatedLyrics_createServerFn_handler, async ({ data }) => {
	const target = data.targetLang || "it";
	const text = data.lines.join("\n");
	if (!text.trim()) return [];
	try {
		const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${target}&dt=t&q=${encodeURIComponent(text)}`;
		const res = await fetch(url, { signal: AbortSignal.timeout(8e3) });
		if (res.ok) {
			const json = await res.json();
			if (Array.isArray(json) && Array.isArray(json[0])) return json[0].map((chunk) => typeof chunk[0] === "string" ? chunk[0] : "").join("").split("\n");
		}
	} catch {}
	return [];
});
//#endregion
export { getTrackLyrics_createServerFn_handler, getTranslatedLyrics_createServerFn_handler };
