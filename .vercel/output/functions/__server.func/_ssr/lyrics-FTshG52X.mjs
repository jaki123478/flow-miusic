import { t as createServerFn } from "./ssr.mjs";
import { t as createServerRpc } from "./createServerRpc-A6pJPYTF.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/lyrics-FTshG52X.js
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
async function simpGet(path) {
	try {
		const res = await fetch(`https://api-lyrics.simpmusic.org/v1${path}`, {
			headers: { Accept: "application/json" },
			signal: AbortSignal.timeout(8e3)
		});
		if (!res.ok) return null;
		const body = await res.json();
		return (Array.isArray(body.data) ? body.data[0] : body.data) || null;
	} catch {
		return null;
	}
}
function linesFromSimp(entry) {
	if (!entry) return [];
	const synced = entry.syncedLyrics || entry.syncedLyric;
	if (synced) {
		const lines = parseSynced(synced);
		if (lines.length) return lines;
	}
	if (entry.plainLyric) return parsePlain(entry.plainLyric);
	return [];
}
async function lrclib(title, artist) {
	try {
		const url = `https://lrclib.net/api/get?track_name=${encodeURIComponent(title)}&artist_name=${encodeURIComponent(artist || "")}`;
		const res = await fetch(url, { signal: AbortSignal.timeout(8e3) });
		if (!res.ok) return [];
		const data = await res.json();
		if (data.syncedLyrics) {
			const lines = parseSynced(data.syncedLyrics);
			if (lines.length) return lines;
		}
		if (data.plainLyrics) return parsePlain(data.plainLyrics);
	} catch {}
	return [];
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
	if (videoId) {
		const byId = linesFromSimp(await simpGet(`/${encodeURIComponent(videoId)}`));
		if (byId.length) return byId;
	}
	const q = [title, artist].filter(Boolean).join(" ");
	if (q) {
		const hit = await simpGet(`/search?q=${encodeURIComponent(q)}&limit=1`);
		if (hit?.videoId) {
			const full = linesFromSimp(await simpGet(`/${encodeURIComponent(hit.videoId)}`));
			if (full.length) return full;
		}
		const fromHit = linesFromSimp(hit);
		if (fromHit.length) return fromHit;
	}
	if (title) return lrclib(title, artist);
	return [];
});
//#endregion
export { getTrackLyrics_createServerFn_handler };
