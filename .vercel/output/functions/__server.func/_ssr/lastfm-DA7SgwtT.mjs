import { r as createServerFn } from "./ssr.mjs";
import { t as createServerRpc } from "./createServerRpc-CcvdN_gc.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/lastfm-DA7SgwtT.js
var API = "https://ws.audioscrobbler.com/2.0/";
async function lastFmCall(params, secret) {
	const { createHash } = await import("node:crypto");
	const keys = Object.keys(params).filter((k) => k !== "format" && k !== "callback").sort();
	const api_sig = createHash("md5").update(keys.map((k) => k + params[k]).join("") + secret).digest("hex");
	const body = {
		...params,
		format: "json",
		api_sig
	};
	const res = await fetch(API, {
		method: "POST",
		headers: { "Content-Type": "application/x-www-form-urlencoded" },
		body: new URLSearchParams(body),
		signal: AbortSignal.timeout(8e3)
	});
	const json = await res.json();
	if (!res.ok || json.error) throw new Error(String(json.message || json.error || `last.fm ${res.status}`));
	return json;
}
var lastFmHandshake_createServerFn_handler = createServerRpc({
	id: "6095f063f621f088fea9299e213229ee522c781627f94d6033222a923eeff0b0",
	name: "lastFmHandshake",
	filename: "src/lib/music/lastfm.ts"
}, (opts) => lastFmHandshake.__executeServer(opts));
var lastFmHandshake = createServerFn({ method: "POST" }).validator((d) => d).handler(lastFmHandshake_createServerFn_handler, async ({ data }) => {
	const apiKey = data.apiKey.trim();
	const apiSecret = data.apiSecret.trim();
	const username = data.username.trim();
	const password = data.password;
	if (!apiKey || !apiSecret || !username || !password) return {
		ok: false,
		error: "Compila chiave, secret, utente e password."
	};
	try {
		const session = (await lastFmCall({
			method: "auth.getMobileSession",
			api_key: apiKey,
			username,
			password
		}, apiSecret)).session;
		const sessionKey = session?.key || "";
		if (!sessionKey) return {
			ok: false,
			error: "Sessione Last.fm non ricevuta."
		};
		return {
			ok: true,
			sessionKey,
			username: session?.name || username
		};
	} catch (err) {
		return {
			ok: false,
			error: err instanceof Error ? err.message : "Collegamento Last.fm non riuscito"
		};
	}
});
var lastFmUpdate_createServerFn_handler = createServerRpc({
	id: "351f225b34096eb08e6d35a1522b9a9fb7771752e02520f75204619318aa87bf",
	name: "lastFmUpdate",
	filename: "src/lib/music/lastfm.ts"
}, (opts) => lastFmUpdate.__executeServer(opts));
var lastFmUpdate = createServerFn({ method: "POST" }).validator((d) => d).handler(lastFmUpdate_createServerFn_handler, async ({ data }) => {
	const apiKey = data.apiKey.trim();
	const apiSecret = data.apiSecret.trim();
	const sessionKey = data.sessionKey.trim();
	const artist = data.artist.trim();
	const title = data.title.trim();
	if (!apiKey || !apiSecret || !sessionKey || !artist || !title) return {
		ok: false,
		error: "Credenziali Last.fm incomplete."
	};
	const nowPlaying = Boolean(data.nowPlaying);
	const params = {
		method: nowPlaying ? "track.updateNowPlaying" : "track.scrobble",
		api_key: apiKey,
		sk: sessionKey
	};
	if (nowPlaying) {
		params.artist = artist;
		params.track = title;
		if (data.album) params.album = data.album;
		if (data.duration && data.duration > 0) params.duration = String(Math.round(data.duration));
	} else {
		params["artist[0]"] = artist;
		params["track[0]"] = title;
		params["timestamp[0]"] = String(data.timestamp || Math.floor(Date.now() / 1e3));
		if (data.album) params["album[0]"] = data.album;
		if (data.duration && data.duration > 0) params["duration[0]"] = String(Math.round(data.duration));
	}
	try {
		await lastFmCall(params, apiSecret);
		return { ok: true };
	} catch (err) {
		return {
			ok: false,
			error: err instanceof Error ? err.message : "Scrobble non riuscito"
		};
	}
});
//#endregion
export { lastFmHandshake_createServerFn_handler, lastFmUpdate_createServerFn_handler };
