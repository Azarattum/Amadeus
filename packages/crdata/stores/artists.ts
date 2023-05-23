import { source, asset, artist, track, album } from "../operations/cte";
import type { Artist, ArtistBase } from "@amadeus-music/protocol";
import { pushArtist } from "../operations/push";
import { sanitize } from "../operations/utils";
import { json, groupJSON } from "crstore";
import type { DB } from "../data/schema";

export const artists = ({ store }: DB) =>
  store(
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
              size: qb.fn.count<number>("track.duration"),
              duration: qb.fn.coalesce(
                qb.fn.sum<number>("track.duration"),
                qb.val(0)
              ),
              tracks: groupJSON(qb, {
                id: "track.id",
                entry: "track.id",
                title: "track.title",
                duration: "track.duration",
                album: "track.album",
                artists: "track.artists",
                sources: "track.sources",
              }).filterWhere("track.id", "is not", null),
            }).as("collection"),
        ])
        .groupBy("artist.id")
        .orderBy((qb) => qb.fn.count("track.duration"), "desc")
        .orderBy("artist.title")
        .$castTo<Artist & { collection: { tracks: { entry: number }[] } }>(),
    {
      async push(db, artists: Artist[]) {
        await Promise.all(artists.map((x) => pushArtist(db, x)));
      },
      async edit(db, id: number, artist: Partial<ArtistBase>) {
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
    }
  );
