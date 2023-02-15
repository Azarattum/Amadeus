import { playlists } from "../stores/playlists";
import { DB, schema } from "./schema";
import { database } from "crstore";
import { mock } from "./mock";

type Connection = DB & ReturnType<typeof stores>;
const connections = new Map<string, Connection>();
const stores = (db: DB) => ({
  playlists: playlists(db),
});

function connect(name = "shared.db") {
  if (!connections.has(name)) {
    const db = database(schema, { name });
    connections.set(name, { ...db, ...stores(db) });
    mock(db); /// For dev testing!
  }
  return connections.get(name) as Connection;
}

async function close(name?: string) {
  if (name) return connections.get(name)?.close();
  return Promise.all([...connections.values()].map((x) => x.close()));
}

export { connect, close };
