import { type TrackDetails } from "@amadeus-music/protocol";
import { push, uuid } from "../data/operations";
import type { DB } from "../data/schema";
import { APPEND } from "crstore";

export const library = ({ store }: DB) =>
  store((db) => db.selectFrom("library").selectAll(), {
    async push(db, tracks: TrackDetails[], playlist?: number) {
      const promises = tracks.map(async (track) => {
        await push(db, track);
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
  });
