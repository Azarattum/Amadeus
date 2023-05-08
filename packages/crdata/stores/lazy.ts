import { metadata, metafields } from "../data/operations";
import type { DB } from "../data/schema";
import { groupJSON, sql } from "crstore";
import { writable } from "svelte/store";

export const target = writable(0);

export const playlist = ({ store }: DB) =>
  store.with(target)((db, id) =>
    db
      .with("metadata", metadata)
      .selectFrom((qb) =>
        qb
          .selectFrom("playlists")
          .leftJoin("library", "library.playlist", "playlists.id")
          .leftJoin("metadata", "metadata.id", "library.track")
          .select(metafields)
          .select([
            "library.id as entry",
            "playlists.title as playlist",
            "library.order as order",
            "playlists.id as group",
            "relevancy",
            "shared",
            "remote",
            (qb) => qb.fn.count<number>("length").over().as("count"),
            (qb) => qb.fn.sum<number>("length").over().as("duration"),
          ])
          .orderBy("library.order")
          .orderBy("library.id")
          .as("data")
      )
      .where("group", "=", id)
      .select([
        "group as id",
        "playlist as title",
        "relevancy",
        "shared",
        "remote",
        (qb) =>
          groupJSON(qb, {
            entry: "entry",
            id: "id",
            title: "title",
            length: "length",
            source: "source",
            album: "album",
            artists: "artists",
          }).as("tracks"),
        (qb) => qb.fn.coalesce("duration", sql.lit(0)).as("length"),
        (qb) => qb.fn.coalesce("count", sql.lit(0)).as("count"),
      ])
      .groupBy("group")
  );

export const artist = ({ store }: DB) =>
  store.with(target)((db, id) =>
    db
      .with("metadata", metadata)
      .selectFrom((qb) =>
        qb
          .selectFrom("artists")
          .innerJoin("attribution", "attribution.artist", "artists.id")
          .innerJoin("albums", "albums.id", "attribution.album")
          .innerJoin("tracks", "tracks.album", "albums.id")
          .innerJoin("metadata", "metadata.id", "tracks.id")
          .select(metafields)
          .select([
            "metadata.id as entry",
            "artists.title as artist",
            "artists.source as src",
            "artists.id as group",
            "artists.following",
            "artists.art",
            (qb) => qb.fn.count<number>("metadata.length").over().as("count"),
            (qb) => qb.fn.sum<number>("metadata.length").over().as("duration"),
          ])
          .orderBy("metadata.title")
          .as("data")
      )
      .where("group", "=", id)
      .select([
        "group as id",
        "artist as title",
        "following",
        "src as source",
        "art",
        (qb) =>
          groupJSON(qb, {
            entry: "entry",
            id: "id",
            title: "title",
            length: "length",
            source: "source",
            album: "album",
            artists: "artists",
          }).as("tracks"),
        (qb) => qb.fn.coalesce("duration", sql.lit(0)).as("length"),
        (qb) => qb.fn.coalesce("count", sql.lit(0)).as("count"),
      ])
      .groupBy("group")
  );
