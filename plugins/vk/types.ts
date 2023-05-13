import {
  array,
  Infer,
  number,
  type,
  optional,
  string,
  object,
  Struct,
} from "@amadeus-music/core";

const json = (strings: readonly string[], ...args: any[]) =>
  args.every((x) => x != null)
    ? JSON.stringify([
        strings.reduce((a, b, i) => a + b + (i in args ? args[i] : ""), ""),
      ])
    : "[]";

function toArtist(data: Infer<typeof artist> | string) {
  if (typeof data === "string") return { title: data, source: "[]", art: "[]" };

  const art = data.photo?.length
    ? data.photo?.reduce((a, b) =>
        a.width * a.height > b.width * b.height ? a : b
      ).url
    : undefined;

  return {
    title: data.name,
    art: json`${art}`,
    source: json`vk/${data.id}`,
  };
}

function toAlbum(data: Infer<typeof album> | string) {
  if (typeof data === "string") {
    return { title: data, year: 0, art: "[]", source: "[]" };
  }

  const artists = data.main_artists
    ?.map(toArtist)
    .concat(data.featured_artists?.map(toArtist) || []);

  return {
    title: data.title,
    year: data.year || 0,
    art: json`${data.photo?.photo_1200 || data.thumb?.photo_1200}`,
    source: json`vk/${data.owner_id}/${data.id}/${data.access_key}`,
    ...(artists ? { artists } : {}),
  };
}

function toTrack(data: Infer<typeof track>) {
  return {
    length: data.duration,
    album: toAlbum(data.album || data.title),
    source: json`vk/${data.owner_id}_${data.id}`,
    title: data.title + (data.subtitle ? ` (${data.subtitle})` : ""),
    artists: data.main_artists
      ?.map(toArtist)
      .concat(data.featured_artists?.map(toArtist) || []) || [
      toArtist(data.artist),
    ],
  };
}

function convert<T extends "track" | "artist" | "album">(
  data: Infer<typeof track | typeof album | typeof artist>[],
  type: T
) {
  const map = { track: toTrack, artist: toArtist, album: toAlbum }[type];
  const convert = map as (
    x: Parameters<typeof map>[0]
  ) => ReturnType<typeof map>;
  return data.map(convert);
}

const artist = type({
  id: optional(string()),
  name: string(),
  photo: optional(
    array(
      type({
        url: string(),
        width: number(),
        height: number(),
      })
    )
  ),
});

const album = type({
  id: number(),
  title: string(),
  owner_id: number(),
  access_key: string(),
  year: optional(number()),
  main_artists: optional(array(artist)),
  featured_artists: optional(array(artist)),
  photo: optional(
    type({
      photo_68: string(),
      photo_1200: string(),
    })
  ),
  thumb: optional(
    type({
      photo_68: string(),
      photo_1200: string(),
    })
  ),
});

const track = type({
  id: number(),
  url: string(),
  date: number(),
  title: string(),
  artist: string(),
  duration: number(),
  owner_id: number(),
  album: optional(album),
  subtitle: optional(string()),
  main_artists: optional(array(artist)),
  featured_artists: optional(array(artist)),
});

const responseOf = <T extends Struct<any, any>>(response: T) =>
  object({ response });
const items = <T extends Struct<any, any>>(items: T) =>
  object({ count: number(), items: array(items) });

export { responseOf, items, track, artist, album, convert };
