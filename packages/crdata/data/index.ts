import { playlists } from "../stores/playlists";
import { settings } from "../stores/settings";
import { history } from "../stores/history";
import { artists } from "../stores/artists";
import triggers from "./triggers.sql?raw";
import { tracks } from "../stores/tracks";
import { database, sql } from "crstore";
import { DB, schema } from "./schema";

const connections = new Map<string, Connection>();
const stores = (db: DB) => ({
  playlists: playlists(db),
  settings: settings(db),
  history: history(db),
  artists: artists(db),
  tracks: tracks(db),
});

function connect(options: Options) {
  if (!connections.has(options.name)) {
    const db = database(options.local ? nocrr(schema) : schema, options);
    connections.set(options.name, { ...db, ...stores(db) });
    db.update((db) => sql.raw(triggers).execute(db));
  }
  return connections.get(options.name) as Connection;
}

async function close(name?: string) {
  if (name) {
    connections.get(name)?.close();
    return connections.delete(name);
  }
  await Promise.all([...connections.values()].map((x) => x.close()));
  connections.clear();
}

function nocrr<T>(schema: T) {
  return {
    ...schema,
    schema: Object.fromEntries(
      Object.entries((schema as any).schema).map(([key, value]) => [
        key,
        { ...(value as object), crr: false },
      ])
    ),
  } as T;
}

type Connection = DB & ReturnType<typeof stores>;
type Options = Parameters<typeof database>[1] & {
  name: string;
  local?: boolean;
};

export { connect, close };
