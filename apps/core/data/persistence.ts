import type { TrackDetails } from "@amadeus-music/protocol";
import type { Context } from "../plugin/types";
import { database } from "../event/pool";
import { take } from "libfun";

function persistence(this: Context, user?: string) {
  const group = this?.group || "core";
  const shared = take(database.bind(this)());
  const connections = take(database.bind(this)(user));

  return {
    async push(tracks: TrackDetails[], playlist?: number) {
      const [dbs, cache] = await Promise.all([connections, shared]);
      await Promise.all([
        ...(user ? dbs.map((x) => x.push?.(tracks, playlist)) : []),
        ...cache.map((x) => x.push?.(tracks)),
      ]);
    },
    async purge(entries: number[]) {
      const dbs = await connections;
      await Promise.all(dbs.map((x) => x.purge?.(entries)));
    },
    async store(key: string, value: string) {
      const dbs = await connections;
      await Promise.all(dbs.map((x) => x.store?.(group, key, value)));
    },
    async lookup(value: string) {
      const dbs = await connections;
      return Promise.race(
        dbs.map((x) => x.lookup?.(group, value)).filter((x) => x)
      );
    },
    async extract(key: string) {
      const dbs = await connections;
      return Promise.race(
        dbs.map((x) => x.extract?.(group, key)).filter((x) => x)
      );
    },
    async create(playlist: string) {
      const dbs = await connections;
      await Promise.all(dbs.map((x) => x.create?.(playlist)));
    },
  };
}

type Database = Partial<{
  push(tracks: TrackDetails[], playlist?: number): Promise<void>;
  purge(entries: number[]): Promise<void>;

  store(collection: string, key: string, value: string): Promise<void>;
  lookup(collection: string, value: string): Promise<string>;
  extract(collection: string, key: string): Promise<string>;

  create(name: string): Promise<void>;
}>;

export type { Database };
export { persistence };
