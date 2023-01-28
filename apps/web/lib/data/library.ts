import { database, json } from "crstore";
import { schema } from "./schema";

const { store, update } = database(schema, { name: "library.db" });

const playlists = store((db) =>
  db
    .selectFrom((db) =>
      db
        .selectFrom("playlists")
        .innerJoin("library", "library.playlist", "playlists.id")
        .innerJoin("tracks", "tracks.id", "library.track")
        .innerJoin("albums", "albums.id", "tracks.album")
        .innerJoin("catalogue", "catalogue.album", "albums.id")
        .innerJoin("artists", "artists.id", "catalogue.artist")
        .select([
          "playlists.title as playlist",
          "library.order as order",
          "library.id as key",
          "tracks.id as id",
          "tracks.title as title",
          "tracks.length as length",
          "albums.title as album", /// album should have a source
          "albums.year as year", /// guess it makes sense to put year in the album...
          (qb) =>
            json(qb, {
              title: "artists.title",
            }).as("artists"),
        ])
        .groupBy("key")
        .orderBy("order")
        .as("data")
    )
    .select([
      "playlist",
      (qb) =>
        json(qb, {
          key: "key",
          order: "order",
          id: "id",
          title: "title",
          length: "length",
          album: "album",
          year: "year",
          artists: "artists",
        }).as("tracks"),
    ])
    .groupBy("playlist")
);

export { playlists, update };
