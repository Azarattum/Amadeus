import type { Artist } from "@amadeus-music/protocol";
import type { DB } from "../data/schema";

export const artists = ({ store }: DB) =>
  store(
    (db) =>
      db
        .selectFrom("artists")
        .leftJoin("attribution", "attribution.artist", "artists.id")
        .leftJoin("tracks", "tracks.id", "attribution.track")
        .groupBy("artists.id")
        .select((qb) => qb.fn.sum<number>("length").as("length"))
        .select((qb) => qb.fn.count<number>("attribution.track").as("tracks"))
        .select([
          "artists.id",
          "artists.title",
          "artists.source",
          "artists.art",
        ])
        .orderBy("tracks", "desc")
        .orderBy("artists.title"),
    {
      async edit(db, id: number, artist: Partial<Artist>) {
        await db.updateTable("artists").where("id", "=", id).set(artist);
      },
      async follow(db, id: number) {
        await db
          .insertInto("following")
          .onConflict((x) => x.doNothing())
          .values({ artist: id, seen: null })
          .execute();
      },
      async unfollow(db, id: number) {
        await db.deleteFrom("following").where("artist", "=", id).execute();
      },
      get(db, id: number) {
        return db
          .selectFrom("artists")
          .where("artists.id", "=", id)
          .selectAll()
          .executeTakeFirstOrThrow();
      },
    }
  );
