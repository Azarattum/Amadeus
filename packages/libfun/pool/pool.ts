import type {
  PoolError as Details,
  Override,
  Catcher,
  Handler,
  Options,
  Pools,
  Pool,
  Executor,
  Filter,
} from "./pool.types";
import {
  context as globalContext,
  generate,
  merge,
  reuse,
  wrap,
} from "./iterator";
import { derive, block, delay } from "../utils/async";
import type { Fn } from "../utils/types";
import { handle } from "../utils/error";

const defaults: Options = {
  concurrency: Infinity,
  timeout: Infinity,
  rate: Infinity,
  cache: 0,
};

const state = Symbol();

function pools(options: Partial<Options> = {}): Pools {
  const globals = { ...defaults, ...options };
  const all = new Map<string, Pool>();
  const catchers = new Set<Catcher>();

  function each<T extends keyof Omit<Pool, symbol>>(method: T) {
    return function (id?: string | null, ...args: Parameters<Pool[T]>): any {
      if (id == null || id == "*") {
        return Array.from(all.values()).map((x) =>
          x[method](...(args as [any]))
        );
      }

      const target = all.get(id);
      if (!target) throw new Error(`Pool with id ${id} not found!`);
      return target[method](...(args as [any]));
    };
  }

  const prototype: Pick<Pool, keyof Pool> = {
    abort(filter) {
      this[state].executing.forEach((executor) => {
        match(executor, filter).forEach((x) => {
          x.controller.abort();
          this[state].executing.delete(x as Executor);
        });
      });
    },
    drain(filter) {
      this[state].pending.forEach((executor) => {
        match(executor, filter).forEach((x) => {
          x.controller.abort();
          this[state].pending.delete(x as Executor);
        });
      });
      this.abort(filter);
    },
    close(filter) {
      const { listeners } = this[state];
      listeners.forEach((x) => {
        if (!filter) listeners.delete(x);
        if (filter?.group && x.group === filter.group) listeners.delete(x);
        if (filter?.handler && x.group === filter.handler) listeners.delete(x);
      });
      this.drain(filter);
      if (!listeners.size) all.delete(this[state].id);
    },
    status() {
      return this[state];
    },
    catch(handler) {
      this[state].catchers.add(handler || (() => {}));
    },
    schedule(when) {
      const self = this as Pool;
      let time =
        when.absolute === undefined
          ? Date.now() + when.relative
          : when.absolute;

      return async function* (...args) {
        const now = Date.now();
        if (time > now) {
          await delay(time - now);
          yield* self(...args);
        }
        while (when.interval && all.has(self[state].id)) {
          const now = Date.now();
          if (time <= now) {
            const times = Math.max(Math.ceil((now - time) / when.interval), 1);
            time += times * when.interval;
          }
          await delay(time - now);
          yield* self(...args);
        }
      };
    },
    where(group) {
      const self = this as Pool;
      return self.bind({ filter: group } as any);
    },
    bind(context: Override) {
      const fn = Function.bind.call(this as any, context);
      const pool = Object.setPrototypeOf(fn, prototype);
      return Object.assign(pool, { [state]: this[state] });
    },
  };
  Object.setPrototypeOf(prototype, Function);

  return {
    schedule: each("schedule"),
    status: each("status"),
    abort: each("abort"),
    drain: each("drain"),
    close: each("close"),
    where: each("where"),
    count: () => all.size,
    catch(handler) {
      catchers.add(handler || (() => {}));
    },
    pool(this: Override, id: string, options: Partial<Options> = {}) {
      return pool.bind(this, { all, prototype, catchers, options: globals })(
        id,
        options
      ) as any;
    },
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
  if (this?.scope) id = `${this.scope}/${id}`;
  const existing = global.all.get(id);
  if (existing) return existing as Pool<T>;

  options.group = options.group || this?.group || global.options.group;
  const data: Pick<Pool, symbol> = {
    [state]: {
      id,
      cached: new Map(),
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
    const filter = (handler: Handler<any>) =>
      !(this as any)?.filter || handler.group === (this as any)?.filter;

    // Register a new handler
    if (params.length === 1 && typeof params[0] === "function") {
      if (!("group" in params[0])) params[0].group = group;
      self.listeners.add(params[0]);
      global.all.set(id, pool);
      return () => self.listeners.delete(params[0]);
    }

    // Call all event handlers
    const executor: Executor = {
      controller: derive(globalContext.signal),
      tasks: new Set(),
      group,
    };
    const trace = [...globalContext.trace, self.id];
    const context = { signal: executor.controller.signal };
    const catcher = (handler?: string) => (reason: Error) => {
      if (reason instanceof DOMException && reason.name === "AbortError") {
        return;
      }
      const error = new PoolError(reason, {
        caller: group,
        pool: id,
        handler,
        trace,
      });

      if (!self.catchers.size && !global.catchers.size) throw error;
      global.catchers.forEach((x) => x(error));
      self.catchers.forEach((x) => x(error));
    };

    self.pending.add(executor);
    return block(
      () => {
        if (context.signal.aborted) self.pending.delete(executor);
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
        const iterables = () =>
          generators.filter(filter).map((handler) => {
            const task = {
              group: handler.group,
              controller: derive(context.signal),
            };
            try {
              const generator = wrap(
                generate(handler.bind(context)(...params)),
                task.controller.signal,
                catcher(task.group),
                self.id
              );

              return (async function* () {
                executor.tasks.add(task);
                yield* generator;
                executor.tasks.delete(task);
              })();
            } catch (error) {
              task.controller.abort();
              return handle(
                error,
                catcher(task.group),
                (async function* () {})()
              );
            }
          });

        const iterable = () => merge(...iterables());
        const key = self.cache ? JSON.stringify(params) : "";
        const cached = reuse(iterable, self.cached, key, self.cache);

        let timeout = undefined;
        if (Number.isFinite(self.timeout)) {
          timeout = setTimeout(() => executor.controller.abort(), self.timeout);
        }
        return (async function* () {
          try {
            yield* cached;
          } finally {
            executor.controller.abort();
            self.executing.delete(executor);
            clearTimeout(timeout);
          }
        })();
      },
      catcher()
    );
  }

  const pool = Object.setPrototypeOf(apply, global.prototype);
  Object.assign(pool, data);
  return pool;
}

function match(executor: Executor, filter?: Filter) {
  if (!filter) return [executor];
  if (filter.group && executor.group === filter.group) {
    return [executor];
  }
  if (filter.caller && executor.group === filter.caller) {
    return [executor];
  }
  return [...executor.tasks.values()].filter((x) => {
    if (filter.group && x.group === filter.group) return true;
    if (filter.handler && x.group === filter.handler) return true;
  });
}

class PoolError extends Error implements Details {
  pool: string;
  reason: string;
  caller?: string;
  handler?: string;
  trace: string[] = [];

  constructor(error: Error, details: Omit<Details, "reason">) {
    super(error.message);
    this.name = "PoolError";
    this.pool = details.pool;
    this.cause = error.cause;
    this.trace = details.trace;
    this.caller = details.caller;
    this.handler = details.handler;
    this.message += `\n    trace: ${this.trace.join(" -> ")}`;
    this.reason = error instanceof PoolError ? error.reason : error.message;
    if (this.caller === this.handler) {
      this.message =
        `${this.pool.toUpperCase()} in ${(
          this.handler || "unknown"
        ).toUpperCase()} ` + `failed with: ${this.message}`;
    } else {
      this.message =
        `${(
          this.caller || "unknown"
        ).toUpperCase()} pooled ${this.pool.toUpperCase()}` +
        (this.handler ? ` in ${this.handler.toUpperCase()}` : "") +
        `, but failed with: ${this.message}`;
    }
    this.stack = error.stack
      ?.replace(error.name, this.name)
      .replace(error.message, this.message);
  }
}

export { pools, PoolError };
