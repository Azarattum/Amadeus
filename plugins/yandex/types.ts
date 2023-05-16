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

function toTrack(data: Infer<typeof track>) {
  const toArt = (cover?: string) =>
    cover ? ["https://" + cover.slice(0, -2) + "800x800"] : [];

  return {
    title: data.title,
    length: data.durationMs / 1000,
    source: json`yandex/${data.id}`,
    album: {
      title: data.albums[0]?.title || data.title,
      year: data.albums[0]?.year || 0,
      art: json`${toArt(data.coverUri)}`,
      source: json`yandex/${data.albums[0].id}`,
    },
    artists: data.artists.map((x) => ({
      title: x.name,
      art: json`${toArt(x.cover?.uri)}`,
      source: json`yandex/${x.id}`,
    })),
  };
}

function convert<T extends "track">(
  data: Infer<typeof track>[] | undefined,
  type: T
) {
  const map = { track: toTrack }[type];
  const convert = map as (
    x: Parameters<typeof map>[0]
  ) => ReturnType<typeof map>;
  return data?.map(convert) || [];
}

const artist = type({
  name: string(),
  id: number(),
  cover: optional(type({ uri: string() })),
});

const track = type({
  id: union([number(), string()]),
  coverUri: optional(string()),
  durationMs: number(),
  title: string(),
  artists: array(artist),
  albums: array(
    type({
      id: number(),
      year: optional(number()),
      title: optional(string()),
    })
  ),
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

export { resultOf, resultsOf, track, download, convert, lyrics, match, link };
