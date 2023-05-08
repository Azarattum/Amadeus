import { array, assign, number, object } from "superstruct";
import { album, artist, playlist, track } from "./base";
import type { Infer } from "superstruct";
import { unique } from "./modifiers";

const trackInfo = assign(track, object({ album, artists: array(artist) }));
const trackDetails = assign(
  unique(track),
  object({
    album: unique(album),
    artists: array(unique(artist)),
  })
);
const trackEntry = assign(trackDetails, object({ entry: number() }));

const collection = object({
  count: number(),
  length: number(),
  tracks: array(trackEntry),
});

const artistInfo = artist;
const artistDetails = unique(artistInfo);
const artistCollection = assign(artistDetails, collection);

const albumInfo = assign(album, object({ artists: array(artist) }));
const albumDetails = assign(
  unique(album),
  object({ artists: array(unique(artist)) })
);
const albumCollection = assign(albumDetails, collection);

const playlistInfo = playlist;
const playlistDetails = unique(playlistInfo);
const playlistCollection = assign(playlistDetails, collection);

type TrackInfo = Infer<typeof trackInfo>;
type TrackDetails = Infer<typeof trackDetails>;
type TrackEntry = Infer<typeof trackEntry>;

type ArtistInfo = Infer<typeof artistInfo>;
type ArtistDetails = Infer<typeof artistDetails>;
type ArtistCollection = Infer<typeof artistCollection>;

type AlbumInfo = Infer<typeof albumInfo>;
type AlbumDetails = Infer<typeof albumDetails>;
type AlbumCollection = Infer<typeof albumCollection>;

type PlaylistInfo = Infer<typeof playlistInfo>;
type PlaylistDetails = Infer<typeof playlistDetails>;
type PlaylistCollection = Infer<typeof playlistCollection>;

type PlaybackDirection = "forward" | "backward" | "shuffled";
type PlaybackRepeat = "none" | "single" | "all";
type FeedType = "listened" | "recommended" | "following";

export type {
  TrackInfo,
  TrackDetails,
  TrackEntry,
  ArtistInfo,
  ArtistDetails,
  ArtistCollection,
  AlbumInfo,
  AlbumDetails,
  AlbumCollection,
  PlaylistInfo,
  PlaylistDetails,
  PlaylistCollection,
  PlaybackDirection,
  PlaybackRepeat,
  FeedType,
};
export {
  trackInfo,
  trackDetails,
  trackEntry,
  artistInfo,
  artistDetails,
  artistCollection,
  albumInfo,
  albumDetails,
  albumCollection,
  playlistInfo,
  playlistDetails,
  playlistCollection,
};
