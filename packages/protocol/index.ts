import {
  object,
  number,
  string,
  array,
  optional,
  type Infer,
  intersection,
  omit,
} from "superstruct";

type Record = Infer<typeof record>;
const record = object({
  title: string(),
  artists: array(string()),
  album: string(),

  length: number(),
  source: string(),
  year: optional(number()),
  cover: optional(string()),
});

type Track = Infer<typeof track>;
const track = intersection([
  omit(record, ["cover", "source"]),
  object({
    id: string(),
    cover: array(string()),
    source: array(string()),
  }),
]);

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

export { track, record, artist, album, source };
export type { Track, Record, Artist, Album, Source };
