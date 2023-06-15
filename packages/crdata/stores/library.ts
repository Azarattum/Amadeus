import { album, artist, source, asset, track } from "../operations/cte";
import type { Track } from "@amadeus-music/protocol";
import { pushTracks } from "../operations/push";
import { uuid } from "../operations/utils";
import type { DB } from "../data/schema";
import { APPEND, sql } from "crstore";

export const library = ({ store }: DB) =>
  store((db) => db.selectFrom("library").selectAll(), {
    async push(db, tracks: Track[], playlist?: number) {
      if (!tracks.length) return;
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
    async sample(db, size: number) {
      const deviation = size;
      const constant = (deviation * Math.sqrt(2 * Math.PI)) / 2;

      // Weighted random sampling based on the normal distribution
      const order = sql`POW(ABS(RANDOM()) / 9223372036854775808,
        ${constant} /
        EXP(-0.5 * POW(row_number() OVER (ORDER BY date DESC) / ${deviation},2)) *
        playlists.relevancy
      )`;

      return await db
        .with("source", source)
        .with("asset", asset)
        .with("artist", artist)
        .with("album", album)
        .with("track", track)
        .selectFrom("library")
        .innerJoin("playlists", "playlists.id", "library.playlist")
        .innerJoin("track", "track.id", "library.track")
        .select([
          "track.id",
          "track.title",
          "track.duration",
          "track.album",
          "track.artists",
          "track.sources",
        ])
        .where("relevancy", ">", 0)
        .orderBy(order, "desc")
        .limit(size)
        .execute();
    },
    async banned(db) {
      return await db
        .selectFrom("library")
        .leftJoin("playlists", "playlists.id", "library.playlist")
        .select("library.track")
        .where("relevancy", "<", 0)
        .execute()
        .then((x) => x.map((y) => y.track as number));
    },
  });
