import type { Album, Artist, MediaBase, Track } from "@amadeus-music/protocol";
import { group, json, groupJSON } from "crstore";
import type { Schema } from "../data/schema";
import type { QueryCreator } from "crstore";

const resource = (qc: QueryCreator<Schema>) =>
  qc
    .selectFrom((qb) =>
      qb
        .selectFrom("sources")
        .fullJoin("assets", "assets.owner", "sources.owner")
        .select([
          (qb) => qb.fn.coalesce("sources.owner", "assets.owner").as("owner"),
          "source",
          "art",
          "thumbnail",
        ])
        .orderBy("assets.primary", "desc")
        .orderBy("sources.primary", "desc")
        .as("resource")
    )
    .select([
      "owner",
      (qb) =>
        group(qb, "source")
          .distinct()
          .filterWhere("source", "is not", null)
          .as("sources"),
      (qb) =>
        group(qb, "art")
          .distinct()
          .filterWhere("art", "is not", null)
          .as("arts"),
      (qb) => group(qb, "thumbnail").distinct().as("thumbnails"),
    ])
    .groupBy("owner")
    .$castTo<ResourceCTE["resource"]>();

const artist = (qc: QueryCreator<Schema & ResourceCTE>) =>
  qc
    .selectFrom("artists")
    .leftJoin("resource", "resource.owner", "artists.id")
    .select([
      "artists.id",
      "artists.title",
      "artists.following",
      (qb) => qb.fn.coalesce("resource.arts", qb.val("[]")).as("arts"),
      (qb) =>
        qb.fn.coalesce("resource.thumbnails", qb.val("[]")).as("thumbnails"),
      (qb) => qb.fn.coalesce("resource.sources", qb.val("[]")).as("sources"),
    ])
    .$castTo<ArtistCTE["artist"]>();

const album = (qc: QueryCreator<Schema & ResourceCTE & ArtistCTE>) =>
  qc
    .selectFrom("albums")
    .leftJoin("resource", "resource.owner", "albums.id")
    .leftJoin("attribution", "attribution.album", "albums.id")
    .leftJoin("artist", "artist.id", "attribution.artist")
    .select([
      "albums.id",
      "albums.title",
      "albums.year",
      (qb) => qb.fn.coalesce("resource.arts", qb.val("[]")).as("arts"),
      (qb) =>
        qb.fn.coalesce("resource.thumbnails", qb.val("[]")).as("thumbnails"),
      (qb) => qb.fn.coalesce("resource.sources", qb.val("[]")).as("sources"),
      (qb) =>
        groupJSON(qb, {
          id: "artist.id",
          title: "artist.title",
          arts: "artist.arts",
          thumbnails: "artist.thumbnails",
          sources: "artist.sources",
        })
          .filterWhere("artist.id", "is not", null)
          .as("artists"),
    ])
    .groupBy("albums.id")
    .$castTo<AlbumCTE["album"]>();

const track = (qc: QueryCreator<Schema & ResourceCTE & ArtistCTE & AlbumCTE>) =>
  qc
    .selectFrom("tracks")
    .leftJoin("resource", "resource.owner", "tracks.id")
    .leftJoin("album", "album.id", "tracks.album")
    .select([
      "tracks.id",
      "tracks.title",
      "tracks.duration",
      "album.artists",
      (qb) => qb.fn.coalesce("resource.sources", qb.val("[]")).as("sources"),
      (qb) =>
        json(qb, {
          id: "album.id",
          title: "album.title",
          year: "album.year",
          arts: "album.arts",
          thumbnails: "album.thumbnails",
          sources: "album.sources",
        }).as("album"),
    ])
    .$castTo<TrackCTE["track"]>();

type ResourceCTE = { resource: MediaBase & { owner: number } };
type ArtistCTE = { artist: Omit<Artist, "collection"> };
type AlbumCTE = { album: Omit<Album, "collection"> };
type TrackCTE = { track: Omit<Track, "entry"> };

export { resource, artist, album, track };
