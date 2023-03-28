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
      .innerJoin("metadata", "metadata.id", "playback.track")
      .where("device", "=", localDevice)
      .where("state", ">=", 1)
      .orderBy("order", "desc")
      .orderBy("playback.id", "desc")
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
          .innerJoin("metadata", "metadata.id", "playback.track")
          .where("state", "<", 1)
          .select(["device", "state"])
          .select("playback.id as entry")
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
      .innerJoin("playback", "playback.device", "devices.id")
      .innerJoin("metadata", "metadata.id", "playback.track")
      .where("state", "<", 1)
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
      await db.deleteFrom("playback").where("id", "in", entries).execute();
    },
    async clear(db, onlyHistory?: boolean, device = localDevice) {
      if (onlyHistory) {
        await db
          .deleteFrom("playback")
          .where("device", "=", device)
          .where("state", "=", 1)
          .execute();
      } else {
        await db.deleteFrom("playback").where("device", "=", device).execute();
      }
    },
    async sync(db, progress: number) {
      await db
        .with("current", current)
        .updateTable("playback")
        .whereRef(
          (qb) => qb.selectFrom("current").select("id"),
          "=",
          "playback.id"
        )
        .set({ state: progress })
        .execute();
      if (progress != 1) return;
      // Track is complete, check what's left
      const left = await db
        .selectFrom("devices")
        .where("id", "=", localDevice)
        .where("repeat", "=", 2)
        .select([
          (qb) =>
            qb
              .selectFrom("playback")
              .where("device", "=", localDevice)
              .select((eb) => eb.fn.count("id").as("count"))
              .where("state", "!=", 1)
              .$castTo<{ count: number }>()
              .as("count"),
        ])
        .limit(1)
        .executeTakeFirst();
      if (!left || left.count) return;
      // No tracks left, repeat all is enabled
      await db
        .updateTable("playback")
        .where("device", "=", localDevice)
        .set({ state: 0 })
        .execute();
    },
    async backtrack(db) {
      await db
        .with("current", current)
        .updateTable("playback")
        .whereRef(
          (qb) => qb.selectFrom("current").select("id"),
          "=",
          "playback.id"
        )
        .orWhereRef(
          (qb) =>
            qb
              .selectFrom("playback")
              .where("device", "=", localDevice)
              .where("state", "=", 1)
              .orderBy("order", "desc")
              .orderBy("id", "desc")
              .select("id")
              .limit(1),
          "=",
          "playback.id"
        )
        .set({ state: 0 })
        .execute();
    },
    async rearrange(db, track: number, after?: number) {
      await db
        .updateTable("playback_fractindex" as any)
        .set({ after_id: after })
        .where("id", "=", track)
        .execute();
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
            temp: (qb: any) => qb.ref("order"),
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
    async replicate(db, device: Uint8Array) {
      await db
        .deleteFrom("playback")
        .where("device", "=", localDevice)
        .execute();
      await db
        .insertInto("playback")
        .expression((qb) =>
          qb
            .selectFrom("playback")
            .select(sql`${localDevice}`.as("device"))
            .select(["id", "order", "temp", "track", "state"])
            .where("device", "=", device)
        )
        .execute();
      await db.deleteFrom("devices").where("id", "=", localDevice).execute();
      await db
        .insertInto("devices")
        .expression((qb) =>
          qb
            .selectFrom("devices")
            .select(sql`${localDevice}`.as("id"))
            .select(["direction", "repeat", "infinite"])
            .where("id", "=", device)
        )
        .execute();
    },
  });
