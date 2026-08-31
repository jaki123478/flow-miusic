import { r as createServerFn } from "./ssr.mjs";
import { t as createServerRpc } from "./createServerRpc-CcvdN_gc.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/lyrics-BYeTUFjK.js
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
async function searchLrclib(query) {
	try {
		const url = `https://lrclib.net/api/search?q=${encodeURIComponent(query)}`;
		const res = await fetch(url, {
			headers: { "User-Agent": "FlowMusic/1.0 (https://grok.x.ai)" },
			signal: AbortSignal.timeout(8e3)
		});
		if (!res.ok) return [];
		const list = await res.json();
		if (!Array.isArray(list) || !list.length) return [];
		for (const item of list) if (item.syncedLyrics) {
			const lines = parseSynced(item.syncedLyrics);
			if (lines.length) return lines;
		}
		for (const item of list) if (item.plainLyrics) {
			const lines = parsePlain(item.plainLyrics);
			if (lines.length) return lines;
		}
	} catch {}
	return [];
}
async function lrclib(title, artist, duration) {
	try {
		const cleanTitle = title.replace(/\(official.*?\)|\[official.*?\]|feat\..*|ft\..*/gi, "").trim();
		const cleanArtist = artist.replace(/feat\..*|ft\..*/gi, "").trim();
		let url = `https://lrclib.net/api/get?track_name=${encodeURIComponent(cleanTitle || title)}&artist_name=${encodeURIComponent(cleanArtist || artist)}`;
		if (duration && duration > 0) url += `&duration=${Math.round(duration)}`;
		const res = await fetch(url, {
			headers: { "User-Agent": "FlowMusic/1.0 (https://grok.x.ai)" },
			signal: AbortSignal.timeout(8e3)
		});
		if (res.ok) {
			const data = await res.json();
			if (data.syncedLyrics) {
				const lines = parseSynced(data.syncedLyrics);
				if (lines.length) return lines;
			}
			if (data.plainLyrics) {
				const lines = parsePlain(data.plainLyrics);
				if (lines.length) return lines;
			}
		}
	} catch {}
	const q = [artist, title].filter(Boolean).join(" ").replace(/\(official.*?\)|\[official.*?\]/gi, "").trim();
	if (q) return searchLrclib(q);
	return [];
}
var getTrackLyrics_createServerFn_handler = createServerRpc({
	id: "ce8a487e4cbefbdf4ec0ffa79cb9704d62902152f43f9d7d07bca5a65759f7c5",
	name: "getTrackLyrics",
	filename: "src/lib/music/lyrics.ts"
}, (opts) => getTrackLyrics.__executeServer(opts));
var getTrackLyrics = createServerFn({ method: "GET" }).validator((d) => d).handler(getTrackLyrics_createServerFn_handler, async ({ data }) => {
	const title = (data.title || "").trim();
	const artist = (data.artist || "").trim();
	if (!title && !artist) return [];
	return lrclib(title, artist, data.duration);
});
//#endregion
export { getTrackLyrics_createServerFn_handler };
