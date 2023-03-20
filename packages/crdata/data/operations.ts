import type { TrackDetails } from "@amadeus-music/protocol";
import type { Kysely, QueryCreator } from "crstore";
import { groupJSON, json, sql } from "crstore";
import type { Infer } from "superstruct";
import type { schema } from "./schema";

type Schema = Infer<typeof schema>;

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

const current = (qc: QueryCreator<Schema>) =>
  qc
    .selectFrom("playback")
    .where("device", "=", localDevice)
    .where("state", "<", 1)
    .orderBy("state", "desc")
    .orderBy("order")
    .orderBy("id")
    .selectAll()
    .limit(1);

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

export { uuid, push, current, metadata, metafields, localDevice };
