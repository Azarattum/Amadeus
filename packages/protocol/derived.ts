import {
  collectionBase,
  playlistBase,
  artistBase,
  mediaBase,
  trackBase,
  albumBase,
} from "./base";
import {
  optional,
  literal,
  assign,
  number,
  object,
  array,
  union,
  omit,
} from "superstruct";
import type { Infer } from "superstruct";
import { unique } from "./modifiers";

// ======================== Info ========================
const artistInfo = assign(artistBase, mediaBase);
const albumInfo = assign(
  albumBase,
  assign(mediaBase, object({ artists: array(artistInfo) })),
);
const trackInfo = assign(
  trackBase,
  assign(
    omit(mediaBase, ["arts", "thumbnails"]),
    object({ album: omit(albumInfo, ["artists"]), artists: array(artistInfo) }),
  ),
);
const playlistInfo = playlistBase;

// ======================== Main ========================
const track = assign(
  unique(trackInfo),
  object({
    artists: array(unique(trackInfo.schema.artists.schema)),
    album: unique(trackInfo.schema.album),
    entry: optional(number()),
  }),
);
const album = assign(
  unique(albumInfo),
  object({
    artists: array(unique(albumInfo.schema.artists.schema)),
    collection: optional(collectionBase(track)),
  }),
);
const artist = assign(
  unique(artistInfo),
  object({
    following: optional(union([literal(0), literal(1)])),
    collection: optional(collectionBase(track)),
  }),
);
const playlist = assign(
  unique(playlistInfo),
  object({ collection: optional(collectionBase(track)) }),
);

enum Feed {
  Listened = -1,
  Recommended = -2,
  Blocked = -3,
  Followed = -4,
}

// ======================= Types ========================
type PlaybackPush = "random" | "first" | "next" | "last" | number;
type PlaybackDirection = "backward" | "shuffled" | "forward";
type PlaybackRepeat = "single" | "none" | "all";
type CollectionType = "playlist" | "artist" | "album";
type MediaType = "artist" | "track" | "album";

type CollectionInfo = PlaylistInfo | ArtistInfo | AlbumInfo;
type MediaInfo = ArtistInfo | TrackInfo | AlbumInfo;
type PlaylistInfo = Infer<typeof playlistInfo>;
type ArtistInfo = Infer<typeof artistInfo>;
type AlbumInfo = Infer<typeof albumInfo>;
type TrackInfo = Infer<typeof trackInfo>;

type Collection = Playlist | Artist | Album;
type Media = Artist | Track | Album;
type Playlist = Infer<typeof playlist>;
type Artist = Infer<typeof artist>;
type Album = Infer<typeof album>;
type Track = Infer<typeof track>;

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

export { playlistInfo, artistInfo, trackInfo, albumInfo };
export { playlist, artist, track, album };
export { Feed };

export type { Collection, Playlist, Artist, Track, Album, Media };
export type { FromType, FromInfo, ToInfo };
export type {
  PlaybackDirection,
  PlaybackRepeat,
  CollectionType,
  PlaybackPush,
  MediaType,
};
export type {
  CollectionInfo,
  PlaylistInfo,
  ArtistInfo,
  TrackInfo,
  AlbumInfo,
  MediaInfo,
};
