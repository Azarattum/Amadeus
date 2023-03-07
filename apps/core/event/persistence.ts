import type {
  ArtistDetails,
  PlaylistDetails,
  TrackDetails,
} from "@amadeus-music/protocol";
import { merge } from "@amadeus-music/util/object";
import { database, users as load } from "./pool";
import type { Context } from "../plugin/types";
import { wrap } from "libfun/pool";
import { async } from "libfun";

function persistence(this: Context, user?: string) {
  const group = this?.group || "settings";
  const connect = () => async(database.bind(this)(user).then());
  const strategies = {
    race: new Set<Method>([
      "settings.extract",
      "settings.lookup",
      /// Consider merge
      "playlists.get",
      "artists.get",
      "tracks.get",
    ]),
    /// Consider sort, consider distinct
    flat: new Set<Method>(["history.get"]),
    group: new Set<Method>(["settings.store"]),
  };

  const scope = (scope: string) =>
    new Proxy({} as Record<string, any>, {
      get(_, method: string) {
        const target = `${scope}.${method}` as Method;
        /// This also has to be a promise
        function* generate(...args: any[]) {
          const dbs = yield* connect();
          const fns = dbs.map((x: any) => x[scope]?.[method]).filter((x) => x);
          if (strategies.group.has(target)) args.push(group);
          const promises = fns.map((x) => x(...args));
          if (strategies.race.has(target)) {
            const result = yield* async(Promise.race(promises));
            if (!result) throw new Error(`${target} returned nothing!`);
            return result;
          } else if (strategies.flat.has(target)) {
            /// Sort needed
            return yield* async(Promise.all(promises).then((x) => x.flat()));
          } else yield* async(Promise.all(promises));
        }

        return (...args: any[]) => {
          const iterator = generate(...args);
          Object.assign(iterator, {
            async then(
              resolve?: (x: any) => any,
              reject?: (x: unknown) => any
            ) {
              try {
                const async = wrap(iterator);
                let result = await async.next();
                while (!result.done) result = await async.next();
                return resolve ? resolve(result.value) : result.value;
              } catch (error) {
                if (!reject) throw error;
                return reject(error);
              }
            },
          });
          return iterator;
        };
      },
    });

  return new Proxy(
    {},
    { get: (_, method: keyof Database) => scope(method) }
  ) as Persistence;
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

/// Put strategies here with their resolving functions

type Database = Partial<{
  playlists: Partial<{
    create(name: string): Promise<void>;
    get(title: string): Promise<PlaylistDetails>;

    push(tracks: TrackDetails[], playlist?: number): Promise<void>;
    purge(entries: number[]): Promise<void>;
  }>;
  settings: Partial<{
    store(key: string, value: unknown, collection?: string): Promise<void>;
    lookup(value: unknown, collection?: string): Promise<string>;
    extract(key: string, collection?: string): Promise<any>;
  }>;
  history: Partial<{
    get(): Promise<{ query: string; date: number }[]>;
    log(query: string): Promise<void>;
  }>;
  tracks: Partial<{
    get(id: number): Promise<TrackDetails>;
  }>;
  artists: Partial<{
    get(id: number): Promise<ArtistDetails>;
  }>;
}>;

type Persistence<T = Database> = Required<{
  [K in keyof T]: T[K] extends ((...args: infer A) => infer R) | undefined
    ? (
        ...args: A
      ) => ReturnType<typeof async<Awaited<R>>> & PromiseLike<Awaited<R>>
    : Persistence<T[K]>;
}>;

type Method = {
  [K in keyof Database]-?: `${K}.${Exclude<
    keyof NonNullable<Database[K]>,
    symbol
  >}`;
}[keyof Database];

type User = {
  name: string;
  [key: string]: any;
};

export type { Database, User };
export { persistence, users };
