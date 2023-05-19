import { resource, artist, album, track } from "../operations/cte";
import { identify, type Playlist } from "@amadeus-music/protocol";
import { APPEND, groupJSON, json } from "crstore";
import type { DB } from "../data/schema";

export const playlists = ({ store }: DB) =>
  store(
    (db) =>
      db
        .with("resource", resource)
        .with("artist", artist)
        .with("album", album)
        .with("track", (qb) =>
          track(qb)
            .innerJoin("library", "library.track", "tracks.id")
            .select(["library.playlist", "library.id as entry"])
            .orderBy("library.order")
            .orderBy("library.id")
        )
        .selectFrom("track")
        .fullJoin("playlists", "playlists.id", "track.playlist")
        .select([
          "playlists.id",
          "playlists.title",
          "playlists.relevancy",
          "playlists.shared",
          "playlists.remote",
          (qb) =>
            json(qb, {
              size: qb.fn.count<number>("track.duration"),
              duration: qb.fn.coalesce(
                qb.fn.sum<number>("track.duration"),
                qb.val(0)
              ),
              tracks: groupJSON(qb, {
                id: "track.id",
                entry: "track.entry",
                title: "track.title",
                duration: "track.duration",
                album: "track.album",
                artists: "track.artists",
                sources: "track.sources",
              }).filterWhere("track.id", "is not", null),
            }).as("collection"),
        ])
        .groupBy("playlists.id")
        .orderBy("playlists.order")
        .orderBy("playlists.id")
        .$castTo<Playlist & { collection: { tracks: { entry: number }[] } }>(),
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
