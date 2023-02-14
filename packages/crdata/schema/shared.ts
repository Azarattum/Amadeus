import { album, artist, track, unique } from "@amadeus-music/protocol";
import { assign, object } from "superstruct";
import { primary } from "crstore";
import { id } from "./base";

const tracks = assign(unique(track), object({ album: id() }));
primary(tracks, "id");

const albums = unique(album);
primary(albums, "id");

const artists = unique(artist);
primary(artists, "id");

const catalogue = object({
  album: id(),
  artist: id(),
});
primary(catalogue, "album", "artist");

export const schema = object({
  tracks,
  albums,
  catalogue,
  artists,
});
