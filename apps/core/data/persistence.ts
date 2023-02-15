import type { TrackDetails } from "@amadeus-music/protocol";
import type { Context } from "../plugin/types";
import { database } from "../event/pool";
import { async, take } from "libfun";

function persistence(this: Context, user?: string) {
  const all = (x: any[]) => async(Promise.all(x));
  const shared = async(take(database.bind(this)()));
  const connections = async(take(database.bind(this)(user)));

  return {
    *add(track: TrackDetails, playlist?: number) {
      /// dup operation to the shared DB
      const dbs = yield* connections;
      const cache = yield* shared;
      yield* all([
        ...(user ? dbs.map((x) => x.add(track, playlist)) : []),
        ...cache.map((x) => x.add(track)),
      ]);
    },
    *remove(track: number, playlist?: number) {
      const dbs = yield* connections;
      yield* all(dbs.map((x) => x.remove(track, playlist)));
    },
    *create(playlist: string) {
      const dbs = yield* connections;
      yield* all(dbs.map((x) => x.create(playlist)));
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
