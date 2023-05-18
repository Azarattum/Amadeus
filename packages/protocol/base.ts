import {
  Struct,
  array,
  integer,
  nullable,
  number,
  object,
  optional,
  string,
  type,
} from "superstruct";
import type { Infer } from "superstruct";

const track = object({
  title: string(),
  duration: number(),
});

const album = object({
  title: string(),
  year: integer(),
});

const artist = object({
  title: string(),
});

const playlist = object({
  title: string(),
  relevancy: number(),
  shared: nullable(string()),
  remote: nullable(string()),
});

const meta = type({
  title: optional(string()),
  album: optional(type({ title: optional(string()) })),
  artists: optional(array(type({ title: optional(string()) }))),
});

const media = object({
  sources: array(string()),
  arts: optional(array(string())),
  thumbnails: optional(array(string())),
});

const collection = <T extends Struct<any, any>>(item: T) =>
  object({
    size: integer(),
    duration: number(),
    tracks: array(item),
  });

type TrackBase = Infer<typeof track>;
type AlbumBase = Infer<typeof album>;
type ArtistBase = Infer<typeof artist>;
type PlaylistBase = Infer<typeof playlist>;

type Meta = Infer<typeof meta>;
type MediaBase = Infer<typeof media>;
type CollectionBase = Infer<ReturnType<typeof collection<Struct<unknown>>>>;

export type {
  Meta,
  MediaBase,
  TrackBase,
  AlbumBase,
  ArtistBase,
  PlaylistBase,
  CollectionBase,
};
export {
  meta,
  media as mediaBase,
  track as trackBase,
  album as albumBase,
  artist as artistBase,
  playlist as playlistBase,
  collection as collectionBase,
};
