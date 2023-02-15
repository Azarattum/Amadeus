import { integer, number, object, string } from "superstruct";
import type { Infer } from "superstruct";

const track = object({
  title: string(),
  length: number(),
  source: string(),
});

const album = object({
  title: string(),
  year: integer(),
  source: string(),
  art: string(),
});

const artist = object({
  title: string(),
  source: string(),
  art: string(),
});

type Track = Infer<typeof track>;
type Album = Infer<typeof album>;
type Artist = Infer<typeof artist>;

export type { Track, Album, Artist };
export { track, album, artist };
