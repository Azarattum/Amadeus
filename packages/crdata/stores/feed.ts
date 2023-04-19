import type { FeedType, TrackDetails } from "@amadeus-music/protocol";
import { metadata, metafields, push, uuid } from "../data/operations";
import { groupJSON, APPEND } from "crstore";
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
        .with("metadata", metadata)
        .selectFrom((db) =>
          db
            .selectFrom("feed")
            .innerJoin("metadata", "metadata.id", "feed.track")
            .select(["feed.id as entry", "feed.type as type"])
            .select(metafields)
            .orderBy("order", "desc")
            .orderBy("feed.id", "desc")
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
              order: APPEND,
            })
            .execute();
        });
        await Promise.all(promises);
      },
      async get(db, entries: number[]) {
        if (!entries.length) return [];
        return db
          .with("metadata", metadata)
          .selectFrom("feed")
          .innerJoin("metadata", "metadata.id", "feed.track")
          .select(metafields)
          .where("feed.id", "in", entries)
          .execute();
      },
    }
  );
