import { metadata, metafields, pushTrack, uuid } from "../data/operations";
import type { TrackDetails } from "@amadeus-music/protocol";
import type { DB } from "../data/schema";
import { APPEND } from "crstore";

export const library = ({ store }: DB) =>
  store((db) => db.selectFrom("library").selectAll(), {
    async push(db, tracks: TrackDetails[], playlist?: number) {
      const promises = tracks.map(async (track) => {
        await pushTrack(db, track);
        if (playlist == null) return;
        await db
          .insertInto("library")
          .onConflict((x) => x.doNothing())
          .values({
            id: uuid(),
            order: APPEND,
            date: Date.now(),
            track: track.id,
            playlist,
          })
          .execute();
      });
      await Promise.all(promises);
    },
    async rearrange(db, entry: number, after?: number) {
      await db
        .updateTable("library_fractindex" as any)
        .set({ after_id: after || null })
        .where("id", "=", entry)
        .execute();
    },
    async purge(db, entries: number[]) {
      const promises = entries.map((entry) =>
        db.deleteFrom("library").where("id", "=", entry).execute()
      );
      await Promise.all(promises);
    },
    async get(db, entries: number[]) {
      if (!entries.length) return [];
      return db
        .with("metadata", metadata)
        .selectFrom("library")
        .innerJoin("metadata", "metadata.id", "library.track")
        .select(metafields)
        .where("library.id", "in", entries)
        .execute();
    },
  });
