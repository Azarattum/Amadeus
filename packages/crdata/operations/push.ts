import type { MediaBase, Track, Album, Artist } from "@amadeus-music/protocol";
import type { Schema } from "../data/schema";
import { Kysely, sql } from "crstore";

async function pushTrack(db: Kysely<Schema>, track: Track) {
  await pushAlbum(db, { ...track.album, artists: track.artists });
  await db
    .insertInto("tracks")
    .onConflict((x) =>
      x.doUpdateSet({
        title: track.title,
        duration: track.duration,
      })
    )
    .values({
      id: track.id,
      title: track.title,
      duration: track.duration,
      album: track.album.id,
    })
    .execute();
  await pushResource(db, track, track.id);
}

async function pushAlbum(db: Kysely<Schema>, album: Album) {
  for (const artist of album.artists) await pushArtist(db, artist);
  if (album.artists.length) {
    await db
      .insertInto("attribution")
      .onConflict((x) => x.doNothing())
      .values(
        album.artists.map(({ id }) => ({
          album: album.id,
          artist: id,
        }))
      )
      .execute();
  }
  await db
    .insertInto("albums")
    .onConflict((x) =>
      x.doUpdateSet({ id: album.id, title: album.title, year: album.year })
    )
    .values({ id: album.id, title: album.title, year: album.year })
    .execute();
  await pushResource(db, album, album.id);
}

async function pushArtist(db: Kysely<Schema>, artist: Artist) {
  await db
    .insertInto("artists")
    .onConflict((x) => x.doUpdateSet({ id: artist.id, title: artist.title }))
    .values({ id: artist.id, title: artist.title, following: 0 })
    .execute();
  await pushResource(db, artist, artist.id);
}

async function pushResource(
  db: Kysely<Schema>,
  resource: MediaBase,
  owner: number
) {
  if (resource.sources.length) {
    await db
      .insertInto("sources")
      .onConflict((x) => x.doNothing())
      .values(
        resource.sources.map((source, i) => ({
          owner,
          source,
          primary:
            +!i &&
            sql`NOT EXISTS (SELECT 1 FROM sources WHERE owner = ${owner} AND "primary" = 1)`,
        }))
      )
      .execute();
  }
  if (!resource.arts?.length) return;
  const primaryAsset =
    resource.arts?.find((_, i) => !!resource.thumbnails?.[i]) ||
    resource.arts[0];
  await db
    .insertInto("assets")
    .onConflict((x) => x.doNothing())
    .values(
      resource.arts.map((art, i) => ({
        owner,
        art,
        thumbnail: resource.thumbnails?.[i],
        primary:
          +(art === primaryAsset) &&
          sql`NOT EXISTS (SELECT 1 FROM assets WHERE owner = ${owner} AND "primary" = 1)`,
      }))
    )
    .execute();
}

export { pushTrack, pushAlbum, pushArtist, pushResource };
