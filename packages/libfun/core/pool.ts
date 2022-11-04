import { merge, wrap } from "./iterator";
import type { Fn } from "./types";

/// TODO: feature list
//    + name
//    - concurrency
//    - rate limits
//    - module association
//    - abort (fetch, tg, async, monads)
//    - catch error handling

function pool<T extends Fn = () => void>(id: string) {
  const existing = pools[all].get(id);
  if (existing) return existing as Pool<T>;

  type Listener = Handler<T>;
  const listeners = new Set<Listener>();
  /// TODO: implement queue
  let queue = [];

  const handle = (...params: [Listener] | any[]) => {
    if (params.length === 1 && typeof params[0] === "function") {
      pools[all].set(id, pool);
      listeners.add(params[0]);
      return () => listeners.delete(params[0]);
    }

    const generators = [...listeners.values()];
    const iterables = generators.map((x) =>
      wrap(x(...(params as Parameters<T>)))
    );
    return merge(...iterables);
  };

  const abort = () => {
    /// TODO
  };

  const drain = () => {
    abort();
    queue = [];
  };

  const close = () => {
    listeners.clear();
    drain();
    pools[all].delete(id);
  };

  const status = () => {
    /// TODO
    return { id };
  };

  const catcher = (handler: Fn) => {
    /// TODO
  };

  const methods = { abort, close, drain, status, catch: catcher };
  const pool = Object.assign(handle, methods) as Pool<T>;
  pools[all].set(id, pool);
  return pool;
}

/** Global State */

const all = Symbol();
const pools = {
  [all]: new Map() as Pools,
  abort: () => each("abort"),
  drain: () => each("drain"),
  close: () => each("close"),
  /// TODO: add global catch
  get length() {
    return (this[all] as Pools).size;
  },
  status,
};

function each<T extends keyof Pool<any>>(
  method: T,
  ...args: any[]
): ReturnType<Pool<any>[T]>[] {
  return [...pools[all].values()].map((x) =>
    /// TODO: ↓ fix stuff here
    x[method](...args)
  ) as any;
}

function status(): PoolStatus[];
function status(id?: string): PoolStatus;
function status(id?: string) {
  if (id == null) return each("status");
  const status = pools[all].get(id)?.status();
  if (!status) throw new Error(`Pool with id ${id} not found!`);
  return status;
}

/// TODO: `fetch` generator
//    - error prone (log errors per module)
//    - auto superstruct validation
//    - maybe use gretchen
//    - auto json parse (mb when validated?)
//      - this should be type specific (e.g. do not json parse streams)
//
// Consider the API:
//  yield* fetch(User, "...");
// vs
//  yield* fetch("...").json(); ← gretchen under the hood
//  yield* fetch("...").as(User);

/** Type Definitions */

type Handler<T extends Fn> = (
  ...args: Parameters<T>
) => Generator<ReturnType<T>, void>;

type Pool<T extends Fn> = {
  (handler: Handler<T>): () => void;
  /// TODO:                 ↓ consider this to be an iterator instead
  (...args: Parameters<T>): AsyncGenerator<ReturnType<T>>;
  /// TODO:        ↓ narrow the type here
  catch: (handler: Fn) => void;
  status: () => PoolStatus;
  abort: () => void;
  close: () => void;
  drain: () => void;
};

type Pools = Map<string, Pool<any>>;

interface PoolStatus {
  id: string;
  /// TODO
}

/** Exports */

export { pool, pools };
export type { Handler, Pool };
