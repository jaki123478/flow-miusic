import { r as createServerFn } from "./ssr.mjs";
import { t as createServerRpc } from "./createServerRpc-CcvdN_gc.mjs";
import { i as getSql, t as authMiddleware } from "./middleware-DuFXNrDi.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/share-D9sbOXKn.js
function slug() {
	return `s${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36).slice(-4)}`;
}
function asTracks(v) {
	if (Array.isArray(v)) return v;
	if (typeof v === "string") try {
		const parsed = JSON.parse(v);
		return Array.isArray(parsed) ? parsed : [];
	} catch {
		return [];
	}
	return [];
}
var publishPlaylist_createServerFn_handler = createServerRpc({
	id: "eb715264cb14916343622bdad7fc98482b5f416cefea1798c071844e56a8e606",
	name: "publishPlaylist",
	filename: "src/lib/music/share.ts"
}, (opts) => publishPlaylist.__executeServer(opts));
var publishPlaylist = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((d) => d).handler(publishPlaylist_createServerFn_handler, async ({ context, data }) => {
	const sql = await getSql();
	const id = data.id?.trim() || slug();
	const title = (data.title || "Playlist").trim().slice(0, 80);
	const owner = (data.ownerName || "Utente").trim().slice(0, 60);
	const tracks = JSON.stringify((data.tracks || []).slice(0, 80));
	const collab = Boolean(data.collab);
	await sql.query(`insert into shared_playlists (id, user_id, owner_name, title, tracks, collab, created_at)
       values ($1, $2, $3, $4, $5::jsonb, $6, now())
       on conflict (id) do update set
         title = excluded.title,
         tracks = excluded.tracks,
         collab = excluded.collab,
         owner_name = excluded.owner_name
       where shared_playlists.user_id = $2`, [
		id,
		context.userId,
		owner,
		title,
		tracks,
		collab
	]);
	return { id };
});
var getSharedPlaylist_createServerFn_handler = createServerRpc({
	id: "38bf62ce71e0190290db930d5798ef4ee437b20a1cdff3eee56aecfdfcf321b3",
	name: "getSharedPlaylist",
	filename: "src/lib/music/share.ts"
}, (opts) => getSharedPlaylist.__executeServer(opts));
var getSharedPlaylist = createServerFn({ method: "GET" }).validator((d) => d).handler(getSharedPlaylist_createServerFn_handler, async ({ data }) => {
	const row = (await (await getSql())`select id, user_id, owner_name, title, tracks, collab from shared_playlists where id = ${data.id}`)[0];
	if (!row) return null;
	return {
		id: row.id,
		userId: row.user_id,
		ownerName: row.owner_name,
		title: row.title,
		tracks: asTracks(row.tracks),
		collab: Boolean(row.collab)
	};
});
var addSharedTrack_createServerFn_handler = createServerRpc({
	id: "b3740a781b8c2931661ba664483641862702a657b02d31b78df7cf3880636cc4",
	name: "addSharedTrack",
	filename: "src/lib/music/share.ts"
}, (opts) => addSharedTrack.__executeServer(opts));
var addSharedTrack = createServerFn({ method: "POST" }).validator((d) => d).handler(addSharedTrack_createServerFn_handler, async ({ data }) => {
	const sql = await getSql();
	const row = (await sql`
      select tracks, collab from shared_playlists where id = ${data.id}
    `)[0];
	if (!row || !row.collab) return { ok: false };
	const tracks = asTracks(row.tracks);
	if (tracks.some((t) => t.id === data.track.id)) return { ok: true };
	const next = JSON.stringify([...tracks, data.track].slice(0, 80));
	await sql.query(`update shared_playlists set tracks = $1::jsonb where id = $2 and collab = true`, [next, data.id]);
	return { ok: true };
});
var listUserPlaylists_createServerFn_handler = createServerRpc({
	id: "1d774a97ddc65e6ea8fa4d8de5564851dac8d347f4da7748d684e9a06fd845d9",
	name: "listUserPlaylists",
	filename: "src/lib/music/share.ts"
}, (opts) => listUserPlaylists.__executeServer(opts));
var listUserPlaylists = createServerFn({ method: "GET" }).validator((d) => d).handler(listUserPlaylists_createServerFn_handler, async ({ data }) => {
	return (await (await getSql())`select id, user_id, owner_name, title, tracks, collab from shared_playlists where user_id = ${data.userId} order by created_at desc`).map((row) => ({
		id: row.id,
		userId: row.user_id,
		ownerName: row.owner_name,
		title: row.title,
		tracks: asTracks(row.tracks),
		collab: Boolean(row.collab)
	}));
});
var followUser_createServerFn_handler = createServerRpc({
	id: "d10a7b663b69d3e1af86f8323b415e9018c2157846c363d760b3b1d7cc8ba126",
	name: "followUser",
	filename: "src/lib/music/share.ts"
}, (opts) => followUser.__executeServer(opts));
var followUser = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((d) => d).handler(followUser_createServerFn_handler, async ({ context, data }) => {
	if (!data.targetId || data.targetId === context.userId) return;
	await (await getSql()).query(`insert into follows (user_id, target_id) values ($1, $2) on conflict do nothing`, [context.userId, data.targetId]);
});
var unfollowUser_createServerFn_handler = createServerRpc({
	id: "2c5986bfbbc1fec6871fbfb28bb0e161830c733aab33519ddc02a3fe26bff3bd",
	name: "unfollowUser",
	filename: "src/lib/music/share.ts"
}, (opts) => unfollowUser.__executeServer(opts));
var unfollowUser = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((d) => d).handler(unfollowUser_createServerFn_handler, async ({ context, data }) => {
	await (await getSql()).query(`delete from follows where user_id = $1 and target_id = $2`, [context.userId, data.targetId]);
});
var listFriendsFeed_createServerFn_handler = createServerRpc({
	id: "348717c0bc10e27730f609890bfe31e7973d38f21f4d1e318fb4699d08d7b865",
	name: "listFriendsFeed",
	filename: "src/lib/music/share.ts"
}, (opts) => listFriendsFeed.__executeServer(opts));
var listFriendsFeed = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(listFriendsFeed_createServerFn_handler, async ({ context }) => {
	return (await (await getSql())`
      select s.id, s.user_id, s.owner_name, s.title, s.tracks, s.collab
      from shared_playlists s
      join follows f on f.target_id = s.user_id
      where f.user_id = ${context.userId}
      order by s.created_at desc
      limit 40
    `).map((row) => ({
		id: row.id,
		userId: row.user_id,
		ownerName: row.owner_name,
		title: row.title,
		tracks: asTracks(row.tracks),
		collab: Boolean(row.collab)
	}));
});
//#endregion
export { addSharedTrack_createServerFn_handler, followUser_createServerFn_handler, getSharedPlaylist_createServerFn_handler, listFriendsFeed_createServerFn_handler, listUserPlaylists_createServerFn_handler, publishPlaylist_createServerFn_handler, unfollowUser_createServerFn_handler };
