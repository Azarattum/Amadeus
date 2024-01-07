import { source, asset, artist, album, track } from "../operations/cte";
import type { Feed, Playlist } from "@amadeus-music/protocol";
import { groupJSON, json } from "crstore";
import type { DB } from "../data/schema";

export const feed = ({ replicated }: DB) =>
  replicated(
    (db) =>
      db
        .with("source", source)
        .with("asset", asset)
        .with("artist", artist)
        .with("album", album)
        .with("track", (qb) =>
          track(qb)
            .innerJoin("library", "library.track", "tracks.id")
            .select(["library.playlist", "library.id as entry"])
            .orderBy("library.order")
            .orderBy("library.id"),
        )
        .selectFrom("track")
        .fullJoin("playlists", "playlists.id", "track.playlist")
        .where("playlists.id", "<", 0)
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
                qb.val(0),
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
      async clear(db, type: Feed) {
        await db.deleteFrom("library").where("playlist", "=", type).execute();
      },
      async get(db, type: Feed, limit = -1) {
        return db
          .selectFrom("library")
          .where("playlist", "=", type)
          .select("id")
          .limit(limit)
          .execute()
          .then((x) => x.map((y) => y.id as number));
      },
    },
  );
