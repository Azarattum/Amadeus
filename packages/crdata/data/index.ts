import { upcoming, preceding, playback } from "../stores/playback";
import { target, playlist, artist } from "../stores/lazy";
import { playlists } from "../stores/playlists";
import { settings } from "../stores/settings";
import { history } from "../stores/history";
import { artists } from "../stores/artists";
import { library } from "../stores/library";
import { type DB, schema } from "./schema";
import { tracks } from "../stores/tracks";
import { database, sql } from "crstore";
import { feed } from "../stores/feed";

const connections = new Map<string, Connection>();

const stores = (db: DB) => ({
  playlists: playlists(db),
  preceding: preceding(db),
  playlist: playlist(db),
  playback: playback(db),
  upcoming: upcoming(db),
  settings: settings(db),
  history: history(db),
  artists: artists(db),
  library: library(db),
  artist: artist(db),
  tracks: tracks(db),
  feed: feed(db),
});

function connect(options: Options) {
  if (!connections.has(options.name)) {
    const db = database(
      options.local ? (nocrr(schema) as typeof schema) : schema,
      options
    ) as any as DB;
    connections.set(options.name, { ...db, ...stores(db) });
    const statements = Object.values(
      import.meta.glob("../sql/*", { eager: true, as: "raw" })
    )
      .flatMap((x) => x.split(/\r?\n\r?\n/))
      .map((x) => sql.raw(x));
    db.update((db) => Promise.all(statements.map((x) => x.execute(db))));
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

export { connect, close, target };
