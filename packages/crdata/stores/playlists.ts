import { identify, Playlist } from "@amadeus-music/protocol";
import { json, groupJSON, sql } from "crstore";
import type { DB } from "../data/schema";

export const playlists = ({ store }: DB) =>
  store(
    (db) =>
      db
        .selectFrom((db) =>
          db
            .selectFrom("playlists")
            .leftJoin("library", "library.playlist", "playlists.id")
            .leftJoin("tracks", "tracks.id", "library.track")
            .leftJoin("albums", "albums.id", "tracks.album")
            .leftJoin("attribution", "attribution.track", "tracks.id")
            .leftJoin("artists", "artists.id", "attribution.artist")
            .select([
              "tracks.id as id",
              sql<number>`IFNULL(library.id,RANDOM())`.as("entry"),
              "playlists.id as group",
              "playlists.title as playlist",
              "playlists.relevancy as relevancy",
              "playlists.shared as shared",
              "playlists.remote as remote",
              "library.date as date",
              "tracks.title as title",
              "tracks.length as length",
              "tracks.source as source",
            ])
            .select((qb) =>
              json(qb, {
                id: "albums.id",
                title: "albums.title",
                year: "albums.year",
                source: "albums.source",
                art: "albums.art",
              }).as("album")
            )
            .select((qb) =>
              groupJSON(qb, {
                id: "artists.id",
                title: "artists.title",
                source: "artists.source",
                art: "artists.art",
              }).as("artists")
            )
            .groupBy("entry")
            .orderBy("library.order")
            .orderBy("library.id")
            .as("data")
        )
        .select([
          "group as id",
          "playlist",
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
        .groupBy("group"),
    {
      async create(db, playlist: Partial<Playlist> & { title: string }) {
        await db
          .insertInto("playlists")
          .onConflict((x) => x.doNothing())
          .values({
            id: identify(playlist),
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
