import { source, artist, asset, track, album } from "../operations/cte";
import type { ArtistBase, Artist } from "@amadeus-music/protocol";
import { pushArtists } from "../operations/push";
import { sanitize } from "../operations/utils";
import { groupJSON, json } from "crstore";
import type { DB } from "../data/schema";

export const artists = ({ replicated }: DB) =>
  replicated(
    (db) =>
      db
        .with("source", source)
        .with("asset", asset)
        .with("artist", artist)
        .with("album", album)
        .with("track", track)
        .selectFrom("artist")
        .leftJoin("attribution", "attribution.artist", "artist.id")
        .leftJoin("albums", "albums.id", "attribution.album")
        .leftJoin("tracks", "tracks.album", "albums.id")
        .leftJoin("track", "track.id", "tracks.id")
        .select([
          "artist.id",
          "artist.title",
          "artist.following",
          "artist.arts",
          "artist.thumbnails",
          "artist.sources",
          (qb) =>
            json(qb, {
              tracks: groupJSON(qb, {
                duration: "track.duration",
                artists: "track.artists",
                sources: "track.sources",
                title: "track.title",
                album: "track.album",
                entry: "track.id",
                id: "track.id",
              }).filterWhere("track.id", "is not", null),
              duration: qb.fn.coalesce(
                qb.fn.sum<number>("track.duration"),
                qb.val(0),
              ),
              size: qb.fn.count<number>("track.duration"),
            }).as("collection"),
        ])
        .groupBy("artist.id")
        .orderBy((qb) => qb.fn.count("track.duration"), "desc")
        .orderBy("artist.title")
        .$castTo<Artist & { collection: { tracks: { entry: number }[] } }>(),
    {
      async search(db, query: string, limit = 10, offset = 0) {
        if (!query) return [];
        return db
          .with("source", source)
          .with("asset", asset)
          .with("artist", artist)
          .selectFrom("artists_fts" as any)
          .where("artists_fts", "match", sanitize(query))
          .orderBy("rank")
          .innerJoin("artist", "artist.id", "artists_fts.rowid")
          .selectAll()
          .limit(limit)
          .offset(offset)
          .$castTo<Artist>()
          .execute();
      },
      get(db, id: number) {
        return db
          .with("source", source)
          .with("asset", asset)
          .with("artist", artist)
          .selectFrom("artist")
          .where("artist.id", "=", id)
          .selectAll()
          .$castTo<Artist>()
          .executeTakeFirstOrThrow();
      },
      async unfollow(db, id: number) {
        await db
          .updateTable("artists")
          .set({ following: 0 })
          .where("id", "=", id)
          .execute();
      },
      async follow(db, id: number) {
        await db
          .updateTable("artists")
          .set({ following: 1 })
          .where("id", "=", id)
          .execute();
      },
      async edit(db, id: number, artist: Partial<ArtistBase>) {
        await db.updateTable("artists").where("id", "=", id).set(artist);
      },
      async push(db, artists: Artist[]) {
        await pushArtists(db, artists);
      },
    },
  );
