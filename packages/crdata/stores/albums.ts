import type { AlbumDetails } from "@amadeus-music/protocol";
import { pushAlbum, sanitize } from "../data/operations";
import type { DB } from "../data/schema";
import { groupJSON } from "crstore";

export const albums = ({ store }: DB) =>
  store(
    (db) =>
      db
        .selectFrom("albums")
        .innerJoin("attribution", "attribution.album", "albums.id")
        .innerJoin("artists", "artists.id", "attribution.artist")
        .select([
          "albums.id",
          "albums.title",
          "albums.year",
          "albums.source",
          "albums.art",
          (qb) =>
            groupJSON(qb, {
              id: "artists.id",
              art: "artists.art",
              title: "artists.title",
              source: "artists.source",
            }).as("artists"),
        ])
        .groupBy("albums.id")
        .orderBy("albums.title"),
    {
      async push(db, albums: AlbumDetails[]) {
        await Promise.all(albums.map((x) => pushAlbum(db, x)));
      },
      async search(db, query: string) {
        if (!query) return [];
        return db
          .selectFrom("albums_fts" as any)
          .where("albums_fts", "match", sanitize(query))
          .orderBy("rank")
          .innerJoin("albums", "albums.id", "albums_fts.rowid")
          .innerJoin("attribution", "attribution.album", "albums.id")
          .innerJoin("artists", "artists.id", "attribution.artist")
          .select([
            "albums.id",
            "albums.title",
            "albums.year",
            "albums.source",
            "albums.art",
            (qb) =>
              groupJSON(qb, {
                id: "artists.id",
                art: "artists.art",
                title: "artists.title",
                source: "artists.source",
              }).as("artists"),
          ])
          .groupBy("albums.id")
          .execute();
      },
      get(db, id: number) {
        return db
          .selectFrom("albums")
          .where("albums.id", "=", id)
          .selectAll()
          .executeTakeFirstOrThrow();
      },
    }
  );
