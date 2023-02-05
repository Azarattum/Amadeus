import { album, artist, track, unique } from "@amadeus-music/protocol";
import { assign, nullable, number, object, string } from "superstruct";
import { primary, crr, ordered, index } from "crstore";

const id = number;

const tracks = assign(unique(track), object({ album: id() }));
crr(tracks);
primary(tracks, "id");

const albums = unique(album);
crr(albums);
primary(albums, "id");

const artists = unique(artist);
crr(artists);
primary(artists, "id");

const catalogue = object({
  album: id(),
  artist: id(),
});
crr(catalogue);
primary(catalogue, "album", "artist");

const library = object({
  id: id(),
  playlist: id(),
  track: id(),
  date: number(),
  order: string(),
});
crr(library);
primary(library, "id");
index(library, "playlist");
index(library, "order", "id");
ordered(library, "order", "playlist");

const playlists = object({
  id: id(),
  title: string(),
  relevancy: number(),
  shared: nullable(string()),
  remote: nullable(string()),
});
crr(playlists);
primary(playlists, "id");

export const schema = object({
  tracks,
  albums,
  catalogue,
  artists,
  library,
  playlists,
});
