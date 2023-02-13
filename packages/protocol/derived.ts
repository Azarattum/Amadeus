import { array, assign, object } from "superstruct";
import { album, artist, track } from "./base";
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

type TrackInfo = Infer<typeof trackInfo>;
type TrackDetails = Infer<typeof trackDetails>;
type ArtistInfo = Infer<typeof artistInfo>;
type ArtistDetails = Infer<typeof artistDetails>;
type AlbumInfo = Infer<typeof albumInfo>;
type AlbumDetails = Infer<typeof albumDetails>;

export type {
  TrackInfo,
  TrackDetails,
  ArtistInfo,
  ArtistDetails,
  AlbumInfo,
  AlbumDetails,
};
export {
  trackInfo,
  trackDetails,
  artistInfo,
  artistDetails,
  albumInfo,
  albumDetails,
};
