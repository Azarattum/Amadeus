import {
  array,
  Infer,
  number,
  type,
  optional,
  string,
  union,
} from "@amadeus-music/core";

const Track = type({
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

const Tracks = type({
  result: type({
    tracks: optional(
      type({
        results: array(Track),
      })
    ),
  }),
});

const Source = type({
  result: array(type({ downloadInfoUrl: string() })),
});

const Download = type({
  path: string(),
  host: string(),
  s: string(),
  ts: string(),
});

function convert(track: Infer<typeof Track>) {
  const toArt = (cover?: string) =>
    cover ? ["https://" + cover.slice(0, -2) + "800x800"] : [];

  return {
    title: track.title,
    length: track.durationMs / 1000,
    source: JSON.stringify([`yandex/${track.id}`]),
    album: {
      title: track.albums[0]?.title || track.title,
      year: track.albums[0]?.year || 0,
      art: JSON.stringify(toArt(track.coverUri)),
      source: JSON.stringify([`yandex/${track.albums[0].id}`]),
    },
    artists: track.artists.map((x) => ({
      title: x.name,
      art: JSON.stringify(toArt(x.cover?.uri)),
      source: JSON.stringify([`yandex/${x.id}`]),
    })),
  };
}

export { Tracks, Source, Download, convert };
