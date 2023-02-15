import type { TrackDetails } from "@amadeus-music/protocol";
import type { Context } from "../plugin/types";
import { database } from "../event/pool";
import { take } from "libfun";

function persistence(this: Context, user?: string) {
  const shared = take(database.bind(this)());
  const connections = take(database.bind(this)(user));

  return {
    async push(tracks: TrackDetails[], playlist?: number) {
      const [dbs, cache] = await Promise.all([connections, shared]);
      await Promise.all([
        ...(user ? dbs.map((x) => x.push(tracks, playlist)) : []),
        ...cache.map((x) => x.push(tracks)),
      ]);
    },
    async purge(entries: number[]) {
      const dbs = await connections;
      await Promise.all(dbs.map((x) => x.purge(entries)));
    },
    async create(playlist: string) {
      const dbs = await connections;
      await Promise.all(dbs.map((x) => x.create(playlist)));
    },
  };
}

type Database = {
  push(tracks: TrackDetails[], playlist?: number): void | Promise<void>;
  purge(entries: number[]): void | Promise<void>;
  create(name: string): void | Promise<void>;
};

export type { Database };
export { persistence };
