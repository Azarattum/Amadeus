import { identify, type Playlist } from "@amadeus-music/protocol";
import { metadata, metafields } from "../data/operations";
import { APPEND, groupJSON, sql } from "crstore";
import type { DB } from "../data/schema";

export const playlists = ({ store }: DB) =>
  store(
    (db) =>
      db
        .with("metadata", metadata)
        .with("grouped", (qb) =>
          qb
            .selectFrom("playlists")
            .leftJoin("library", "library.playlist", "playlists.id")
            .innerJoin("metadata", "metadata.id", "library.track")
            .select(metafields)
            .select([
              "library.id as entry",
              "playlists.id as group",
              sql`row_number() OVER(PARTITION BY playlists.id ORDER BY library."order",library.id)`.as(
                "row"
              ),
              (qb) =>
                qb.fn
                  .count<number>("length")
                  .over((qb) => qb.partitionBy("playlists.id"))
                  .as("count"),
              (qb) =>
                qb.fn
                  .sum<number>("length")
                  .over((qb) => qb.partitionBy("playlists.id"))
                  .as("duration"),
            ])
            .orderBy("row")
        )
        .selectFrom("playlists")
        .leftJoin("grouped", "grouped.group", "playlists.id")
        .select([
          "playlists.id",
          "playlists.title",
          "playlists.relevancy",
          "playlists.shared",
          "playlists.remote",
          (qb) =>
            groupJSON(qb, {
              id: "grouped.id",
              entry: "entry",
              title: "grouped.title",
              length: "length",
              source: "source",
              album: "album",
              artists: "artists",
            }).as("tracks"),
          (qb) => qb.fn.coalesce("duration", sql.lit(0)).as("length"),
          (qb) => qb.fn.coalesce("count", sql.lit(0)).as("count"),
        ])
        .groupBy("playlists.id")
        .orderBy("playlists.order")
        .orderBy("playlists.id"),
    {
      async create(db, playlist: Partial<Playlist> & { title: string }) {
        await db
          .insertInto("playlists")
          .onConflict((x) => x.doNothing())
          .values({
            id: identify(playlist),
            order: APPEND,
            relevancy: 1,
            ...playlist,
          })
          .execute();
      },
      async edit(db, id: number, playlist: Partial<Playlist>) {
        await db
          .updateTable("playlists")
          .where("id", "=", id)
          .set(playlist)
          .execute();
      },
      async rearrange(db, id: number, after?: number) {
        await db
          .updateTable("playlists_fractindex" as any)
          .set({ after_id: after || null })
          .where("id", "=", id)
          .execute();
      },
      async delete(db, id: number) {
        await db.deleteFrom("playlists").where("id", "=", id).execute();
      },
      get(db, id: number) {
        return db
          .selectFrom("playlists")
          .selectAll()
          .where("id", "=", id)
          .executeTakeFirstOrThrow();
      },
    }
  );
