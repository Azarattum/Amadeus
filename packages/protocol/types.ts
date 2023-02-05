import { array, number, object, string, union } from "superstruct";
import type { Infer } from "superstruct";
import { unique } from "./modifiers";

const track = object({
  title: string(),
  length: number(),
  source: string(),
});

const album = object({
  title: string(),
  year: number(),
  source: string(),
  art: string(),
});

const artist = object({
  title: string(),
  source: string(),
  art: string(),
});

const details = union([
  unique(track),
  object({
    album: unique(album),
    artists: array(unique(artist)),
  }),
]);

const meta = union([track, object({ album, artists: array(artist) })]);

type Track = Infer<typeof track>;
type Album = Infer<typeof album>;
type Artist = Infer<typeof artist>;
type Details = Infer<typeof details>;
type Meta = Infer<typeof meta>;

export type { Track, Album, Artist, Details, Meta };
export { track, album, artist, details, meta };
