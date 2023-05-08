import { metadata, metafields, sanitize } from "../data/operations";
import type { Album, Track } from "@amadeus-music/protocol";
import type { DB } from "../data/schema";

export const tracks = ({ store }: DB) =>
  store((db) => db.selectFrom("tracks").selectAll(), {
    async edit(db, id: number, track: Partial<Track & { album: Album }>) {
      const result = await db
        .updateTable("tracks")
        .where("id", "=", id)
        .set({ ...track, album: undefined })
        .returning("album")
        .executeTakeFirst();
      if (result?.album && track.album) {
        await db
          .updateTable("albums")
          .where("id", "=", result.album)
          .set(track.album)
          .execute();
      }
    },
    async search(db, query: string) {
      if (!query) return [];
      return db
        .with("metadata", metadata)
        .selectFrom("tracks_fts" as any)
        .where("tracks_fts", "match", sanitize(query))
        .orderBy("rank")
        .innerJoin("metadata", "metadata.id", "rowid")
        .select(metafields)
        .execute();
    },
    get(db, id: number) {
      return db
        .with("metadata", metadata)
        .selectFrom("metadata")
        .select(metafields)
        .where("id", "=", id)
        .executeTakeFirstOrThrow();
    },
  });
