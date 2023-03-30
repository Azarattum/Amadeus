import { album, artist, playlist, track } from "./base";
import { array, assign, object } from "superstruct";
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

const artistInfo = artist;
const artistDetails = unique(artist);

const albumInfo = album;
const albumDetails = unique(album);

const playlistInfo = playlist;
const playlistDetails = unique(playlist);

type TrackInfo = Infer<typeof trackInfo>;
type TrackDetails = Infer<typeof trackDetails>;
type ArtistInfo = Infer<typeof artistInfo>;
type ArtistDetails = Infer<typeof artistDetails>;
type AlbumInfo = Infer<typeof albumInfo>;
type AlbumDetails = Infer<typeof albumDetails>;
type PlaylistInfo = Infer<typeof playlistInfo>;
type PlaylistDetails = Infer<typeof playlistDetails>;

type PlaybackDirection = "forward" | "backward" | "shuffled";
type PlaybackRepeat = "none" | "single" | "all";
type FeedType = "listened" | "recommended" | "following";

export type {
  TrackInfo,
  TrackDetails,
  ArtistInfo,
  ArtistDetails,
  AlbumInfo,
  AlbumDetails,
  PlaylistInfo,
  PlaylistDetails,
  PlaybackDirection,
  PlaybackRepeat,
  FeedType,
};
export {
  trackInfo,
  trackDetails,
  artistInfo,
  artistDetails,
  albumInfo,
  albumDetails,
  playlistInfo,
  playlistDetails,
};
