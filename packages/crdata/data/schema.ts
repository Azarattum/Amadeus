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
  playlistBase,
  artistBase,
  albumBase,
  trackBase,
  unique,
} from "@amadeus-music/protocol";
import { primary, ordered, index, crr } from "crstore";
import { type SvelteDatabase } from "crstore/svelte";
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
  artist: id(),
  album: id(),
});
crr(attribution);
index(attribution, "artist");
primary(attribution, "album", "artist");

const sources = object({
  primary: boolean(),
  source: string(),
  owner: id(),
});
crr(sources);
primary(sources, "owner", "source");

const assets = object({
  thumbnail: nullable(string()),
  primary: boolean(),
  art: string(),
  owner: id(),
});
crr(assets);
primary(assets, "owner", "art");

const playlists = assign(unique(playlistBase), object({ order: string() }));
crr(playlists);
primary(playlists, "id");
ordered(playlists, "order");
index(playlists, "order", "id");

const library = object({
  date: integer(),
  order: string(),
  playlist: id(),
  track: id(),
  id: id(),
});
crr(library);
primary(library, "id");
index(library, "date");
index(library, "track");
index(library, "playlist");
index(library, "order", "id");
ordered(library, "order", "playlist");

const playback = object({
  device: instance(Uint8Array),
  order: string(),
  track: id(),
  temp: any(),
  id: id(),
});
crr(playback);
primary(playback, "id");
index(playback, "device");
index(playback, "order", "id");
ordered(playback, "order", "device");

const devices = object({
  id: instance(Uint8Array),
  direction: integer(),
  infinite: integer(),
  progress: number(),
  repeat: integer(),
  playback: id(),
});
crr(devices);
primary(devices, "id");

const settings = object({
  value: string(),
  key: string(),
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
  queue: { device: Uint8Array; position: number; track: number; id: number };
};

export type Schema = Infer<typeof schema> & Views;
export type DB = SvelteDatabase<Schema>;
export const schema = object({
  attribution,
  playlists,
  playback,
  settings,
  artists,
  sources,
  library,
  devices,
  history,
  tracks,
  albums,
  assets,
});
