import {
  nullable,
  optional,
  integer,
  Struct,
  number,
  object,
  string,
  array,
  type,
} from "superstruct";
import type { Infer } from "superstruct";

const track = object({
  duration: number(),
  title: string(),
});

const album = object({
  year: integer(),
  title: string(),
});

const artist = object({
  title: string(),
});

const playlist = object({
  shared: nullable(string()),
  remote: nullable(string()),
  relevancy: number(),
  title: string(),
});

const meta = type({
  artists: optional(array(type({ title: optional(string()) }))),
  album: optional(type({ title: optional(string()) })),
  title: optional(string()),
});

const media = object({
  thumbnails: optional(array(nullable(string()))),
  arts: optional(array(string())),
  sources: array(string()),
});

const collection = <T extends Struct<any, any>>(item: T) =>
  object({
    tracks: array(item),
    duration: number(),
    size: integer(),
  });

type TrackBase = Infer<typeof track>;
type AlbumBase = Infer<typeof album>;
type ArtistBase = Infer<typeof artist>;
type PlaylistBase = Infer<typeof playlist>;

type Meta = Infer<typeof meta>;
type MediaBase = Infer<typeof media>;
type CollectionBase<T = unknown> = Infer<
  ReturnType<typeof collection<Struct<T>>>
>;

export type {
  CollectionBase,
  PlaylistBase,
  ArtistBase,
  MediaBase,
  TrackBase,
  AlbumBase,
  Meta,
};
export {
  collection as collectionBase,
  playlist as playlistBase,
  artist as artistBase,
  media as mediaBase,
  track as trackBase,
  album as albumBase,
  meta,
};
