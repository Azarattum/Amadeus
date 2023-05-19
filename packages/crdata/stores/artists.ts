import { resource, artist, track, album } from "../operations/cte";
import type { Artist, ArtistBase } from "@amadeus-music/protocol";
import { pushArtist } from "../operations/push";
import { sanitize } from "../data/operations";
import { json, groupJSON } from "crstore";
import type { DB } from "../data/schema";

export const artists = ({ store }: DB) =>
  store(
    (db) =>
      db
        .with("resource", resource)
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
              }).filterWhere("tracks.id", "is not", null),
            }).as("collection"),
        ])
        .groupBy("artist.id")
        .orderBy((qb) => qb.fn.count("track.duration"), "desc")
        .orderBy("artist.title")
        .$castTo<Artist>(),
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
