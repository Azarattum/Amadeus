import {
  array,
  Infer,
  number,
  type,
  optional,
  string,
  union,
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

function convert<T extends "track">(data: Infer<typeof track>[], type: T) {
  const map = { track: toTrack }[type];
  const convert = map as (
    x: Parameters<typeof map>[0]
  ) => ReturnType<typeof map>;
  return data.map(convert);
}

const track = type({
  id: union([number(), string()]),
  coverUri: optional(string()),
  durationMs: number(),
  title: string(),
  artists: array(
    type({
      name: string(),
      id: number(),
      cover: optional(type({ uri: string() })),
    })
  ),
  albums: array(
    type({
      id: number(),
      year: optional(number()),
      title: optional(string()),
    })
  ),
});

const results = type({
  result: type({
    tracks: optional(
      type({
        results: array(track),
      })
    ),
  }),
});

const volumes = type({
  result: type({ volumes: array(array(track)) }),
});

const similar = type({
  result: type({ similarTracks: array(track) }),
});

const lyrics = type({
  result: type({ lyrics: optional(type({ fullLyrics: string() })) }),
});

const tracks = type({
  result: type({
    tracks: optional(array(track)),
  }),
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

export {
  download,
  results,
  volumes,
  similar,
  convert,
  tracks,
  lyrics,
  match,
  link,
};
