import type { TrackDetails } from "@amadeus-music/protocol";
import type { Infer } from "superstruct";
import type { schema } from "./schema";
import type { Kysely } from "crstore";

const uuid = () => (Math.random() * 2 ** 32) >>> 0;

async function push(db: Kysely<Infer<typeof schema>>, track: TrackDetails) {
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

export { uuid, push };
