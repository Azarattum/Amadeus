import {
  object,
  number,
  string,
  array,
  type Infer,
  intersection,
  Struct,
  union,
  omit,
  nullable,
} from "superstruct";
import type { ObjectSchema, ObjectType } from "superstruct/dist/utils";

/// TODO: rewrite protocol

type Track = Infer<typeof track>;
const track = object({
  title: string(),
  artists: array(string()),
  album: string(),
  year: nullable(number()),
  length: number(),

  source: array(string()),
  art: array(string()),
});

type Artist = Infer<typeof artist>;
const artist = object({
  title: string(),
  source: array(string()),
  art: array(string()),
});

type Album = Infer<typeof album>;
const album = object({
  title: string(),
  source: array(string()),
  art: array(string()),
});

type Unique<T> = T & { id: number };
const unique = <T extends Struct<any>>(t: T) =>
  intersection([t, object({ id: number() })]);

type Abstract<T> = T extends any ? Omit<T, "source" | "art" | "length"> : never;
const abstract = <T extends ObjectSchema>(t: Struct<ObjectType<T>, T>) =>
  omit(t, ["source", "art", "length"]);

type Media = Infer<typeof media>;
const media = union([track, artist, album]);

type Source = Infer<typeof source>;
const source = object({
  url: string(),
});

export { media, track, artist, album, source, unique, abstract };
export type { Media, Track, Artist, Album, Source, Unique, Abstract };
