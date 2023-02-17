import { playlists } from "../stores/playlists";
import { settings } from "../stores/settings";
import { DB, schema } from "./schema";
import { database } from "crstore";

const connections = new Map<string, Connection>();
const stores = (db: DB) => ({
  playlists: playlists(db),
  settings: settings(db),
});

function connect(options: Options) {
  if (!connections.has(options.name)) {
    const db = database(options.local ? nocrr(schema) : schema, options);
    connections.set(options.name, { ...db, ...stores(db) });
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
