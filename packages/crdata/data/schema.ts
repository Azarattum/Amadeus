import {
  type Infer,
  instance,
  nullable,
  integer,
  assign,
  number,
  object,
  string,
  any,
} from "superstruct";
import {
  unique,
  albumBase,
  trackBase,
  artistBase,
  playlistBase,
} from "@amadeus-music/protocol";
import { primary, crr, ordered, index, type Database } from "crstore";
import type { Struct } from "superstruct";

const id = integer;
const boolean = integer as () => Struct<0 | 1, null>;

const tracks = assign(unique(trackBase), object({ album: id() }));
crr(tracks);
index(tracks, "album");
primary(tracks, "id");

const albums = unique(albumBase);
crr(albums);
primary(albums, "id");

const artists = assign(unique(artistBase), object({ following: boolean() }));
crr(artists);
primary(artists, "id");

const attribution = object({
  album: id(),
  artist: id(),
});
crr(attribution);
index(attribution, "artist");
primary(attribution, "album", "artist");

const sources = object({
  source: string(),
  owner: id(),
  primary: boolean(),
});
crr(sources);
primary(sources, "owner", "source");

const assets = object({
  art: string(),
  thumbnail: nullable(string()),
  owner: id(),
  primary: boolean(),
});
crr(assets);
primary(assets, "owner", "art");

const playlists = assign(unique(playlistBase), object({ order: string() }));
crr(playlists);
primary(playlists, "id");
ordered(playlists, "order");
index(playlists, "order", "id");

const library = object({
  id: id(),
  playlist: id(),
  track: id(),
  date: integer(),
  order: string(),
});
crr(library);
primary(library, "id");
index(library, "date");
index(library, "track");
index(library, "playlist");
index(library, "order", "id");
ordered(library, "order", "playlist");

const playback = object({
  id: id(),
  device: instance(Uint8Array),
  track: id(),
  order: string(),
  temp: any(),
});
crr(playback);
primary(playback, "id");
index(playback, "device");
index(playback, "order", "id");
ordered(playback, "order", "device");

const devices = object({
  id: instance(Uint8Array),
  playback: id(),
  direction: integer(),
  infinite: integer(),
  progress: number(),
  repeat: integer(),
});
crr(devices);
primary(devices, "id");

const settings = object({
  key: string(),
  value: string(),
});
crr(settings);
index(settings, "value");
primary(settings, "key");

const history = object({
  query: string(),
  date: integer(),
});
crr(history);
index(history, "date");
primary(history, "query");

type Views = {
  queue: { id: number; device: Uint8Array; track: number; position: number };
};

export type Schema = Infer<typeof schema> & Views;
export type DB = Database<Schema>;
export const schema = object({
  tracks,
  albums,
  attribution,
  artists,
  sources,
  assets,
  library,
  playlists,
  playback,
  devices,
  settings,
  history,
});
