import { integer, nullable, number, object, string } from "superstruct";
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

const playlist = object({
  title: string(),
  relevancy: number(),
  shared: nullable(string()),
  remote: nullable(string()),
});

type Track = Infer<typeof track>;
type Album = Infer<typeof album>;
type Artist = Infer<typeof artist>;
type Playlist = Infer<typeof playlist>;

export type { Track, Album, Artist, Playlist };
export { track, album, artist, playlist };
