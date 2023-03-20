import type {
  TrackDetails,
  PlaybackRepeat,
  PlaybackDirection,
  PlaybackPosition,
} from "@amadeus-music/protocol";
import {
  metadata,
  current,
  push,
  uuid,
  localDevice,
  metafields,
} from "../data/operations";
import type { DB } from "../data/schema";
import { APPEND, sql } from "crstore";

export const preceding = ({ store }: DB) =>
  store((db) =>
    db
      .with("metadata", metadata)
      .selectFrom("playback")
      .leftJoin("metadata", "metadata.id", "playback.id")
      .where("device", "=", localDevice)
      .where("state", ">=", 1)
      .orderBy("order", "desc")
      .orderBy("playback.id")
      .select("playback.id as entry")
      .select(metafields)
  );

export const playing = ({ store }: DB) =>
  store((db) =>
    db
      .with("metadata", metadata)
      .selectFrom((qb) =>
        qb
          .selectFrom("playback")
          .leftJoin("metadata", "metadata.id", "playback.track")
          .where("state", "<", 1)
          .select(["device", "state"])
          .select(sql<boolean>`device = crsql_siteid()`.as("local"))
          .select(metafields)
          .orderBy("state", "desc")
          .orderBy("order")
          .orderBy("playback.id")
          .as("data")
      )
      .selectAll()
      .groupBy("device")
  );

export const upcoming = ({ store }: DB) =>
  store((db) =>
    db
      .with("metadata", metadata)
      .with("current", current)
      .selectFrom("devices")
      .leftJoin("playback", "playback.device", "devices.id")
      .leftJoin("metadata", "metadata.id", "playback.track")
      .where((qb) =>
        qb
          .where((x) => x.where("state", ">=", 0).where("direction", "=", 0))
          .orWhere((x) => x.where("state", "<", 0).where("direction", "=", 1))
          .orWhere("direction", "=", 2)
          .orWhere("repeat", "=", 2)
      )
      .whereRef(
        (qb) => qb.selectFrom("current").select("id"),
        "!=",
        "playback.id"
      )
      .select("playback.id as entry")
      .select(metafields).orderBy(sql`
        CASE WHEN "direction" = 0 THEN "state" ELSE NULL END DESC,
        CASE WHEN "direction" = 1 THEN "state" ELSE NULL END ASC,
        CASE WHEN "direction" != 1 THEN "order" ELSE NULL END ASC,
        CASE WHEN "direction" = 1 THEN "order" ELSE NULL END DESC,
        "playback"."id"
      `)
  );

export const playback = ({ store }: DB) =>
  store((db) => db.selectFrom("devices").selectAll(), {
    async push(
      db,
      tracks: TrackDetails[],
      position: PlaybackPosition = "next"
    ) {
      const promises = tracks.map(async (track) => {
        await push(db, track);
      });
      await Promise.all(promises);

      const ids = tracks.map(uuid);
      if (position === "last") {
        await db
          .insertInto("playback")
          .values(
            tracks.map((track, i) => ({
              id: ids[i],
              device: localDevice,
              track: track.id,
              /// Support all directions
              state: 0,
              order: APPEND,
              temp: null,
            }))
          )
          .execute();
      } else if (position === "next") {
        await db
          .insertInto("playback_fractindex" as any)
          .values(
            tracks.map((track, i) => ({
              id: ids[i],
              device: localDevice,
              track: track.id,
              /// Support all directions
              state: 0,
              after_id:
                i > 0
                  ? ids[i - 1]
                  : (x: typeof db) => current(x).clearSelect().select("id"),
            }))
          )
          .execute();
      }
      if (Number.isInteger(position)) {
        /// TODO
      }
    },
    async purge(db, entries: number[]) {
      /// TODO
    },
    async clear(db, onlyHistory?: boolean) {
      /// TODO
    },

    async synchronize(db, progress: number) {
      /// TODO
    },
    async play(db, track: TrackDetails) {
      /// TODO
    },
    async previous(db) {
      /// TODO
    },
    async next(db) {
      /// TODO
    },

    async rearrange(db, track: number, after?: number) {
      /// TODO
    },
    async redirect(db, direction: PlaybackDirection) {
      const directions = ["forward", "backward", "shuffled"];
      const { direction: from } = await db
        .selectFrom("devices")
        .select("direction")
        .where("id", "=", localDevice)
        .executeTakeFirstOrThrow();
      const to = directions.indexOf(direction);
      if (from === to) return;
      await db
        .updateTable("devices")
        .set({ direction: to })
        .where("id", "=", localDevice)
        .execute();

      if (to === directions.indexOf("shuffled")) {
        await db
          .with("current", current)
          .updateTable("playback")
          .where("device", "=", localDevice)
          .where("state", "<", 1)
          .whereRef(
            (qb) => qb.selectFrom("current").select("id"),
            "!=",
            "playback.id"
          )
          .set({
            order: sql`(SELECT "order" FROM current)||hex(randomblob(2))`,
            temp: (qb) => qb.ref("order"),
          })
          .execute();
      } else if (from === directions.indexOf("shuffled")) {
        await db
          .updateTable("playback")
          .where("device", "=", localDevice)
          .where("temp", "is not", null)
          .set({ order: (qb) => qb.ref("temp"), temp: null })
          .execute();
      }
    },
    async repeat(db, type: PlaybackRepeat) {
      const types = ["none", "single", "all"];
      await db
        .updateTable("devices")
        .set({ repeat: types.indexOf(type) })
        .where("id", "=", localDevice)
        .execute();
    },
    async infinite(db, toggle?: boolean) {
      await db
        .updateTable("devices")
        .set({ infinite: toggle == null ? sql`!infinite` : +toggle })
        .where("id", "=", localDevice)
        .execute();
    },
  });
