import {
  object,
  number,
  string,
  array,
  optional,
  type Infer,
} from "superstruct";

type Track = Infer<typeof track>;
const track = object({
  title: string(),
  artists: array(string()),
  album: string(),

  length: number(),
  year: optional(number()),
  cover: optional(string()),
  sources: array(string()),
});

type Source = Infer<typeof source>;
const source = object({
  url: string(),
});

type Artist = Infer<typeof artist>;
const artist = object({
  /// Formalize an artist representation
});

type Album = Infer<typeof album>;
const album = object({
  /// Formalize an album representation
});

export { track, artist, album, source };
export type { Track, Artist, Album, Source };
