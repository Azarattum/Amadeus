import { album, artist, source, asset, track } from "../operations/cte";
import type { Track } from "@amadeus-music/protocol";
import { pushTracks } from "../operations/push";
import { uuid } from "../operations/utils";
import type { DB } from "../data/schema";
import { APPEND } from "crstore";

export const library = ({ store }: DB) =>
  store((db) => db.selectFrom("library").selectAll(), {
    async push(db, tracks: Track[], playlist?: number) {
      await pushTracks(db, tracks);
      if (playlist == null) return;
      await db
        .insertInto("library")
        .onConflict((x) => x.doNothing())
        .values(
          tracks.map(({ id }) => ({
            id: uuid(),
            order: APPEND,
            date: ~~(Date.now() / 1000),
            track: id,
            playlist,
          }))
        )
        .execute();
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
        .with("source", source)
        .with("asset", asset)
        .with("artist", artist)
        .with("album", album)
        .with("track", track)
        .selectFrom("library")
        .innerJoin("track", "track.id", "library.track")
        .select([
          "track.id",
          "track.title",
          "track.duration",
          "track.album",
          "track.artists",
          "track.sources",
          "library.id as entry",
        ])
        .where("library.id", "in", entries)
        .$castTo<Track & { entry: number }>()
        .execute();
    },
  });
