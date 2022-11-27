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
  artists: array(type({ name: string() })),
  albums: array(
    type({
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
  return {
    title: track.title,
    artists: track.artists.map((x) => x.name),
    album: track.albums[0]?.title || track.title,
    cover: track.coverUri
      ? "https://" +
        track.coverUri.slice(0, track.coverUri.length - 2) +
        "800x800"
      : undefined,
    sources: [`amadeus://yandex/${track.id}`],
    length: track.durationMs / 1000,
  };
}

export { Tracks, Source, Download, convert };
