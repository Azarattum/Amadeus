import type {
  Override,
  Catcher,
  Handler,
  Options,
  Pools,
  Pool,
} from "./pool.types";
import {
  context as globalContext,
  generate,
  block,
  merge,
  wrap,
} from "./iterator";
import { PoolError } from "./error";
import type { Fn } from "./types";

/// TODO: feature list
//    + id
//    + concurrency
//    + rate limits
//    / group limits
//    + abort
//    + catch error handling
//   +- groups
//    - request caching

const defaults: Options = {
  concurrency: Infinity,
  rate: Infinity,
  cache: 0,
};

const state = Symbol();

function pools(options: Partial<Options> = {}): Pools {
  const globals = { ...defaults, ...options };
  const all = new Map<string, Pool>();
  const catchers = new Set<Catcher>();

  /// Add group[handler/executor]/id filtering
  function each<T extends keyof Omit<Pool, symbol>>(method: T) {
    return function (...args: Parameters<Pool[T]>) {
      return Array.from(all.values()).map((x) =>
        x[method](...(args as [any]))
      ) as ReturnType<Pool[T]>[];
    };
  }

  const prototype: Pick<Pool, keyof Pool> = {
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
      this[state].catchers.add(handler || (() => {}));
    },
    schedule(when) {
      /// TODO
      throw new Error("Unimplemented!");
    },
  };
  Object.setPrototypeOf(prototype, Function);

  function create(this: Override, id: string, options: Partial<Options> = {}) {
    return pool.bind(this, { all, prototype, catchers, options: globals })(
      id,
      options
    );
  }

  return {
    schedule: each("schedule"),
    abort: each("abort"),
    drain: each("drain"),
    close: each("close"),
    count: () => all.size,
    catch(handler) {
      catchers.add(handler || (() => {}));
    },
    status(id?: string) {
      if (id == null) return each("status")();
      const status = all.get(id)?.status();
      if (!status) throw new Error(`Pool with id ${id} not found!`);
      return status as any;
    },
    pool: create,
  };
}

function pool<T extends Fn = () => void>(
  this: Override,
  global: {
    options: Options;
    prototype: object;
    all: Map<string, Pool>;
    catchers: Set<Catcher>;
  },
  id: string,
  options: Partial<Options> = {}
): Pool<T> {
  const existing = global.all.get(id);
  if (existing) return existing;

  options.group = options.group || this?.group;
  const data: Pick<Pool, symbol> = {
    [state]: {
      id,
      pending: new Set(),
      catchers: new Set(),
      executing: new Set(),
      listeners: new Set(),
      ...global.options,
      ...options,
    },
  };

  function apply(this: Override, ...params: [Handler<T>] | any[]) {
    const self = data[state];
    const group = this?.group || self.group;
    // Register a new handler
    if (params.length === 1 && typeof params[0] === "function") {
      if (!("group" in params[0])) params[0].group = group;
      self.listeners.add(params[0]);
      global.all.set(id, pool);
      return () => self.listeners.delete(params[0]);
    }

    // Call all event handlers
    /// Implement a proper caller->handler group support ↓
    const executor = { controller: new AbortController() };
    const context = { signal: executor.controller.signal };
    globalContext.signal?.addEventListener("abort", () =>
      executor.controller.abort()
    );
    const catcher = (handler?: string) => (reason: Error) => {
      if (reason instanceof DOMException && reason.name === "AbortError") {
        return;
      }
      const error = new PoolError(reason, {
        caller: group,
        pool: id,
        handler,
      });

      if (!self.catchers.size && !global.catchers.size) throw error;
      global.catchers.forEach((x) => x(error));
      self.catchers.forEach((x) => x(error));
    };

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
        const iterables = generators.map((handler) =>
          wrap(
            generate(handler.bind(context)(...params)),
            /// Should receive individual signals!
            context.signal,
            catcher(handler.group)
          )
        );

        return (async function* () {
          yield* merge(...iterables);
          self.executing.delete(executor);
        })();
      },
      catcher()
    );
  }

  const pool = Object.setPrototypeOf(apply, global.prototype);
  Object.assign(pool, data);
  /// Add a proper bind
  return pool;
}

export { pools, PoolError };
