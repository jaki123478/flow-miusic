import { r as createServerFn } from "./ssr.mjs";
import { t as createServerRpc } from "./createServerRpc-CcvdN_gc.mjs";
import { i as getSql, t as authMiddleware } from "./middleware-DuFXNrDi.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/cloud-BaY5AZ_E.js
var loadLibrary_createServerFn_handler = createServerRpc({
	id: "a647c0c3f3b4aeb4738fff3de93771df92b8a50843fdc50af33dc5655a22b8b9",
	name: "loadLibrary",
	filename: "src/lib/music/cloud.ts"
}, (opts) => loadLibrary.__executeServer(opts));
var loadLibrary = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(loadLibrary_createServerFn_handler, async ({ context }) => {
	const row = (await (await getSql())`
      select liked, recents, playlists, settings, volume, listen_ms
      from user_library
      where user_id = ${context.userId}
    `)[0];
	if (!row) return null;
	const arr = (v) => {
		if (Array.isArray(v)) return v;
		if (typeof v === "string") try {
			const parsed = JSON.parse(v);
			return Array.isArray(parsed) ? parsed : [];
		} catch {
			return [];
		}
		return [];
	};
	const obj = (v) => {
		if (v && typeof v === "object" && !Array.isArray(v)) return v;
		if (typeof v === "string") try {
			return JSON.parse(v);
		} catch {
			return {};
		}
		return {};
	};
	return {
		liked: arr(row.liked),
		recents: arr(row.recents),
		playlists: arr(row.playlists),
		settings: obj(row.settings),
		volume: Number(row.volume) || .9,
		listenMs: Number(row.listen_ms) || 0
	};
});
var saveLibrary_createServerFn_handler = createServerRpc({
	id: "24128d9fef7ed7b28e076e3ff5dd8aeb86eaa462cea934c8c730433ef91fb021",
	name: "saveLibrary",
	filename: "src/lib/music/cloud.ts"
}, (opts) => saveLibrary.__executeServer(opts));
var saveLibrary = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((data) => data).handler(saveLibrary_createServerFn_handler, async ({ context, data }) => {
	const sql = await getSql();
	const liked = JSON.stringify(data.liked ?? []);
	const recents = JSON.stringify(data.recents ?? []);
	const playlists = JSON.stringify(data.playlists ?? []);
	const settings = JSON.stringify(data.settings ?? {});
	const volume = data.volume ?? .9;
	const listenMs = data.listenMs ?? 0;
	await sql.query(`insert into user_library (user_id, liked, recents, playlists, settings, volume, listen_ms, updated_at)
       values ($1, $2::jsonb, $3::jsonb, $4::jsonb, $5::jsonb, $6, $7, now())
       on conflict (user_id) do update set
         liked = excluded.liked,
         recents = excluded.recents,
         playlists = excluded.playlists,
         settings = excluded.settings,
         volume = excluded.volume,
         listen_ms = excluded.listen_ms,
         updated_at = now()`, [
		context.userId,
		liked,
		recents,
		playlists,
		settings,
		volume,
		listenMs
	]);
});
//#endregion
export { loadLibrary_createServerFn_handler, saveLibrary_createServerFn_handler };
