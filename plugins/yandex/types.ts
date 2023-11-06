import {
  type Struct,
  type Infer,
  optional,
  number,
  string,
  array,
  union,
  type,
} from "@amadeus-music/core";

function toAssets(x?: string) {
  if (!x) return { thumbnails: [], arts: [] };
  const url = `https://${x.slice(0, -2)}`;
  return { thumbnails: [url + "100x100"], arts: [url + "800x800"] };
}

function toArtist(data: Infer<typeof artist>) {
  return {
    sources: [`yandex/${data.id}`],
    title: data.name,
    ...toAssets(data.cover?.uri),
  };
}

function toAlbum(data: Infer<typeof album> | string, artistless = false) {
  const meta = typeof data !== "string";

  return {
    sources: meta ? [`yandex/${data.id}`] : [],
    title: meta ? data.title : data,
    year: meta ? data.year || 0 : 0,
    ...toAssets(meta ? data.coverUri : undefined),
    ...(artistless
      ? {}
      : { artists: meta ? data.artists?.map(toArtist) || [] : [] }),
  };
}

function toTrack(data: Infer<typeof track>) {
  return {
    title: data.title + (data.version ? ` (${data.version})` : ""),
    album: toAlbum(data.albums[0] || data.title, true),
    artists: data.artists.map(toArtist),
    duration: data.durationMs / 1000,
    sources: [`yandex/${data.id}`],
  };
}

function convert<T extends "artist" | "track" | "album">(
  data: Infer<typeof artist | typeof track | typeof album>[] | undefined,
  type: T,
) {
  const map = { artist: toArtist, track: toTrack, album: toAlbum }[type];
  const convert = map as (
    x: Parameters<typeof map>[0],
  ) => ReturnType<typeof map>;
  return data?.map((x) => convert(x)) || [];
}

const artist = type({
  cover: optional(type({ uri: string() })),
  name: string(),
  id: number(),
});

const album = type({
  artists: optional(array(artist)),
  coverUri: optional(string()),
  year: optional(number()),
  title: string(),
  id: number(),
});

const track = type({
  id: union([number(), string()]),
  version: optional(string()),
  artists: array(artist),
  durationMs: number(),
  albums: array(album),
  title: string(),
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
  ts: string(),
  s: string(),
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
  item: T,
) =>
  type({
    result: type<{ [I in K]: Struct<Infer<T>[] | undefined, T> }>({
      [name]: optional(array(item)),
    } as any),
  });

const resultsOf = <const K extends string, T extends Struct<any, any>>(
  name: K,
  item: T,
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
