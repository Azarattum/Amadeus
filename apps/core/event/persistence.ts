import type {
  Database,
  Method,
  Persistence,
  Strategy,
  User,
} from "./persistence.types";
import type { Reject, Resolve } from "libfun/monad/monad.types";
import { persistence as database, users as load } from "./pool";
import type { Handler } from "libfun/pool/pool.types";
import { all } from "@amadeus-music/util/async";
import { merge } from "@amadeus-music/protocol";
import type { Context } from "../plugin/types";
import { wrn } from "../status/log";
import { wrap } from "libfun/pool";
import { async } from "libfun";

const rejected = (reason: unknown) =>
  wrn("Persistence provider has failed.", reason || "");

const flatten: Strategy = (x) => all(x, rejected).then((x) => x.flat());
const voided: Strategy = (x) => all(x, rejected).then(() => undefined);
const raced: Strategy = (x) => Promise.any(x);
const merged: Strategy = (x) =>
  all(x, rejected).then((x) => x.reduce((a, b) => merge(a, b)));
const dated: Strategy = (x) =>
  all(x, rejected).then((x) => x.flat().sort((a, b) => b.date - a.date));
const composed: Strategy = (x) =>
  all(x, rejected).then((x) => () => x.forEach((fn) => fn()));

const strategies: { [K in Method]?: Strategy } = {
  "library.banned": flatten,
  "settings.extract": raced,
  "artists.search": flatten,
  "library.sample": flatten,
  "tracks.search": flatten,
  "albums.search": flatten,
  "settings.lookup": raced,
  "playlists.get": merged,
  "resources.get": merged,
  "library.get": flatten,
  "artists.get": merged,
  "albums.get": merged,
  "tracks.get": merged,
  "history.get": dated,
  "feed.get": flatten,
  subscribe: composed,
};

function persistence(this: Context, user?: string): Persistence;
function persistence(this: Context, pool: Handler<() => Database>): void;
function persistence(this: Context, arg?: string | Handler<() => Database>) {
  if (typeof arg === "function") return database.bind(this)(arg);
  const group = this?.group || "settings";
  const connect = () => async(database.bind(this)(arg).then());

  function resolve(scope: string, method?: string) {
    const target = (method ? `${scope}.${method}` : scope) as Method;
    function* generate(...args: any[]) {
      const dbs = yield* connect();
      const fns = dbs
        .map<(..._: any[]) => Promise<unknown>>((x: any) =>
          method ? x[scope]?.[method] : x[scope]
        )
        .filter((x) => x);
      if (!fns.length) throw new Error(`${target} is not implemented!`);
      if (scope === "settings") args.push(group);

      const promises = fns.map((x) => x(...args));
      const strategy = strategies[target] || voided;
      return yield* async(strategy(promises));
    }

    return (...args: any[]) => {
      const iterator = generate(...args);
      Object.assign(iterator, {
        async then(resolve?: Resolve<any>, reject?: Reject) {
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
  }

  return new Proxy(
    {},
    {
      get: (_, scope: string) =>
        new Proxy((...args: any[]) => resolve(scope)(...args), {
          get: (_, method: string) => resolve(scope, method),
        }),
    }
  ) as Persistence;
}

function users(this: Context): Promise<Record<string, User>>;
function users(this: Context, pool: Handler<() => Record<string, User>>): void;
async function users(
  this: Context,
  pool?: Handler<() => Record<string, User>>
) {
  if (pool) return load.bind(this)(pool);
  const results = load.bind(this)();
  let merged = (await results.next()).value || {};
  for await (const result of results) merged = merge(merged, result);
  return merged;
}

export { persistence, users };
