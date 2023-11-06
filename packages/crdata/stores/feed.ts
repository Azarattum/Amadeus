import { source, artist, asset, album, track } from "../operations/cte";
import type { Playlist, Feed } from "@amadeus-music/protocol";
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
              tracks: groupJSON(qb, {
                duration: "track.duration",
                artists: "track.artists",
                sources: "track.sources",
                entry: "track.entry",
                title: "track.title",
                album: "track.album",
                id: "track.id",
              }).filterWhere("track.id", "is not", null),
              duration: qb.fn.coalesce(
                qb.fn.sum<number>("track.duration"),
                qb.val(0),
              ),
              size: qb.fn.count<number>("track.duration"),
            }).as("collection"),
        ])
        .groupBy("playlists.id")
        .orderBy("playlists.order")
        .orderBy("playlists.id")
        .$castTo<{ collection: { tracks: { entry: number }[] } } & Playlist>(),
    {
      async get(db, type: Feed, limit = -1) {
        return db
          .selectFrom("library")
          .where("playlist", "=", type)
          .select("id")
          .limit(limit)
          .execute()
          .then((x) => x.map((y) => y.id as number));
      },
      async clear(db, type: Feed, before = Number.MAX_SAFE_INTEGER) {
        await db
          .deleteFrom("library")
          .where("playlist", "=", type)
          .where("date", "<=", before)
          .execute();
      },
    },
  );
