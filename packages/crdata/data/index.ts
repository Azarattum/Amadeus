import { playlists } from "../stores/playlists";
import { DB, schema } from "./schema";
import { database } from "crstore";

type Connection = DB & ReturnType<typeof stores>;
const connections = new Map<string, Connection>();
const stores = (db: DB) => ({
  playlists: playlists(db),
});

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

function connect(name: string, local = false) {
  if (!connections.has(name)) {
    const db = database(local ? nocrr(schema) : schema, { name });
    connections.set(name, { ...db, ...stores(db) });
  }
  return connections.get(name) as Connection;
}

async function close(name?: string) {
  if (name) return connections.get(name)?.close();
  return Promise.all([...connections.values()].map((x) => x.close()));
}

export { connect, close };
