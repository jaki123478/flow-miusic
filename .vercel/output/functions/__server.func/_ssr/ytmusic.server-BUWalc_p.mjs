import { c as __exportAll } from "./ssr.mjs";
import { n as FALLBACK_ART } from "./types-CuQ6ClJX.mjs";
import { t as Innertube } from "../_libs/youtubei.js.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/ytmusic.server-BUWalc_p.js
var ytmusic_server_exports = /* @__PURE__ */ __exportAll({
	getAudioUrl: () => getAudioUrl,
	getExploreTracks: () => getExploreTracks,
	getPlaylistTracks: () => getPlaylistTracks,
	getTube: () => getTube,
	searchYtMusic: () => searchYtMusic
});
var tubePromise = null;
async function getTube() {
	if (!tubePromise) tubePromise = Innertube.create({
		retrieve_player: false,
		generate_session_locally: true,
		lang: "it",
		location: "IT"
	}).catch((err) => {
		tubePromise = null;
		throw err;
	});
	return tubePromise;
}
async function getAudioUrl(videoId) {
	const id = videoId.trim();
	if (!/^[\w-]{11}$/.test(id)) return null;
	try {
		const yt = await getTube();
		for (const client of [
			"IOS",
			"ANDROID",
			"YTMUSIC",
			"WEB"
		]) try {
			const format = (await yt.getBasicInfo(id, { client })).chooseFormat({
				type: "audio",
				quality: "bestefficiency"
			});
			const url = format.url || await format.decipher(yt.session.player).catch(() => "");
			if (url) return url;
		} catch {}
	} catch {}
	const fallbackUrls = [
		`https://pipedapi.kavin.rocks/streams/${id}`,
		`https://api.piped.private.coffee/streams/${id}`,
		`https://inv.nadeko.net/api/v1/videos/${id}`
	];
	for (const ep of fallbackUrls) try {
		const res = await fetch(ep, {
			headers: { Accept: "application/json" },
			signal: AbortSignal.timeout(3500)
		});
		if (!res.ok) continue;
		const data = await res.json();
		const streams = data.audioStreams || (data.adaptiveFormats || []).filter((f) => (f.type || f.mimeType || "").startsWith("audio"));
		if (streams && streams.length && streams[0]?.url) return streams[0].url;
	} catch {}
	return null;
}
function txt(value) {
	if (value == null) return "";
	if (typeof value === "string") return value.trim();
	if (typeof value === "number") return String(value);
	if (typeof value === "object") {
		const rec = value;
		if (typeof rec.name === "string") return rec.name.trim();
		if (typeof rec.text === "string") return rec.text.trim();
		if (typeof rec.toString === "function") {
			const s = rec.toString();
			if (s && s !== "[object Object]") return s.trim();
		}
	}
	return "";
}
function parseClock(raw) {
	const matches = [...raw.matchAll(/(\d+):(\d{2})/g)];
	const last = matches[matches.length - 1];
	if (!last) return 0;
	return parseInt(last[1], 10) * 60 + parseInt(last[2], 10);
}
function durationOf(item, subtitle) {
	const d = item.duration;
	if (typeof d === "number" && d > 0) return d > 1e3 ? Math.round(d / 1e3) : d;
	if (d && typeof d === "object") {
		const rec = d;
		const n = Number(rec.seconds ?? rec.duration_seconds ?? 0);
		if (n > 0) return n;
	}
	return parseClock(subtitle);
}
function thumbnailOf(item, videoId) {
	const thumb = item.thumbnail;
	const image = item.content_image?.image;
	const list = thumb?.contents || image || [];
	for (let i = list.length - 1; i >= 0; i--) {
		const url = list[i]?.url;
		if (url?.startsWith("http")) return url;
	}
	if (videoId) return `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
	return FALLBACK_ART;
}
function artistOf(item, subtitle, title) {
	const authors = item.authors;
	const artists = item.artists;
	const fromAuthors = (authors || artists || []).map(txt).filter(Boolean);
	if (fromAuthors.length) return fromAuthors.join(", ");
	const parts = subtitle.split("•").map((s) => s.trim()).filter(Boolean);
	const skip = /video|visualizzaz|views|official|album|playlist|puntata/i;
	const guess = parts.find((p) => !skip.test(p) && !/^\d/.test(p) && p.length < 60);
	if (guess) return guess;
	const dash = title.match(/^(.{2,48}?)\s+[-–—]\s+/);
	if (dash) return dash[1].trim();
	return "Artista";
}
function isVideoId(id) {
	return /^[\w-]{11}$/.test(id);
}
function toTrack(item) {
	if (!item || typeof item !== "object") return null;
	const rec = item;
	const itemType = String(rec.item_type || rec.content_type || rec.type || "").toLowerCase();
	if (itemType.includes("artist") || itemType.includes("podcast") || itemType.includes("episode")) return null;
	const tap = rec.on_tap;
	const overlay = rec.overlay;
	const id = String(rec.id || rec.content_id || rec.video_id || tap?.payload?.videoId || overlay?.content?.endpoint?.payload?.videoId || "");
	if (!isVideoId(id)) return null;
	const title = txt(rec.title) || txt(rec.metadata?.title);
	if (!title) return null;
	if (/puntata|podcast|episode/i.test(title) && !/official|mv|audio|lyrics/i.test(title)) return null;
	const subtitle = txt(rec.subtitle) || txt(rec.flex_columns?.[1]?.title) || "";
	const artist = artistOf(rec, subtitle, title);
	return {
		id: `yt_${id}`,
		videoId: id,
		title,
		artist,
		artwork: thumbnailOf(rec, id),
		duration: durationOf(rec, subtitle),
		streamUrl: "",
		source: "ytmusic"
	};
}
function walkTracks(root, into, seen, depth = 0) {
	if (!root || depth > 14 || into.length > 80) return;
	if (Array.isArray(root)) {
		for (const item of root) walkTracks(item, into, seen, depth + 1);
		return;
	}
	if (typeof root !== "object") return;
	const rec = root;
	const track = toTrack(rec);
	if (track && !seen.has(track.id)) {
		seen.add(track.id);
		into.push(track);
	}
	for (const key of [
		"contents",
		"sections",
		"results",
		"items",
		"header"
	]) if (rec[key]) walkTracks(rec[key], into, seen, depth + 1);
}
function uniqueTracks(list) {
	const seen = /* @__PURE__ */ new Set();
	const out = [];
	for (const t of list) {
		const key = `${t.videoId || t.id}`;
		if (seen.has(key)) continue;
		seen.add(key);
		out.push(t);
	}
	return out;
}
var NOT_MUSIC = /puntata|podcast|vangelo|rosario|garlasco|ucraina|true crime|notizie|giornale|intervista politica|serie a\b|formula 1|gp olanda/i;
function isLikelySong(track) {
	const blob = `${track.title} ${track.artist}`;
	if (NOT_MUSIC.test(blob)) return false;
	if (track.title.length > 96) return false;
	if (/\bplaylist\b|top hits \d{4}|trending songs \d{4}|best songs playlist|spotify pop mix/i.test(track.title)) return false;
	return true;
}
async function searchYtMusic(query, limit = 24) {
	const q = query.trim();
	if (!q) return [];
	const result = await (await getTube()).music.search(q);
	const tracks = [];
	walkTracks(result, tracks, /* @__PURE__ */ new Set());
	return uniqueTracks(tracks.filter(isLikelySong)).slice(0, limit);
}
async function getExploreTracks() {
	const sections = (await (await getTube()).music.getExplore()).sections || [];
	const trending = [];
	const fresh = [];
	const seenT = /* @__PURE__ */ new Set();
	const seenF = /* @__PURE__ */ new Set();
	for (const section of sections) {
		const title = `${txt(section.header?.title)} ${txt(section.title)}`.toLowerCase();
		if (/puntat|podcast|episodio/.test(title)) continue;
		if (!/video musical|nuovi video|brani|hits|official/.test(title) && title.trim()) continue;
		const bucket = /nuov/.test(title) ? fresh : trending;
		const seen = bucket === fresh ? seenF : seenT;
		walkTracks(section.contents, bucket, seen);
	}
	return {
		trending: uniqueTracks(trending.filter(isLikelySong)).slice(0, 24),
		fresh: uniqueTracks(fresh.filter(isLikelySong)).slice(0, 24)
	};
}
async function getPlaylistTracks(playlistId, limit = 30) {
	const id = playlistId.replace(/^VL/, "");
	if (!id) return [];
	const playlist = await (await getTube()).getPlaylist(id);
	const tracks = [];
	const seen = /* @__PURE__ */ new Set();
	walkTracks(playlist.items || playlist, tracks, seen);
	return uniqueTracks(tracks.filter(isLikelySong)).slice(0, limit);
}
//#endregion
export { ytmusic_server_exports as n, getAudioUrl as t };
