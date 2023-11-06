import {
  inferTrack,
  type Infer,
  nullable,
  literal,
  string,
  type,
} from "@amadeus-music/core";

const track = type({
  release_date: string(),
  artist: string(),
  title: string(),
  album: string(),
});

const success = type({
  status: literal("success"),
  result: nullable(track),
});

const error = type({
  status: literal("error"),
});

function convert(data: Infer<typeof track>) {
  const inferred = inferTrack(data.title);
  const artists = [
    ...new Set(data.artist.split(";").concat(inferred.artists)),
  ].sort();

  return {
    album: {
      year: +(
        data.release_date.match(/([0-9]{4})-[0-9]{2}-[0-9]{2}/)?.[1] || 0
      ),
      title: data.album,
      sources: [],
    },
    title: inferred.artists.length ? inferred.title : data.title,
    artists: artists.map((title) => ({ sources: [], title })),
    duration: 0,
    sources: [],
  };
}

export { convert, success, error, track };
