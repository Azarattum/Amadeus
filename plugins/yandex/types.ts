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
  /// TODO: comply with protocol
  return {
    title: track.title,
    length: track.durationMs / 1000,
    album: {
      title: track.albums[0]?.title || track.title,
      artists: track.artists.map((x) => ({
        title: x.name,
        art: [],
        source: [],
      })),
      year: track.albums[0].year || null,
      art: track.coverUri
        ? [
            {
              url:
                "https://" +
                track.coverUri.slice(0, track.coverUri.length - 2) +
                "800x800",
              priority: 0,
            },
          ]
        : [],
      source: [],
    },
    source: [
      {
        url: `amadeus://yandex/${track.id}`,
        priority: 0,
      },
    ],
  };
}

export { Tracks, Source, Download, convert };
