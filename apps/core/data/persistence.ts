import type { TrackDetails } from "@amadeus-music/protocol";
import type { Context } from "../plugin/types";
import { database } from "../event/pool";
import { take } from "libfun";

function persistence(this: Context, user?: string) {
  const shared = take(database.bind(this)());
  const connections = take(database.bind(this)(user));

  return {
    async add(track: TrackDetails, playlist?: number) {
      const [dbs, cache] = await Promise.all([connections, shared]);
      await Promise.all([
        ...(user ? dbs.map((x) => x.add(track, playlist)) : []),
        ...cache.map((x) => x.add(track)),
      ]);
    },
    async remove(track: number, playlist?: number) {
      const dbs = await connections;
      await Promise.all(dbs.map((x) => x.remove(track, playlist)));
    },
    async create(playlist: string) {
      const dbs = await connections;
      await Promise.all(dbs.map((x) => x.create(playlist)));
    },
  };
}

type Database = {
  add(track: TrackDetails, playlist?: number): void | Promise<void>;
  remove(track: number, playlist?: number): void | Promise<void>;
  create(name: string): void | Promise<void>;
};

export type { Database };
export { persistence };
