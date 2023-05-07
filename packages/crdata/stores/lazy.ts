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
          .innerJoin("library", "library.playlist", "playlists.id")
          .innerJoin("metadata", "metadata.id", "library.track")
          .where("playlists.id", "=", id)
          .select(metafields)
          .select("library.id as entry")
          .select([
            "playlists.title as playlist",
            "library.order as order",
            "playlists.id as group",
            "relevancy",
            "shared",
            "remote",
            (qb) =>
              qb.fn
                .count<number>("length")
                .over((qb) => qb.partitionBy("playlists.id"))
                .as("count"),
            (qb) =>
              qb.fn
                .sum<number>("length")
                .over((qb) => qb.partitionBy("playlists.id"))
                .as("duration"),
          ])
          .orderBy("library.order")
          .orderBy("library.id")
          .as("data")
      )
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
      .orderBy("order")
      .orderBy("group")
  );
