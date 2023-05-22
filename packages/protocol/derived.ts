import {
  mediaBase,
  trackBase,
  albumBase,
  artistBase,
  playlistBase,
  collectionBase,
} from "./base";
import {
  array,
  assign,
  literal,
  number,
  object,
  omit,
  optional,
  union,
} from "superstruct";
import type { Infer } from "superstruct";
import { unique } from "./modifiers";

// ======================== Info ========================
const artistInfo = assign(artistBase, mediaBase);
const albumInfo = assign(
  albumBase,
  assign(mediaBase, object({ artists: array(artistInfo) }))
);
const trackInfo = assign(
  trackBase,
  assign(
    omit(mediaBase, ["arts", "thumbnails"]),
    object({ album: omit(albumInfo, ["artists"]), artists: array(artistInfo) })
  )
);
const playlistInfo = playlistBase;

// ======================== Main ========================
const track = assign(
  unique(trackInfo),
  object({
    entry: optional(number()),
    album: unique(trackInfo.schema.album),
    artists: array(unique(trackInfo.schema.artists.schema)),
  })
);
const album = assign(
  unique(albumInfo),
  object({
    artists: array(unique(albumInfo.schema.artists.schema)),
    collection: optional(collectionBase(track)),
  })
);
const artist = assign(
  unique(artistInfo),
  object({
    following: optional(union([literal(0), literal(1)])),
    collection: optional(collectionBase(track)),
  })
);
const playlist = assign(
  unique(playlistInfo),
  object({ collection: optional(collectionBase(track)) })
);

// ======================= Types ========================
type PlaybackPush = "first" | "next" | "last" | "random" | number;
type PlaybackDirection = "forward" | "backward" | "shuffled";
type PlaybackRepeat = "none" | "single" | "all";
type MediaType = "track" | "album" | "artist";
type CollectionType = "album" | "artist" | "playlist";
type FeedType = "listened" | "recommended" | "following";

type TrackInfo = Infer<typeof trackInfo>;
type AlbumInfo = Infer<typeof albumInfo>;
type ArtistInfo = Infer<typeof artistInfo>;
type PlaylistInfo = Infer<typeof playlistInfo>;
type MediaInfo = TrackInfo | AlbumInfo | ArtistInfo;
type CollectionInfo = AlbumInfo | ArtistInfo | PlaylistInfo;

type Track = Infer<typeof track>;
type Album = Infer<typeof album>;
type Artist = Infer<typeof artist>;
type Playlist = Infer<typeof playlist>;
type Media = Track | Album | Artist;
type Collection = Album | Artist | Playlist;

type FromType<T extends MediaType> = T extends "track"
  ? Track
  : T extends "artist"
  ? Artist
  : T extends "album"
  ? Album
  : never;

type FromInfo<T extends MediaInfo> = T extends TrackInfo
  ? Track
  : T extends AlbumInfo
  ? Album
  : T extends ArtistInfo
  ? Artist
  : never;

type ToInfo<T extends MediaInfo> = T extends Track
  ? TrackInfo
  : T extends Album
  ? AlbumInfo
  : T extends Artist
  ? ArtistInfo
  : never;

export { trackInfo, albumInfo, artistInfo, playlistInfo };
export { track, album, artist, playlist };

export type { Track, Album, Artist, Playlist, Media, Collection };
export type { FromType, FromInfo, ToInfo };
export type {
  PlaybackDirection,
  PlaybackRepeat,
  PlaybackPush,
  CollectionType,
  MediaType,
  FeedType,
};
export type {
  TrackInfo,
  AlbumInfo,
  ArtistInfo,
  PlaylistInfo,
  CollectionInfo,
  MediaInfo,
};
