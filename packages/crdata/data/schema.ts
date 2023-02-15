import {
  assign,
  boolean,
  Infer,
  nullable,
  number,
  object,
  string,
} from "superstruct";
import { album, artist, track, unique } from "@amadeus-music/protocol";
import { primary, crr, ordered, index } from "crstore";
import { Database } from "crstore/types";

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

const playback = object({
  id: id(),
  track: id(),
  device: string(),
  progress: number(),
  order: string(),
  hidden: boolean(),
});
crr(playback);
primary(playback, "id");
index(playback, "device");
index(playback, "order", "id");
ordered(playback, "order", "device");

const following = object({
  artist: id(),
  seen: id(),
});
crr(following);
primary(following, "artist", "seen");

const settings = object({
  key: string(),
  value: string(),
});
crr(settings);
primary(settings, "key");
index(settings, "value");

const history = object({
  query: string(),
  date: number(),
});

export type DB = Database<Infer<typeof schema>>;
export const schema = object({
  tracks,
  albums,
  catalogue,
  artists,
  library,
  playlists,
  playback,
  following,
  settings,
  history,
});
