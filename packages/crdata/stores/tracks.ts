import type { Album, Track } from "@amadeus-music/protocol";
import { groupJSON, json } from "crstore";
import type { DB } from "../data/schema";

export const tracks = ({ store }: DB) =>
  store((db) => db.selectFrom("tracks").selectAll(), {
    async edit(db, id: number, track: Partial<Track & { album: Album }>) {
      const result = await db
        .updateTable("tracks")
        .where("id", "=", id)
        .set({ ...track, album: undefined })
        .returning("album")
        .executeTakeFirst();
      if (result?.album && track.album) {
        await db
          .updateTable("albums")
          .where("id", "=", result.album)
          .set(track.album)
          .execute();
      }
    },
    get(db, id: number) {
      return db
        .selectFrom("tracks")
        .innerJoin("albums", "albums.id", "tracks.album")
        .innerJoin("attribution", "attribution.track", "tracks.id")
        .innerJoin("artists", "artists.id", "attribution.artist")
        .where("tracks.id", "=", id)
        .select([
          "tracks.id as id",
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
        .groupBy("tracks.id")
        .executeTakeFirstOrThrow();
    },
  });
