import type { Artist, Album, Track } from "@amadeus-music/protocol";
import { groupJSON, group, json } from "crstore";
import type { Schema } from "../data/schema";
import type { QueryCreator } from "crstore";

const source = (qc: QueryCreator<Schema>) =>
  qc
    .selectFrom((qb) =>
      qb
        .selectFrom("sources")
        .select(["owner", "source"])
        .orderBy("sources.primary", "desc")
        .as("ordered"),
    )
    .select(["owner", (qb) => group(qb, "source").as("sources")])
    .groupBy("owner")
    .$castTo<SourceCTE["source"]>();

const asset = (qc: QueryCreator<Schema & SourceCTE>) =>
  qc
    .selectFrom((qb) =>
      qb
        .selectFrom("assets")
        .select(["owner", "art", "thumbnail"])
        .orderBy("assets.primary", "desc")
        .as("ordered"),
    )
    .select([
      "owner",
      (qb) => group(qb, "art").as("arts"),
      (qb) => group(qb, "thumbnail").as("thumbnails"),
    ])
    .groupBy("owner")
    .$castTo<AssetCTE["asset"]>();

const artist = (qc: QueryCreator<Schema & ResourceCTE>) =>
  qc
    .selectFrom("artists")
    .leftJoin("source", "source.owner", "artists.id")
    .leftJoin("asset", "asset.owner", "artists.id")
    .select([
      "artists.id",
      "artists.title",
      "artists.following",
      (qb) => qb.fn.coalesce("asset.arts", qb.val("[]")).as("arts"),
      (qb) => qb.fn.coalesce("asset.thumbnails", qb.val("[]")).as("thumbnails"),
      (qb) => qb.fn.coalesce("source.sources", qb.val("[]")).as("sources"),
    ])
    .$castTo<ArtistCTE["artist"]>();

const album = (qc: QueryCreator<Schema & ResourceCTE & ArtistCTE>) =>
  qc
    .selectFrom("albums")
    .leftJoin("source", "source.owner", "albums.id")
    .leftJoin("asset", "asset.owner", "albums.id")
    .leftJoin("attribution", "attribution.album", "albums.id")
    .innerJoin("artist", "artist.id", "attribution.artist")
    .select([
      "albums.id",
      "albums.title",
      "albums.year",
      (qb) => qb.fn.coalesce("asset.arts", qb.val("[]")).as("arts"),
      (qb) => qb.fn.coalesce("asset.thumbnails", qb.val("[]")).as("thumbnails"),
      (qb) => qb.fn.coalesce("source.sources", qb.val("[]")).as("sources"),
      (qb) =>
        groupJSON(qb, {
          thumbnails: "artist.thumbnails",
          sources: "artist.sources",
          title: "artist.title",
          arts: "artist.arts",
          id: "artist.id",
        })
          .filterWhere("artist.id", "is not", null)
          .as("artists"),
    ])
    .groupBy("albums.id")
    .$castTo<AlbumCTE["album"]>();

const track = (qc: QueryCreator<Schema & ResourceCTE & ArtistCTE & AlbumCTE>) =>
  qc
    .selectFrom("tracks")
    .leftJoin("source", "source.owner", "tracks.id")
    .innerJoin("album", "album.id", "tracks.album")
    .select([
      "tracks.id",
      "tracks.title",
      "tracks.duration",
      "album.artists",
      (qb) => qb.fn.coalesce("source.sources", qb.val("[]")).as("sources"),
      (qb) =>
        json(qb, {
          thumbnails: "album.thumbnails",
          sources: "album.sources",
          title: "album.title",
          year: "album.year",
          arts: "album.arts",
          id: "album.id",
        }).as("album"),
    ])
    .$castTo<TrackCTE["track"]>();

type AssetCTE = {
  asset: { thumbnails: string[]; arts: string[]; owner: number };
};
type SourceCTE = { source: { sources: string[]; owner: number } };
type ResourceCTE = AssetCTE & SourceCTE;
type ArtistCTE = { artist: Omit<Artist, "collection"> };
type AlbumCTE = { album: Omit<Album, "collection"> };
type TrackCTE = { track: Omit<Track, "entry"> };

export { source, artist, asset, album, track };
