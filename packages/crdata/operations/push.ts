import type { MediaBase, Artist, Track, Album } from "@amadeus-music/protocol";
import type { Schema } from "../data/schema";
import { Kysely, sql } from "crstore";

async function pushTracks(db: Kysely<Schema>, tracks: Track[]) {
  if (!tracks.length) return;
  await pushAlbums(
    db,
    tracks.map((x) => ({ ...x.album, artists: x.artists })),
  );
  await db
    .insertInto("tracks")
    .onConflict((x) => x.doNothing())
    .values(
      tracks.map((x) => ({
        duration: x.duration,
        album: x.album.id,
        title: x.title,
        id: x.id,
      })),
    )
    .execute();
  await pushResources(db, tracks);
}

async function pushAlbums(db: Kysely<Schema>, albums: Album[]) {
  if (!albums.length) return;
  await pushArtists(
    db,
    albums.flatMap((x) => x.artists),
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
          })),
        ),
      )
      .execute();
  }
  await db
    .insertInto("albums")
    .onConflict((x) => x.doNothing())
    .values(
      albums.map((x) => ({
        title: x.title,
        year: x.year,
        id: x.id,
      })),
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
        title: artist.title,
        id: artist.id,
        following: 0,
      })),
    )
    .execute();
  await pushResources(db, artists);
}

async function pushResources(
  db: Kysely<Schema>,
  resources: (MediaBase & { id: number })[],
) {
  if (!resources.length) return;
  if (resources.find((x) => x.sources.length)) {
    await db
      .insertInto("sources")
      .onConflict((x) => x.doNothing())
      .values(
        resources.flatMap(({ sources, id }) =>
          sources.map((source, i) => ({
            primary:
              +!i &&
              sql`NOT EXISTS (SELECT 1 FROM sources WHERE owner = ${id} AND "primary" = 1)`,
            owner: id,
            source,
          })),
        ),
      )
      .execute();
  }
  if (!resources.find((x) => x.arts?.length)) return;

  await db
    .insertInto("assets")
    .onConflict((x) => x.doNothing())
    .values(
      resources.flatMap(({ thumbnails, arts, id }) => {
        if (!arts) return [];
        const primaryAsset = arts.find((_, i) => !!thumbnails?.[i]) || arts[0];
        return arts.map((art, i) => ({
          primary:
            +(art === primaryAsset) &&
            sql`NOT EXISTS (SELECT 1 FROM assets WHERE owner = ${id} AND "primary" = 1)`,
          thumbnail: thumbnails?.[i],
          owner: id,
          art,
        }));
      }),
    )
    .execute();
}

export { pushResources, pushArtists, pushTracks, pushAlbums };
