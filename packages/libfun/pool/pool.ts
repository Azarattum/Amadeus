import type {
  PoolError as Details,
  Override,
  Executor,
  Catcher,
  Handler,
  Options,
  Result,
  Filter,
  Pools,
  Pool,
  Ctx,
} from "./pool.types";
import {
  context as globalContext,
  generate,
  merge,
  reuse,
  take,
  wrap,
} from "./iterator";
import { cleanup, derive, cancel, block, delay } from "../utils/async";
import type { Resolve, Reject } from "../monad/monad.types";
import type { Fn } from "../utils/types";
import { handle } from "../utils/error";

const defaults: Options<any> = {
  concurrency: Infinity,
  timeout: Infinity,
  transform: merge,
  rate: Infinity,
  cache: 0,
};

const then = function (
  this: AsyncGenerator<any>,
  resolve?: Resolve<any[]>,
  reject?: Reject,
) {
  return take(this).then(resolve, reject);
};

const state = Symbol();

function pools(options: Partial<Options<any>> = {}): Pools {
  const globals = { ...defaults, ...options };
  const contexts = new Map<string, Ctx>();
  const all = new Map<string, Pool>();
  const catchers = new Set<Catcher>();

  function each<T extends keyof Omit<Pool, symbol>>(method: T) {
    return function (id?: string | null, ...args: Parameters<Pool[T]>): any {
      if (id == null || id == "*") {
        return Array.from(all.values()).map((x) =>
          x[method](...(args as [any])),
        );
      }

      const target = all.get(id);
      if (!target) throw new Error(`Pool with id ${id} not found!`);
      return target[method](...(args as [any]));
    };
  }

  type ProtoPool = Pool<Fn<unknown[], unknown>, Record<string, any>>;
  const prototype: Pick<ProtoPool, keyof ProtoPool> = {
    split() {
      const group = (this as any).group || this[state].group;
      return (...args: any[]) => {
        const results = new Map();
        const groups = new Set(
          [...this[state].listeners]
            .map((x) => x.group as string)
            .filter((x) => x),
        );
        const executor: Executor = {
          controller: derive(globalContext.signal),
          tasks: new Set(),
          group,
        };
        executor.controller.signal.addEventListener(
          "abort",
          () => {
            this[state].pending.delete(executor);
            this[state].executing.delete(executor);
          },
          { once: true },
        );

        let running = 0;
        groups.forEach((filter) => {
          const context = { filter, group };
          const generator = (this as any).bind(context)(...args);
          const current = generator.executor as Executor;

          const abort = () => (current.controller.abort(), remove());
          const remove = () => {
            executor?.controller.signal.removeEventListener("abort", abort);
            current.controller.signal.removeEventListener("abort", remove);
            if (!--running) executor.controller.abort();
          };
          executor.controller.signal.addEventListener("abort", abort);
          current.controller.signal.addEventListener("abort", remove);
          current.tasks.forEach((x) => executor?.tasks.add(x));
          current.tasks = executor.tasks;
          generator.executor = executor;
          if (this[state].pending.delete(current)) {
            this[state].pending.add(executor);
          }
          if (this[state].executing.delete(current)) {
            this[state].executing.add(executor);
          }

          running += 1;
          results.set(filter, generator);
        });

        return results;
      };
    },
    schedule(when) {
      const group = (this as any).group || this[state].group;
      const self = this as ProtoPool;
      let time =
        when.absolute === undefined
          ? Date.now() + when.relative
          : when.absolute;

      return function (...args: any[]) {
        const executor = {
          controller: derive(),
          tasks: new Set(),
          group,
        } satisfies Executor;

        async function* run() {
          const originalSignal = globalContext.signal;
          globalContext.signal = executor.controller.signal;
          const generator = self(...args);
          globalContext.signal = originalSignal;
          yield* generator;
        }

        const generator = (async function* () {
          try {
            while (all.has(self[state].id)) {
              const now = Date.now();
              if (when.interval && time <= now) {
                const times = Math.max(
                  Math.ceil((now - time) / when.interval),
                  1,
                );
                time += times * when.interval;
              }
              if (time >= now) {
                await cancel(
                  delay(time - now, executor.controller.signal),
                  executor.controller.signal,
                );
                yield* run();
              }
              if (!when.interval) break;
            }
          } catch (error) {
            handle(error, (error) => {
              if (
                error instanceof DOMException &&
                error.name === "AbortError"
              ) {
                return;
              }
              throw error;
            });
          }
        })();

        return Object.assign(generator, { executor, then });
      };
    },
    close(filter) {
      const { listeners, catchers, cached } = this[state];
      listeners.forEach((x) => {
        if (!filter) listeners.delete(x);
        if (filter?.group && x.group === filter.group) listeners.delete(x);
        if (filter?.handler && x.group === filter.handler) listeners.delete(x);
      });
      this.drain(filter);
      if (!listeners.size) {
        all.delete(this[state].id);
        cached.clear();
        catchers.clear();

        for (const group of contexts.keys()) {
          const obsolete = [...all.values()].every(
            (x) =>
              x[state].group !== group &&
              (x as any).group !== group &&
              [...x[state].listeners].every((y) => y.group !== group),
          );
          if (obsolete) contexts.delete(group);
        }
      }
    },
    bind(context: Override) {
      if (context?.context) {
        const group =
          context?.group || (this as any).group || this[state].group;
        if (!group) throw new Error("Cannot set a context without a group!");
        const data = contexts.get(group) || {};
        contexts.set(group, Object.assign(data, context.context));
      }

      const self = this as any;
      const fn = function (this: any, ...args: any[]) {
        return Function.bind.call(self, { ...context, ...this })(...args);
      };
      const pool = Object.setPrototypeOf(fn, prototype);
      if (context?.group) pool.group = context.group;
      return Object.assign(pool, { [state]: this[state] });
    },
    where(filter) {
      const group = (this as any).group || this[state].group;
      const context = { filter, group };
      return Function.bind.call(this as any, context) as any;
    },
    drain(filter) {
      this[state].pending.forEach((executor) => {
        match(executor, filter).forEach((x) => x.controller.abort());
      });
      this.abort(filter);
    },
    abort(filter) {
      this[state].executing.forEach((executor) => {
        match(executor, filter).forEach((x) => x.controller.abort());
      });
    },
    catch(handler) {
      this[state].catchers.add(handler || (() => {}));
    },
    context(context) {
      this.bind({ group: "", context });
    },
    status() {
      return this[state];
    },
  };
  Object.setPrototypeOf(prototype, Function);

  return {
    pool(
      this: { scope?: string } & Override,
      id: string,
      options: Partial<Options<any>> = {},
    ) {
      return pool.bind(this, {
        options: globals,
        prototype,
        catchers,
        contexts,
        all,
      })(id, options) as any;
    },
    catch(handler) {
      catchers.add(handler || (() => {}));
    },
    schedule: each("schedule"),
    status: each("status"),
    count: () => all.size,
    abort: each("abort"),
    drain: each("drain"),
    close: each("close"),
    where: each("where"),
    split: each("split"),
    contexts,
  };
}

function pool<T extends Fn = () => void, R = never>(
  this: { scope?: string } & Override,
  global: {
    contexts: Map<string, Ctx>;
    all: Map<string, Pool>;
    catchers: Set<Catcher>;
    options: Options<Fn>;
    prototype: object;
  },
  id: string,
  options: Partial<Options<any>> = {},
): Pool<T, R> {
  if (this?.scope) id = `${this.scope}/${id}`;
  const existing = global.all.get(id);
  if (existing) return existing as Pool<T, R>;

  const transform = options.transform || global.options.transform;
  options.group = options.group || this?.group || global.options.group;
  const data: Pick<Pool, symbol> = {
    [state]: {
      executing: new Set(),
      listeners: new Set(),
      catchers: new Set(),
      pending: new Set(),
      cached: new Map(),
      id,
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
      try {
        self.catchers.forEach((x) => x(error));
        if (!self.catchers.size) throw error;
      } catch {
        global.catchers.forEach((x) => x(error));
      }
    };
    const generators = [...self.listeners.values()]
      .filter(filter)
      .map((handler) => ({
        handler: handler.bind({
          ...context,
          ...(handler.group ? global.contexts.get(handler.group) || {} : {}),
        }),
        task: {
          controller: derive(context.signal),
          group: handler.group,
        },
      }));

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
        const iterables = () =>
          generators.map(({ handler, task }) => {
            try {
              const generator = wrap<Result<ReturnType<T>>, void>(
                generate(handler(...params)),
                task.controller.signal,
                task.group,
                catcher(task.group),
                self.id,
              );

              return (async function* () {
                executor.tasks.add(task);
                yield* cleanup(generator, task.controller, () =>
                  executor.tasks.delete(task),
                );
              })();
            } catch (error) {
              task.controller.abort();
              return handle(
                error,
                catcher(task.group),
                (async function* () {})(),
              );
            }
          });

        const iterable = () =>
          transform(iterables(), {
            tasks: generators.map(({ task }) => task),
            controller: executor.controller,
            args: params as Parameters<T>,
            id,
          });
        const key = self.cache ? JSON.stringify(params) : "";
        const cached = reuse(iterable, self.cached, key, self.cache);

        let timeout: any = undefined;
        if (Number.isFinite(self.timeout)) {
          timeout = setTimeout(() => executor.controller.abort(), self.timeout);
        }
        return (async function* () {
          yield* cleanup(cached, executor.controller, () => {
            self.executing.delete(executor);
            clearTimeout(timeout);
          });
        })();
      },
      catcher(),
      { executor, then },
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
  trace: string[] = [];
  handler?: string;
  caller?: string;
  reason: string;
  pool: string;

  constructor(error: Error, details: Omit<Details, "reason">) {
    super(error.message);
    this.cause = error;
    this.name = "PoolError";
    this.pool = details.pool;
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

export { PoolError, pools };
