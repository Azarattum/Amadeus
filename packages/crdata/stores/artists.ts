import { metadata, metafields, sanitize } from "../data/operations";
import type { Artist } from "@amadeus-music/protocol";
import type { DB } from "../data/schema";
import { groupJSON, sql } from "crstore";

export const artists = ({ store }: DB) =>
  store(
    (db) =>
      db
        .with("metadata", metadata)
        .selectFrom((qb) =>
          qb
            .selectFrom("artists")
            .leftJoin("attribution", "attribution.artist", "artists.id")
            .leftJoin("albums", "albums.id", "attribution.album")
            .leftJoin("tracks", "tracks.album", "albums.id")
            .innerJoin("metadata", "metadata.id", "tracks.id")
            .select(metafields)
            .select([
              "metadata.id as entry",
              "artists.title as artist",
              "artists.source as src",
              "artists.id as group",
              "artists.following",
              "artists.art",
              (qb) =>
                qb.fn
                  .count<number>("metadata.length")
                  .over((qb) => qb.partitionBy("artists.id"))
                  .as("count"),
              (qb) =>
                qb.fn
                  .sum<number>("metadata.length")
                  .over((qb) => qb.partitionBy("artists.id"))
                  .as("duration"),
            ])
            .orderBy("tracks.title")
            .as("grouped")
        )
        .select([
          "group as id",
          "artist as title",
          "following",
          "src as source",
          "art",
          (qb) =>
            groupJSON(qb, {
              id: "id",
              entry: "entry",
              title: "title",
              length: "length",
              source: "source",
              album: "album",
              artists: "artists",
            }).as("tracks"),
          (qb) => qb.fn.coalesce("duration", sql.lit(0)).as("length"),
          (qb) => qb.fn.coalesce("count", sql.lit(0)).as("count"),
        ])
        .groupBy("group")
        .orderBy("count", "desc")
        .orderBy("artist"),
    {
      async edit(db, id: number, artist: Partial<Artist>) {
        await db.updateTable("artists").where("id", "=", id).set(artist);
      },
      async follow(db, id: number) {
        await db
          .updateTable("artists")
          .set({ following: 1 })
          .where("id", "=", id)
          .execute();
      },
      async unfollow(db, id: number) {
        await db
          .updateTable("artists")
          .set({ following: 0 })
          .where("id", "=", id)
          .execute();
      },
      async search(db, query: string) {
        if (!query) return [];
        return db
          .selectFrom("artists_fts" as any)
          .where("artists_fts", "match", sanitize(query))
          .orderBy("rank")
          .innerJoin("artists", "artists.id", "artists_fts.rowid")
          .select(["id", "artists.title", "following", "source", "art"])
          .execute();
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
