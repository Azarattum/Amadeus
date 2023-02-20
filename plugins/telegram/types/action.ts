import { integer, object, union } from "@amadeus-music/core";

export const Next = object({
  next: integer(),
});
export const Prev = object({
  prev: integer(),
});
export const Close = object({
  close: integer(),
});
export const Download = object({
  download: integer(),
});

export const Page = object({
  page: integer(),
});
export const All = object({
  all: integer(),
});
export const Shuffle = object({
  shuffle: integer(),
});

export const Artists = object({
  artists: integer(),
});
export const Artist = object({
  artist: integer(),
  track: integer(),
});
export const Album = object({
  album: integer(),
});
export const Similar = object({
  similar: integer(),
});
export const Reset = object({
  reset: integer(),
});

export const Query = union([
  Next,
  Prev,
  Close,
  Download,
  Page,
  All,
  Shuffle,
  Artists,
  Artist,
  Album,
  Similar,
  Reset,
]);
