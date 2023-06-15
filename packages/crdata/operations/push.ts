import type { MediaBase, Track, Album, Artist } from "@amadeus-music/protocol";
import type { Schema } from "../data/schema";
import { Kysely, sql } from "crstore";

async function pushTracks(db: Kysely<Schema>, tracks: Track[]) {
  if (!tracks.length) return;
  await pushAlbums(
    db,
    tracks.map((x) => ({ ...x.album, artists: x.artists }))
  );
  await db
    .insertInto("tracks")
    .onConflict((x) => x.doNothing())
    .values(
      tracks.map((x) => ({
        id: x.id,
        title: x.title,
        duration: x.duration,
        album: x.album.id,
      }))
    )
    .execute();
  await pushResources(db, tracks);
}

async function pushAlbums(db: Kysely<Schema>, albums: Album[]) {
  if (!albums.length) return;
  await pushArtists(
    db,
    albums.flatMap((x) => x.artists)
  );
  if (albums.find((x) => x.artists.length)) {
    await db
      .insertInto("attribution")
      .onConflict((x) => x.doNothing())
      .values(
        albums.flatMap((x) =>
          x.artists.map(({ id }) => ({
            album: x.id,
            artist: id,
          }))
        )
      )
      .execute();
  }
  await db
    .insertInto("albums")
    .onConflict((x) => x.doNothing())
    .values(
      albums.map((x) => ({
        id: x.id,
        title: x.title,
        year: x.year,
      }))
    )
    .execute();
  await pushResources(db, albums);
}

async function pushArtists(db: Kysely<Schema>, artists: Artist[]) {
  if (!artists.length) return;
  await db
    .insertInto("artists")
    .onConflict((x) => x.doNothing())
    .values(
      artists.map((artist) => ({
        id: artist.id,
        title: artist.title,
        following: 0,
      }))
    )
    .execute();
  await pushResources(db, artists);
}

async function pushResources(
  db: Kysely<Schema>,
  resources: (MediaBase & { id: number })[]
) {
  if (!resources.length) return;
  if (resources.find((x) => x.sources.length)) {
    await db
      .insertInto("sources")
      .onConflict((x) => x.doNothing())
      .values(
        resources.flatMap(({ id, sources }) =>
          sources.map((source, i) => ({
            owner: id,
            source,
            primary:
              +!i &&
              sql`NOT EXISTS (SELECT 1 FROM sources WHERE owner = ${id} AND "primary" = 1)`,
          }))
        )
      )
      .execute();
  }
  if (!resources.find((x) => x.arts?.length)) return;

  await db
    .insertInto("assets")
    .onConflict((x) => x.doNothing())
    .values(
      resources.flatMap(({ id, arts, thumbnails }) => {
        if (!arts) return [];
        const primaryAsset = arts.find((_, i) => !!thumbnails?.[i]) || arts[0];
        return arts.map((art, i) => ({
          owner: id,
          art,
          thumbnail: thumbnails?.[i],
          primary:
            +(art === primaryAsset) &&
            sql`NOT EXISTS (SELECT 1 FROM assets WHERE owner = ${id} AND "primary" = 1)`,
        }));
      })
    )
    .execute();
}

export { pushTracks, pushAlbums, pushArtists, pushResources };
