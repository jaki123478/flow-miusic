import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "@/lib/auth/middleware";
import { getSql } from "@/lib/db";
import type { FlowSettings } from "@/stores/flow-store";
import type { Playlist, Track } from "./types";

export type CloudLibrary = {
  liked: Track[];
  recents: Track[];
  playlists: Playlist[];
  settings: Partial<FlowSettings>;
  volume: number;
  listenMs: number;
};

export const loadLibrary = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    try {
      const sql = await getSql();
      const rows = await sql<{
        liked: Track[];
        recents: Track[];
        playlists: Playlist[];
        settings: Partial<FlowSettings>;
        volume: number;
        listen_ms: number;
      }>`
        select liked, recents, playlists, settings, volume, listen_ms
        from user_library
        where user_id = ${context.userId}
      `;
      const row = rows[0];
      if (!row) return null;
      const arr = <T,>(v: unknown): T[] => {
        if (Array.isArray(v)) return v as T[];
        if (typeof v === "string") {
          try {
            const parsed = JSON.parse(v) as T[];
            return Array.isArray(parsed) ? parsed : [];
          } catch {
            return [];
          }
        }
        return [];
      };
      const obj = (v: unknown): Partial<FlowSettings> => {
        if (v && typeof v === "object" && !Array.isArray(v)) return v as Partial<FlowSettings>;
        if (typeof v === "string") {
          try {
            return JSON.parse(v) as Partial<FlowSettings>;
          } catch {
            return {};
          }
        }
        return {};
      };
      return {
        liked: arr<Track>(row.liked),
        recents: arr<Track>(row.recents),
        playlists: arr<Playlist>(row.playlists),
        settings: obj(row.settings),
        volume: Number(row.volume) || 0.9,
        listenMs: Number(row.listen_ms) || 0,
      } satisfies CloudLibrary;
    } catch {
      return null;
    }
  });

export const saveLibrary = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((data: CloudLibrary) => data)
  .handler(async ({ context, data }) => {
    try {
      const sql = await getSql();
      const liked = JSON.stringify(data.liked ?? []);
      const recents = JSON.stringify(data.recents ?? []);
      const playlists = JSON.stringify(data.playlists ?? []);
      const settings = JSON.stringify(data.settings ?? {});
      const volume = data.volume ?? 0.9;
      const listenMs = data.listenMs ?? 0;
      await sql.query(
        `insert into user_library (user_id, liked, recents, playlists, settings, volume, listen_ms, updated_at)
         values ($1, $2::jsonb, $3::jsonb, $4::jsonb, $5::jsonb, $6, $7, now())
         on conflict (user_id) do update set
           liked = excluded.liked,
           recents = excluded.recents,
           playlists = excluded.playlists,
           settings = excluded.settings,
           volume = excluded.volume,
           listen_ms = excluded.listen_ms,
           updated_at = now()`,
        [context.userId, liked, recents, playlists, settings, volume, listenMs],
      );
    } catch {
      /* ignore */
    }
  });
