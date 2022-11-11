import type { Handler, Options, Pool, Pools } from "./pool.types";
import { context as globalContext } from "./iterator";
import { block, merge, wrap } from "./iterator";
import type { Fn } from "./types";

/// TODO: feature list
//    + id
//    + concurrency
//    + rate limits
//    / group limits
//    + abort
//    - catch error handling
//    - groups
//        - context based inheritance

const defaults: Options = {
  concurrency: Infinity,
  rate: Infinity,
  cache: 0,
};

const state = Symbol();

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

  const proto: Pick<Pool, keyof Pool> = {
    abort() {
      this[state].executing.forEach((x) => x.controller.abort());
      this[state].executing.clear();
    },
    drain() {
      this[state].pending.forEach((x) => x.controller.abort());
      this[state].pending.clear();
      this.abort();
    },
    close() {
      this[state].listeners.clear();
      this.drain();
      all.delete(this[state].id);
    },
    status() {
      return this[state];
    },
    catch(handler) {
      /// TODO
    },
    schedule(when) {
      /// TODO
      throw new Error("Unimplemented!");
    },
  };

  return {
    schedule: each("schedule"),
    abort: each("abort"),
    drain: each("drain"),
    close: each("close"),
    catch: each("catch"),
    count: () => all.size,
    status: (id?: string) => {
      if (id == null) return each("status")();
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
      pending: new Set(),
      executing: new Set(),
      listeners: new Set(),
      ...options,
    },
  };

  function apply(...params: [Handler<T>] | any[]) {
    const self = data[state];
    // Register a new handler
    if (params.length === 1 && typeof params[0] === "function") {
      self.listeners.add(params[0]);
      all.set(id, pool);
      return () => self.listeners.delete(params[0]);
    }

    // Call all event handlers
    const executor = { controller: new AbortController() };
    const context = { signal: executor.controller.signal };
    globalContext.signal?.addEventListener("abort", () =>
      executor.controller.abort()
    );

    self.pending.add(executor);
    return block(
      () => {
        context.signal.throwIfAborted();
        const interval = 60000 / self.rate;
        const left = interval - (Date.now() - +(self.last || new Date(0)));
        if (self.executing.size < self.concurrency && left <= 0) return true;
        return Math.max(left, 30);
      },
      () => {
        self.pending.delete(executor);
        self.executing.add(executor);
        self.last = new Date();
        const generators = [...self.listeners.values()];
        const iterables = generators.map((x) =>
          wrap(x.bind(context)(...(params as Parameters<T>)), context.signal)
        );

        return (async function* () {
          yield* merge(...iterables);
          self.executing.delete(executor);
        })();
      }
    );
  }

  Object.setPrototypeOf(proto, Function);
  const pool = Object.setPrototypeOf(apply, proto);
  Object.assign(pool, data);
  return pool;
}

export { pools };
