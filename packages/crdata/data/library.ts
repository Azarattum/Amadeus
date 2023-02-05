import { database, json, jsonGroup } from "crstore";
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
          "tracks.id as id",
          "library.id as entry",
          "playlists.id as group",
          "playlists.title as playlist",
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
          jsonGroup(qb, {
            id: "artists.id",
            title: "artists.title",
            source: "artists.source",
            art: "artists.art",
          }).as("artists")
        )
        .groupBy("library.id")
        .orderBy("library.order")
        .orderBy("library.id")
        .as("data")
    )
    .select([
      "group as id",
      "playlist",
      (qb) =>
        jsonGroup(qb, {
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
    .groupBy("group")
);

const artists = store((db) => db.selectFrom("artists").selectAll());

export { playlists, artists, update };
