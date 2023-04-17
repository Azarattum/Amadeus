import { Infer, array, string, type } from "@amadeus-music/core";

const track = type({
  TrackName: string(),
  ArtistName: string(),
});

const success = type({
  AllResults: array(
    type({
      NativeData: type({
        Tracks: array(track),
      }),
    })
  ),
});

function convert(data: Infer<typeof track>) {
  return {
    title: data.TrackName,
    length: 0,
    source: "[]",
    album: {
      title: data.TrackName,
      year: 0,
      art: "[]",
      source: "[]",
    },
    artists: [{ title: data.ArtistName, source: "[]", art: "[]" }],
  };
}

export { convert, success, track };
