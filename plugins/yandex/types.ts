import {
  array,
  Infer,
  number,
  type,
  optional,
  string,
  union,
  type Struct,
} from "@amadeus-music/core";

const json = (strings: readonly string[], ...args: any[]) =>
  args.every((x) => x != null)
    ? JSON.stringify([
        strings.reduce((a, b, i) => a + b + (i in args ? args[i] : ""), ""),
      ])
    : "[]";

const toArt = (cover?: string) => json`https://${cover?.slice(0, -2)}800x800`;

function toArtist(data: Infer<typeof artist>) {
  return {
    title: data.name,
    art: toArt(data.cover?.uri),
    source: json`yandex/${data.id}`,
  };
}

function toAlbum(data: Infer<typeof album> | string, artistless = false) {
  if (typeof data === "string") {
    return { title: data, year: 0, art: "[]", source: "[]" };
  }

  return {
    title: data.title,
    year: data.year || 0,
    source: json`yandex/${data.id}`,
    art: toArt(data.coverUri),
    ...(artistless ? {} : { artists: data.artists?.map(toArtist) || [] }),
  };
}

function toTrack(data: Infer<typeof track>) {
  return {
    title: data.title + (data.version ? ` (${data.version})` : ""),
    length: data.durationMs / 1000,
    source: json`yandex/${data.id}`,
    album: toAlbum(data.albums[0] || data.title, true),
    artists: data.artists.map(toArtist),
  };
}

function convert<T extends "track" | "artist" | "album">(
  data: Infer<typeof track | typeof album | typeof artist>[] | undefined,
  type: T
) {
  const map = { track: toTrack, artist: toArtist, album: toAlbum }[type];
  const convert = map as (
    x: Parameters<typeof map>[0]
  ) => ReturnType<typeof map>;
  return data?.map((x) => convert(x)) || [];
}

const artist = type({
  name: string(),
  id: number(),
  cover: optional(type({ uri: string() })),
});

const album = type({
  id: number(),
  title: string(),
  year: optional(number()),
  coverUri: optional(string()),
  artists: optional(array(artist)),
});

const track = type({
  id: union([number(), string()]),
  durationMs: number(),
  title: string(),
  version: optional(string()),
  artists: array(artist),
  albums: array(album),
});

const lyrics = type({
  result: type({ lyrics: optional(type({ fullLyrics: string() })) }),
});

const link = type({
  result: array(type({ downloadInfoUrl: string() })),
});

const download = type({
  path: string(),
  host: string(),
  s: string(),
  ts: string(),
});

const match = type({
  directive: type({
    payload: union([
      type({
        data: type({
          match: track,
        }),
      }),
      type({
        error: type({
          message: string(),
        }),
      }),
    ]),
  }),
});

const resultOf = <const K extends string, T extends Struct<any, any>>(
  name: K,
  item: T
) =>
  type({
    result: type<{ [I in K]: Struct<Infer<T>[] | undefined, T> }>({
      [name]: optional(array(item)),
    } as any),
  });

const resultsOf = <const K extends string, T extends Struct<any, any>>(
  name: K,
  item: T
) =>
  type({
    result: type<{
      [I in K]: Struct<
        { results: Infer<T>[] } | undefined,
        { results: Struct<Infer<T>[], T> }
      >;
    }>({ [name]: optional(type({ results: array(item) })) } as any),
  });

export {
  resultsOf,
  resultOf,
  download,
  convert,
  lyrics,
  artist,
  track,
  album,
  match,
  link,
};
