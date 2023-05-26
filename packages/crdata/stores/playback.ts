import type {
  Track,
  PlaybackRepeat,
  PlaybackDirection,
} from "@amadeus-music/protocol";
import { source, asset, artist, album, track } from "../operations/cte";
import { uuid, localDevice, position } from "../operations/utils";
import { pushTracks } from "../operations/push";
import type { DB } from "../data/schema";
import { json, sql } from "crstore";

export const preceding = ({ store }: DB) =>
  store((db) =>
    db
      .with("source", source)
      .with("asset", asset)
      .with("artist", artist)
      .with("album", album)
      .with("track", track)
      .with("update", (qb) =>
        qb
          .selectFrom("playback") // ↓ We need this to trigger updates from `playback` & `devices`
          .select((qb) => qb.selectFrom("devices").select("id").as("_"))
      )
      .selectFrom("queue")
      .innerJoin("track", "track.id", "queue.track")
      .where("position", "<", 0)
      .select("queue.id as entry")
      .select(fields)
      .$castTo<Track & { entry: number }>()
  );

export const upcoming = ({ store }: DB) =>
  store((db) =>
    db
      .with("source", source)
      .with("asset", asset)
      .with("artist", artist)
      .with("album", album)
      .with("track", track)
      .with("update", (qb) =>
        qb
          .selectFrom("playback") // ↓ We need this to trigger updates from `playback` & `devices`
          .select((qb) => qb.selectFrom("devices").select("id").as("_"))
      )
      .selectFrom("queue")
      .innerJoin("track", "track.id", "queue.track")
      .where("position", ">", 0)
      .select("queue.id as entry")
      .select(fields)
      .$castTo<Track & { entry: number }>()
  );

export const playback = ({ store }: DB) =>
  store(
    (db) =>
      db
        .with("source", source)
        .with("asset", asset)
        .with("artist", artist)
        .with("album", album)
        .with("track", track)
        .selectFrom("devices")
        .innerJoin("playback", "playback.id", "devices.playback")
        .innerJoin("track", "track.id", "playback.track")
        .select(["direction", "repeat", "infinite", "device", "progress"])
        .select((qb) =>
          json(qb, {
            entry: "playback.id",
            id: "track.id",
            title: "track.title",
            duration: "track.duration",
            album: "track.album",
            artists: "track.artists",
            sources: "track.sources",
          }).as("track")
        )
        .select(sql<boolean>`device = crsql_siteid()`.as("local"))
        .select(fields)
        .$castTo<Playback>(),
    {
      async push(
        db,
        tracks: Track[],
        at: "first" | "next" | "last" | "random" | number = "next"
      ) {
        if (!tracks.length) return;
        await pushTracks(db, tracks);
        const { direction, playback } = await db
          .selectFrom("devices")
          .where("id", "=", localDevice)
          .select(["direction", "playback"])
          .executeTakeFirstOrThrow();

        const ids = tracks.map(uuid);
        const order =
          direction != 1
            ? Number.isInteger(at)
              ? at
              : at === "first"
              ? position.first
              : at === "next"
              ? position.next
              : position.last
            : Number.isInteger(at)
            ? position.shift(+at)
            : at === "first"
            ? position.last
            : at === "next"
            ? position.before
            : position.first;

        await db
          .insertInto("playback_fractindex" as any)
          .values(
            tracks.map((track, i) => ({
              id: ids[i],
              track: track.id,
              device: localDevice,
              after_id:
                at === "random"
                  ? position.random(ids.slice(0, i))
                  : i > 0 && direction != 1
                  ? ids[i - 1]
                  : order,
            }))
          )
          .execute();
        if (!playback && at === "random") {
          await db
            .updateTable("devices")
            .set({
              playback: (qb) =>
                qb
                  .selectFrom("queue")
                  .select("id")
                  .$castTo<{ id: number }>()
                  .limit(1),
            })
            .execute();
        }
        if (direction === 2) {
          /// TODO: update temps (+generate for at="random")
        }
      },
      async purge(db, entries: number[]) {
        if (!entries.length) return;
        await db.deleteFrom("playback").where("id", "in", entries).execute();
      },
      async clear(db, device: Uint8Array = localDevice as any) {
        await db.deleteFrom("playback").where("device", "=", device).execute();
        await db
          .updateTable("devices")
          .set({ playback: null, progress: 0 })
          .where("id", "=", device)
          .execute();
      },
      async sync(db, progress: number) {
        await db
          .updateTable("devices")
          .where("id", "=", localDevice)
          .set({ progress })
          .execute();
      },
      async rearrange(db, track: number, after: number | null = null) {
        const { direction } = await db
          .selectFrom("devices")
          .where("id", "=", localDevice)
          .select(["direction"])
          .executeTakeFirstOrThrow();

        const target =
          direction != 1
            ? after
            : after != null
            ? position.shift(after)
            : position.last;

        await db
          .updateTable("playback_fractindex" as any)
          .set({ after_id: target })
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
              .select(["id", "order", "temp", "track"])
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
              .select([
                "direction",
                "repeat",
                "infinite",
                "playback",
                "progress",
              ])
              .where("id", "=", device)
          )
          .execute();
      },
    }
  );

const fields = [
  "track.id",
  "track.title",
  "track.duration",
  "track.album",
  "track.artists",
  "track.sources",
] as const;

type Playback = {
  device: Uint8Array;
  progress: number;
  direction: 0 | 1;
  infinite: 0 | 1;
  repeat: 0 | 1;
  local: 0 | 1;
  track: Track & { entry: number };
};
