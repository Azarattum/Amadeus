import { type TrackDetails } from "@amadeus-music/protocol";
import type { DB } from "../data/schema";
import { APPEND } from "crstore";

const uuid = () => (Math.random() * 2 ** 32) >>> 0;

export const library = ({ store }: DB) =>
  store((db) => db.selectFrom("library").selectAll(), {
    async push(db, tracks: TrackDetails[], playlist?: number) {
      const promises = tracks.map(async (track) => {
        await db
          .insertInto("albums")
          .onConflict((x) => x.doUpdateSet(track.album))
          .values(track.album)
          .execute();
        for (const artist of track.artists) {
          await db
            .insertInto("artists")
            .onConflict((x) => x.doUpdateSet(artist))
            .values(artist)
            .execute();
        }
        await db
          .insertInto("tracks")
          .onConflict((x) =>
            x.doUpdateSet({
              title: track.title,
              length: track.length,
              source: track.source,
            })
          )
          .values({
            id: track.id,
            title: track.title,
            length: track.length,
            source: track.source,
            album: track.album.id,
          })
          .execute();
        await db
          .insertInto("attribution")
          .onConflict((x) => x.doNothing())
          .values(
            track.artists.map(({ id }) => ({
              track: track.id,
              artist: id,
            }))
          )
          .execute();
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
