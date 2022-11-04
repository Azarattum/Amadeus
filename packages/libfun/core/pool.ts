import type { Handler, Options, Pool, Pools } from "./pool.types";
import { merge, wrap } from "./iterator";
import type { Fn } from "./types";

/// TODO: feature list
//    + name
//    + concurrency
//    + rate limits
//    - group limits
//    - abort (fetch, tg, async, monads)
//    - catch error handling

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

const defaults: Options = {
  concurrency: Infinity,
  signal: undefined,
  group: undefined,
  rate: Infinity,
  cache: 0,
};

const state = Symbol();
const delay = (ms: number) => new Promise((x) => setTimeout(x, ms));

function pools(options: Partial<Options> = {}): Pools {
  options = { ...defaults, ...options };
  const all = new Map<string, Pool>();
  function each<T extends keyof Omit<Pool, symbol>>(method: T) {
    return function (...args: Parameters<Pool[T]>) {
      return Array.from(all.values()).map((x) =>
        x[method](...(args as [any]))
      ) as ReturnType<Pool[T]>[];
    };
  }

  const proto: ThisType<Pool<Fn>> = {
    abort() {
      /// TODO
    },
    drain() {
      this.abort();
      /// TODO: SOMEHOW CANCEL ALL THE PENDING EVENTS
      //  maybe?:
      //   this[state].executing = 0;
      //   this[state].last = new Date();
    },
    close() {
      this[state].listeners.clear();
      this.drain();
      all.delete(this[state].id);
    },
    status() {
      return this[state];
    },
    catch() {
      /// TODO
    },
  };

  return {
    abort: each("abort"),
    drain: each("drain"),
    close: each("close"),
    catch: each("catch"),
    count: () => all.size,
    status: (id?: string) => {
      if (id == null) return each("status");
      const status = all.get(id)?.status();
      if (!status) throw new Error(`Pool with id ${id} not found!`);
      return status as any;
    },
    pool: pool.bind({ all, options, proto }) as any,
  };
}

function pool<T extends Fn = () => void>(
  this: { all: Map<string, Pool>; options: Partial<Options>; proto: object },
  id: string,
  options: Options = {} as Options
): Pool<T> {
  const { all, proto } = this;
  const existing = all.get(id);
  if (existing) return existing;
  options = { ...this.options, ...options };

  const data: Pick<Pool, symbol> = {
    [state]: {
      id,
      executing: 0,
      last: new Date(0),
      listeners: new Set(),
      ...options,
    },
  };

  function apply(this: typeof data, ...params: [Handler<T>] | any[]) {
    const self = this[state];
    // Register a new handler
    if (params.length === 1 && typeof params[0] === "function") {
      self.listeners.add(params[0]);
      all.set(id, pool);
      return () => self.listeners.delete(params[0]);
    }

    // Call all event handlers
    return block.bind(self)(() => {
      self.executing += 1;
      const generators = [...self.listeners.values()];
      const iterables = generators.map((x) =>
        wrap(x(...(params as Parameters<T>)))
      );

      return (async function* () {
        yield* merge(...iterables);
        self.executing -= 1;
        self.last = new Date();
      })();
    });
  }

  Object.setPrototypeOf(proto, Function);
  const pool = Object.setPrototypeOf(apply.bind(data), proto);
  Object.assign(pool, data);
  return pool;
}

/**
 * Clears an execution stack of a given function (using setTimeout)
 * @param func Function to unstack
 */
function unstack<T extends Fn>(
  func: T
): (...args: Parameters<T>) => Promise<ReturnType<T>> {
  return (...args: Parameters<T>) =>
    new Promise<ReturnType<T>>((resolve) => {
      setTimeout(() => {
        resolve(func(...args));
      }, 0);
    });
}

function block<T extends AsyncGenerator>(
  this: Pool[symbol],
  resolve: () => T
): T {
  // Try calling synchronously
  if (this.executing < this.concurrency) return resolve();
  const interval = 60000 / this.rate;
  const elapsed = Date.now() - +this.last;

  // Otherwise wait and try again
  const self = block.bind(this);
  return (async function* () {
    await delay(Math.max(30, interval - elapsed));
    /// FIXME: unwrapping lots of generators might be bad performance wise...
    yield* await unstack(self)(resolve);
  })() as T;
}

export { pools };
