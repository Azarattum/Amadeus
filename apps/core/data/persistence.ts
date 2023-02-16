import type { TrackDetails } from "@amadeus-music/protocol";
import { database, users as load } from "../event/pool";
import { merge } from "@amadeus-music/util/object";
import type { Context } from "../plugin/types";
import { take } from "libfun";

function persistence(this: Context, user?: string) {
  const group = this?.group || "settings";
  const shared = database.bind(this);
  const connections = take(database.bind(this)(user));

  return {
    async push(tracks: TrackDetails[], playlist?: number) {
      const [dbs, cache] = await Promise.all([connections, take(shared())]);
      await Promise.all([
        ...(user ? dbs.map((x) => x.push?.(tracks, playlist)) : []),
        ...cache.map((x) => x.push?.(tracks)),
      ]);
    },
    async purge(entries: number[]) {
      const dbs = await connections;
      await Promise.all(dbs.map((x) => x.purge?.(entries)));
    },
    async store(key: string, value: unknown) {
      const dbs = await connections;
      await Promise.all(dbs.map((x) => x.store?.(key, value, group)));
    },
    async lookup(value: unknown) {
      const dbs = await connections;
      return Promise.race(
        dbs.map((x) => x.lookup?.(value, group)).filter((x) => x)
      );
    },
    async extract(key: string) {
      const dbs = await connections;
      return Promise.race(
        dbs.map((x) => x.extract?.(key, group)).filter((x) => x)
      );
    },
    async create(playlist: string) {
      const dbs = await connections;
      await Promise.all(dbs.map((x) => x.create?.(playlist)));
    },
  };
}

function users(this: Context): Promise<Record<string, User>>;
function users(this: Context, pool: () => Generator<User>): void;
async function users(this: Context, pool?: () => Generator<User>) {
  if (pool) return load.bind(this)(pool);
  const results = load.bind(this)();
  let merged = (await results.next()).value || {};
  for await (const result of results) merged = merge(merged, result);
  return merged;
}

type Database = Partial<{
  push(tracks: TrackDetails[], playlist?: number): Promise<void>;
  purge(entries: number[]): Promise<void>;

  store(key: string, value: unknown, collection?: string): Promise<void>;
  lookup(value: unknown, collection?: string): Promise<string>;
  extract(key: string, collection?: string): Promise<any>;

  create(name: string): Promise<void>;
}>;

type User = {
  name: string;
  [key: string]: any;
};

export type { Database, User };
export { persistence, users };
