import { boolean, nullable, number, object, string } from "superstruct";
import { primary, crr } from "crstore";

const id = number;
const tracks = object({
  id: id(),
  title: string(),
  length: number(),
  album: id(),
  source: string(),
});
crr(tracks);
primary(tracks, "id");

const albums = object({
  id: id(),
  title: string(),
  year: number(),
  source: string(),
  art: string(),
});
crr(albums);
primary(albums, "id");

const catalogue = object({
  album: id(),
  artist: id(),
});
crr(catalogue);
primary(catalogue, "album", "artist");

const artists = object({
  id: id(),
  title: string(),
  following: boolean(),
  source: string(),
  art: string(),
});
crr(artists);
primary(artists, "id");

const library = object({
  id: id(),
  playlist: id(),
  track: id(),
  date: number(),
  order: string(),
});
crr(library);
primary(library, "id");

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
