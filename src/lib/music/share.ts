import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "@/lib/auth/middleware";
import { getSql } from "@/lib/db";
import type { Track } from "./types";

function slug() {
  return `s${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36).slice(-4)}`;
}

function asTracks(v: unknown): Track[] {
  if (Array.isArray(v)) return v as Track[];
  if (typeof v === "string") {
    try {
      const parsed = JSON.parse(v) as Track[];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
}

export type SharedPlaylist = {
  id: string;
  userId: string;
  ownerName: string;
  title: string;
  tracks: Track[];
  collab: boolean;
};

export const publishPlaylist = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((d: { title: string; tracks: Track[]; collab?: boolean; ownerName?: string; id?: string }) => d)
  .handler(async ({ context, data }) => {
    try {
      const sql = await getSql();
      const id = data.id?.trim() || slug();
      const title = (data.title || "Playlist").trim().slice(0, 80);
      const owner = (data.ownerName || "Utente").trim().slice(0, 60);
      const tracks = JSON.stringify((data.tracks || []).slice(0, 80));
      const collab = Boolean(data.collab);
      await sql.query(
        `insert into shared_playlists (id, user_id, owner_name, title, tracks, collab, created_at)
         values ($1, $2, $3, $4, $5::jsonb, $6, now())
         on conflict (id) do update set
           title = excluded.title,
           tracks = excluded.tracks,
           collab = excluded.collab,
           owner_name = excluded.owner_name
         where shared_playlists.user_id = $2`,
        [id, context.userId, owner, title, tracks, collab],
      );
      return { id };
    } catch {
      return { id: data.id || slug() };
    }
  });

export const getSharedPlaylist = createServerFn({ method: "GET" })
  .validator((d: { id: string }) => d)
  .handler(async ({ data }) => {
    try {
      const sql = await getSql();
      const rows = await sql<{
        id: string;
        user_id: string;
        owner_name: string;
        title: string;
        tracks: unknown;
        collab: boolean;
      }>`select id, user_id, owner_name, title, tracks, collab from shared_playlists where id = ${data.id}`;
      const row = rows[0];
      if (!row) return null as SharedPlaylist | null;
      return {
        id: row.id,
        userId: row.user_id,
        ownerName: row.owner_name,
        title: row.title,
        tracks: asTracks(row.tracks),
        collab: Boolean(row.collab),
      };
    } catch {
      return null as SharedPlaylist | null;
    }
  });

export const addSharedTrack = createServerFn({ method: "POST" })
  .validator((d: { id: string; track: Track }) => d)
  .handler(async ({ data }) => {
    try {
      const sql = await getSql();
      const rows = await sql<{ tracks: unknown; collab: boolean }>`
        select tracks, collab from shared_playlists where id = ${data.id}
      `;
      const row = rows[0];
      if (!row || !row.collab) return { ok: false as const };
      const tracks = asTracks(row.tracks);
      if (tracks.some((t) => t.id === data.track.id)) return { ok: true as const };
      const next = JSON.stringify([...tracks, data.track].slice(0, 80));
      await sql.query(`update shared_playlists set tracks = $1::jsonb where id = $2 and collab = true`, [next, data.id]);
      return { ok: true as const };
    } catch {
      return { ok: false as const };
    }
  });

export const listUserPlaylists = createServerFn({ method: "GET" })
  .validator((d: { userId: string }) => d)
  .handler(async ({ data }) => {
    try {
      const sql = await getSql();
      const rows = await sql<{
        id: string;
        user_id: string;
        owner_name: string;
        title: string;
        tracks: unknown;
        collab: boolean;
      }>`select id, user_id, owner_name, title, tracks, collab from shared_playlists where user_id = ${data.userId} order by created_at desc`;
      return rows.map((row) => ({
        id: row.id,
        userId: row.user_id,
        ownerName: row.owner_name,
        title: row.title,
        tracks: asTracks(row.tracks),
        collab: Boolean(row.collab),
      })) satisfies SharedPlaylist[];
    } catch {
      return [] as SharedPlaylist[];
    }
  });

export const followUser = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((d: { targetId: string }) => d)
  .handler(async ({ context, data }) => {
    try {
      if (!data.targetId || data.targetId === context.userId) return;
      const sql = await getSql();
      await sql.query(
        `insert into follows (user_id, target_id) values ($1, $2) on conflict do nothing`,
        [context.userId, data.targetId],
      );
    } catch {
      /* ignore */
    }
  });

export const unfollowUser = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((d: { targetId: string }) => d)
  .handler(async ({ context, data }) => {
    try {
      const sql = await getSql();
      await sql.query(`delete from follows where user_id = $1 and target_id = $2`, [context.userId, data.targetId]);
    } catch {
      /* ignore */
    }
  });

export const listFriendsFeed = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    try {
      const sql = await getSql();
      const rows = await sql<{
        id: string;
        user_id: string;
        owner_name: string;
        title: string;
        tracks: unknown;
        collab: boolean;
      }>`
        select s.id, s.user_id, s.owner_name, s.title, s.tracks, s.collab
        from shared_playlists s
        join follows f on f.target_id = s.user_id
        where f.user_id = ${context.userId}
        order by s.created_at desc
        limit 40
      `;
      return rows.map((row) => ({
        id: row.id,
        userId: row.user_id,
        ownerName: row.owner_name,
        title: row.title,
        tracks: asTracks(row.tracks),
        collab: Boolean(row.collab),
      })) satisfies SharedPlaylist[];
    } catch {
      return [] as SharedPlaylist[];
    }
  });
