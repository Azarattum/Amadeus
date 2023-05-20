import type { CollectionBase, FeedType, Track } from "@amadeus-music/protocol";
import { resource, artist, album, track } from "../operations/cte";
import { groupJSON, APPEND, json } from "crstore";
import { pushTrack } from "../operations/push";
import { uuid } from "../operations/utils";
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
        .with("resource", resource)
        .with("artist", artist)
        .with("album", album)
        .with("track", (qb) =>
          track(qb)
            .innerJoin("feed", "feed.track", "tracks.id")
            .select(["feed.type", "feed.id as entry"])
            .orderBy("feed.order", "desc")
            .orderBy("feed.id", "desc")
        )
        .selectFrom("track")
        .select([
          "type",
          (qb) =>
            json(qb, {
              size: qb.fn.count<number>("track.duration"),
              duration: qb.fn.coalesce(
                qb.fn.sum<number>("track.duration"),
                qb.val(0)
              ),
              tracks: groupJSON(qb, {
                id: "track.id",
                entry: "track.entry",
                title: "track.title",
                duration: "track.duration",
                album: "track.album",
                artists: "track.artists",
                sources: "track.sources",
              }).filterWhere("track.id", "is not", null),
            }).as("collection"),
        ])
        .groupBy("type")
        .orderBy("type")
        .$castTo<{ type: number; collection: CollectionBase<Track> }>(),
    {
      async clear(db, type: FeedType) {
        await db.deleteFrom("feed").where("type", "=", typeId[type]).execute();
      },
      async push(db, tracks: Track[], type: FeedType) {
        const promises = tracks.map(async (track) => {
          await pushTrack(db, track);
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
          .with("resource", resource)
          .with("artist", artist)
          .with("album", album)
          .with("track", track)
          .selectFrom("feed")
          .innerJoin("track", "track.id", "feed.track")
          .select([
            "track.id",
            "track.title",
            "track.duration",
            "track.album",
            "track.artists",
            "track.sources",
            "feed.id as entry",
          ])
          .where("feed.id", "in", entries)
          .$castTo<Track & { entry: number }>()
          .execute();
      },
    }
  );
