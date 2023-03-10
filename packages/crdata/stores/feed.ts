import { FeedType, TrackDetails } from "@amadeus-music/protocol";
import { push, uuid } from "../data/operations";
import { json, groupJSON } from "crstore";
import type { DB } from "../data/schema";

const typeId = {
  listened: 0,
  recommended: 1,
  following: 2,
} as const satisfies Record<FeedType, number>;

export const feed = ({ store }: DB) =>
  store(
    (db) =>
      db
        .selectFrom((db) =>
          db
            .selectFrom("feed")
            .leftJoin("tracks", "tracks.id", "feed.track")
            .leftJoin("albums", "albums.id", "tracks.album")
            .leftJoin("attribution", "attribution.track", "tracks.id")
            .leftJoin("artists", "artists.id", "attribution.artist")
            .select([
              "tracks.id as id",
              "feed.id as entry",
              "feed.type as type",
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
            .groupBy("entry")
            .orderBy("library.order")
            .orderBy("library.id")
            .as("data")
        )
        .select([
          "type",
          (qb) =>
            groupJSON(qb, {
              id: "id",
              entry: "entry",
              title: "title",
              length: "length",
              source: "source",
              album: "album",
              artists: "artists",
            }).as("tracks"),
        ])
        .groupBy("type"),
    {
      async clear(db, type: FeedType) {
        await db.deleteFrom("feed").where("type", "=", typeId[type]).execute();
      },
      async push(db, tracks: TrackDetails[], type: FeedType) {
        const promises = tracks.map(async (track) => {
          await push(db, track);
          await db
            .insertInto("feed")
            .onConflict((x) => x.doNothing())
            .values({
              id: uuid(),
              track: track.id,
              type: typeId[type],
            })
            .execute();
        });
        await Promise.all(promises);
      },
    }
  );
