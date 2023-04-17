import {
  Infer,
  inferTrack,
  literal,
  nullable,
  string,
  type,
} from "@amadeus-music/core";

const track = type({
  artist: string(),
  title: string(),
  album: string(),
  release_date: string(),
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
    title: inferred.artists.length ? inferred.title : data.title,
    length: 0,
    source: "[]",
    album: {
      title: data.album,
      year: +(
        data.release_date.match(/([0-9]{4})-[0-9]{2}-[0-9]{2}/)?.[1] || 0
      ),
      art: "[]",
      source: "[]",
    },
    artists: artists.map((title) => ({
      title,
      art: "[]",
      source: "[]",
    })),
  };
}

export { convert, success, error, track };
