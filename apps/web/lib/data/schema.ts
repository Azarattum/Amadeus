import { boolean, nullable, number, object, string } from "superstruct";
import type { ObjectSchema } from "superstruct/dist/utils";
import { primary, crr, index } from "crstore";

const table = <S extends ObjectSchema>(schema: S, indexes: (keyof S)[] = []) =>
  index(crr(object(schema)), indexes as string[]);

const id = number;
const tracks = table({
  id: primary(id()),
  title: string(),
  length: number(),
  album: id(),
});

const albums = table({
  id: primary(id()),
  title: string(),
  year: number(),
});

const catalogue = table({
  id: primary(id()), /// Reconsider in favor of multi-column PK
  album: id(),
  artist: id(),
});

const artists = table({
  id: primary(id()),
  title: string(),
  following: boolean(),
});

const assets = table({
  data: primary(string()),
  owner: id(),
  type: string(),
  order: string(),
});

const library = table({
  id: primary(id()),
  playlist: id(),
  track: id(),
  date: number(),
  order: string(),
});

const playlists = table({
  id: primary(id()),
  title: string(),
  relevancy: number(),
  shared: nullable(string()),
  remote: nullable(string()),
});

export const schema = object({
  tracks,
  albums,
  catalogue,
  artists,
  assets,
  library,
  playlists,
});
