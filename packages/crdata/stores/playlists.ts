import { identify, type Playlist } from "@amadeus-music/protocol";
import { metadata, metafields } from "../data/operations";
import { groupJSON, APPEND } from "crstore";
import type { DB } from "../data/schema";

export const playlists = ({ store }: DB) =>
  store(
    (db) =>
      db
        .with("metadata", metadata)
        .selectFrom((db) =>
          db
            .selectFrom("playlists")
            .leftJoin("library", "library.playlist", "playlists.id")
            .innerJoin("metadata", "metadata.id", "library.track")
            .select(metafields)
            .select([
              "library.id as entry",
              "playlists.id as group",
              "playlists.order as order",
              "playlists.title as playlist",
              "playlists.relevancy as relevancy",
              "playlists.shared as shared",
              "playlists.remote as remote",
              "library.date as date",
            ])
            .groupBy("entry")
            .orderBy("library.order")
            .orderBy("library.id")
            .as("data")
        )
        .select([
          "group as id",
          "playlist as title",
          "relevancy",
          "shared",
          "remote",
          (qb) =>
            groupJSON(qb, {
              id: "id",
              entry: "entry",
              date: "date",
              title: "title",
              length: "length",
              source: "source",
              album: "album",
              artists: "artists",
            }).as("tracks"),
        ])
        .groupBy("group")
        .orderBy("order")
        .orderBy("group"),
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
