import type { ExpressionBuilder, Kysely, QueryCreator } from "crstore";
import type { TrackDetails } from "@amadeus-music/protocol";
import { groupJSON, json, sql } from "crstore";
import type { Schema } from "./schema";

const uuid = () => (Math.random() * 2 ** 32) >>> 0;
const localDevice = sql<Uint8Array>`crsql_siteid()`;

const metadata = (qc: QueryCreator<Schema>) =>
  qc
    .selectFrom("tracks")
    .leftJoin("albums", "albums.id", "tracks.album")
    .leftJoin("attribution", "attribution.track", "tracks.id")
    .leftJoin("artists", "artists.id", "attribution.artist")
    .select([
      "tracks.id as id",
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
    .groupBy("tracks.id")
    .$castTo<TrackDetails>();

const metafields = [
  "metadata.id",
  "metadata.title",
  "metadata.length",
  "metadata.source",
  "metadata.album",
  "metadata.artists",
] as const;

const position = {
  first: null,
  before: (qb: ExpressionBuilder<Schema, "playback">) =>
    qb.selectFrom("queue").select("id").where("position", "=", 1).limit(1),
  shift: (id: number) => (qb: ExpressionBuilder<Schema, "playback">) =>
    qb
      .selectFrom("queue")
      .select("id")
      .whereRef(
        (qb) =>
          qb
            .selectFrom("queue")
            .select(sql`position + 1`.as("position"))
            .where("id", "=", id),
        "=",
        "position"
      )
      .limit(1),
  next: (qb: ExpressionBuilder<Schema, "playback">) =>
    qb
      .selectFrom("devices")
      .select("playback")
      .where("id", "=", localDevice)
      .limit(1),
  last: (qb: ExpressionBuilder<Schema, "playback">) =>
    qb
      .selectFrom("playback")
      .select("id")
      .where("device", "=", localDevice)
      .orderBy("order", "desc")
      .orderBy("id", "desc")
      .limit(1),
  random: (ids: number[]) => (qb: ExpressionBuilder<Schema, "playback">) =>
    qb
      .selectFrom((qb) =>
        qb
          .selectFrom("queue")
          .select(["id", "position"])
          .$if(!!ids.length, (qb) =>
            qb.unionAll(
              sql`VALUES ${sql.raw(ids.map((x) => `(${x}, 1)`).join(","))}`
            )
          )
          .unionAll(
            sql`SELECT null,1 WHERE NOT EXISTS (SELECT 1 FROM queue WHERE position >= 0)`
          )
          .as("data")
      )
      .select("id")
      .where("position", ">=", 0)
      .orderBy(sql`random()`)
      .limit(1),
};

async function push(db: Kysely<Schema>, track: TrackDetails) {
  await db
    .insertInto("albums")
    .onConflict((x) => x.doUpdateSet(track.album))
    .values(track.album)
    .execute();
  for (const artist of track.artists) {
    await db
      .insertInto("artists")
      .onConflict((x) => x.doUpdateSet(artist))
      .values(artist)
      .execute();
  }
  await db
    .insertInto("tracks")
    .onConflict((x) =>
      x.doUpdateSet({
        title: track.title,
        length: track.length,
        source: track.source,
      })
    )
    .values({
      id: track.id,
      title: track.title,
      length: track.length,
      source: track.source,
      album: track.album.id,
    })
    .execute();
  await db
    .insertInto("attribution")
    .onConflict((x) => x.doNothing())
    .values(
      track.artists.map(({ id }) => ({
        track: track.id,
        artist: id,
      }))
    )
    .execute();
}

export { uuid, push, metadata, position, metafields, localDevice };
