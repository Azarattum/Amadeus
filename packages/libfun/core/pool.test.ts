import { all, async, context, map } from "./iterator";
import { PoolError, pools } from "./pool";
import { expect, it, vi } from "vitest";
import type { Fn } from "./types";

const { pool, count, status } = pools({ group: "test" });
const delay = (ms = 1) => new Promise((x) => setTimeout(x, ms));
const barrier = () => {
  let resolve: () => void = () => {};
  const promise = new Promise<void>((r) => (resolve = r));
  return { resolve, promise };
};

it("fires events", () => {
  const event = pool<(_: number) => void>("event");

  const callback = vi.fn(function* (x) {
    expect(x).toBe(42);
  });

  const unsubscribe = event(callback);
  event(42);
  expect(callback).toBeCalledTimes(1);
  event(42);
  expect(callback).toBeCalledTimes(2);
  unsubscribe();
  event(42);
  expect(callback).toBeCalledTimes(2);
  event.close();
});

it("yields results", async () => {
  const double = pool<(_: number) => number>("event");
  double(function* (x) {
    yield x * 2;
  });

  expect(await all(double(4))).toEqual([8]);
  double.close();
});

it("registers globally", () => {
  const impl = vi.fn(function* () {});

  const event = pool("event");
  expect(count()).toBe(0);
  event(impl);
  event();
  expect(impl).toBeCalledTimes(1);
  expect(count()).toBe(1);
  event.close();
  expect(count()).toBe(0);

  event();
  expect(impl).toBeCalledTimes(1);

  event(impl);
  event();
  expect(impl).toBeCalledTimes(2);

  expect(count()).toBe(1);
  event.close();
  expect(count()).toBe(0);
});

it("reports status", () => {
  const a = pool("a");
  const b = pool("b");

  expect(a.status().id).toBe("a");
  expect(b.status().id).toBe("b");
  expect(a.status().executing.size).toBe(0);
  expect(b.status().executing.size).toBe(0);
  expect(status()).toHaveLength(0);
  a(function* () {});
  expect(status()).toHaveLength(1);
  b(function* () {});
  expect(status()).toHaveLength(2);
  expect(status()).toMatchObject([{ id: "a" }, { id: "b" }]);
});

it("limits concurrency", async () => {
  let resolve: (_?: unknown) => void = () => {};
  const impl = vi.fn(function* () {
    yield* async(new Promise((x) => (resolve = x)));
    yield 42;
  });

  const event = pool<() => number>("event", {
    concurrency: 1,
  });

  event(impl);
  expect(impl).not.toHaveBeenCalled();
  expect(all(event())).resolves.toEqual([42]);
  expect(impl).toHaveBeenCalledTimes(1);
  expect(all(event())).resolves.toEqual([]);
  expect(impl).toHaveBeenCalledTimes(1);
  resolve();
  await delay(100);
  expect(impl).toHaveBeenCalledTimes(2);
  event.close();
});

it("rates calls per minute", async () => {
  const resolve: Fn[] = [];
  const impl = vi.fn(function* () {
    yield* async(new Promise((x) => resolve.push(x)));
    yield 42;
  });
  const event = pool<() => number>("event", {
    rate: 1200,
  });

  event(impl);
  expect(impl).not.toHaveBeenCalled();
  expect(all(event())).resolves.toEqual([42]);
  expect(impl).toHaveBeenCalledTimes(1);
  expect(all(event())).resolves.toEqual([42]);
  expect(impl).toHaveBeenCalledTimes(1);
  await delay(10);
  expect(impl).toHaveBeenCalledTimes(1);
  await delay(100);
  expect(impl).toHaveBeenCalledTimes(2);

  resolve.map((x) => x());
  await delay();
  event.close();
});

it("establishes asynchronous workflow", async () => {
  const event = pool<() => number>("event");

  event(function* () {
    const value = yield* async(Promise.resolve("1"));
    yield Number.parseInt(value);
    yield Promise.resolve(2);
    yield Promise.resolve(3);
    yield 4;
  });

  const results = all(event());
  expect(await results).toEqual([1, 2, 3, 4]);
  event.close();
});

it("can be aborted", async () => {
  const { resolve, promise } = barrier();
  const spy = vi.fn();

  const event = pool("event");
  event(function* () {
    yield* async(promise);
    spy();
  });

  const loading = all(event());
  await delay();
  event.abort();
  await loading.catch((e) => expect(e).toBeInstanceOf(Error));
  resolve();
  await delay();
  expect(spy).not.toHaveBeenCalled();
  event.close();
});

it("supports nested generators", async () => {
  const numbers = pool<() => number>("numbers");
  numbers(function* () {
    yield* [1, 2, 3];
  });

  const doubled = pool<() => number>("doubled");
  doubled(function* () {
    const squared = yield* map(numbers(), function* (x) {
      yield Promise.resolve(x * 2);
      return yield* async(Promise.resolve(x * x));
    });
    yield* squared;
  });

  expect(await all(doubled())).toEqual([2, 4, 6, 1, 4, 9]);
  numbers.close();
  doubled.close();
});

it("resolves signal context", async () => {
  const fetch = function* () {
    const awaited = yield* async(Promise.resolve(context.signal));
    return awaited;
  };

  const event = pool<() => AbortSignal | undefined>("event");
  event(function* () {
    const stuff = yield* fetch();
    yield stuff;
  });

  const result = await all(event());
  expect(result).toHaveLength(1);
  expect(result[0]).toBeInstanceOf(AbortSignal);
  event.close();
});

it("aborts nested pools", async () => {
  const unreachable = vi.fn();
  {
    const { resolve, promise } = barrier();
    const numbers = pool<() => number>("numbers");
    numbers(function* () {
      yield 10;
      yield* async(promise);
      unreachable();
      yield 42;
    });

    const doubled = pool<() => number>("doubled");
    doubled(function* () {
      yield* map(numbers(), function* (x) {
        yield x;
      });
      unreachable();
    });

    const result = doubled();
    await result.next();
    expect(result.next()).resolves.toEqual({ value: undefined, done: true });
    doubled.close();
    resolve();
    await delay();
    numbers.close();
  }
  {
    const { resolve, promise } = barrier();
    const numbers = pool<() => number>("numbers");
    numbers(function* () {
      yield 10;
      yield* async(promise);
      unreachable();
      yield 42;
    });

    const doubled = pool<() => number>("doubled");
    doubled(function* () {
      const generator = numbers();
      yield (yield* async(generator.next())).value;
      (yield* async(generator.next())).value;
      unreachable();
    });

    const result = doubled();
    await result.next();
    expect(result.next()).resolves.toEqual({ value: undefined, done: true });
    doubled.close();
    resolve();
    await delay();
    numbers.close();
  }
  expect(unreachable).not.toHaveBeenCalled();
});

it("supports synchronous non-generator handlers", async () => {
  const event = pool<(x: number) => number>("event");
  event((x) => 42 * x);

  const iterator = event(2);
  expect(await iterator.next()).toEqual({ value: 84, done: false });
  expect(await iterator.next()).toEqual({ value: undefined, done: true });
  event.close();
});

it("catches thrown exceptions", async () => {
  const event = pool<() => number>("event");
  event(function* () {
    yield 1;
    throw 2;
    yield 3;
  });
  event(function* () {
    yield 10;
    yield 11;
    yield 12;
  });

  const handler = vi.fn((error: PoolError) => {
    expect(error).toBeInstanceOf(PoolError);
    expect(error.pool).toBe("event");
    expect(error.caller).toBe("test");
    expect(error.handler).toBe("test");
  });
  event.catch(handler);
  expect(await all(event())).toEqual([1, 10, 11, 12]);
  expect(handler).toHaveBeenCalledTimes(1);
  event.close();
});

it("catches with global handler", async () => {
  const space = pools();
  const handler = vi.fn((error: PoolError) => {
    expect(error).toBeInstanceOf(PoolError);
    expect(error.pool).toBe("event");
    expect(error.caller).toBeUndefined();
    expect(error.handler).toBeUndefined();
  });
  space.catch(handler);

  const event = space.pool("event");
  event(() => {
    throw new Error(1 as any);
  });
  expect(await all(event())).toEqual([]);
  expect(handler).toHaveBeenCalledTimes(1);
  event.close();
});

it("catches async rejections", async () => {
  const event = pool<() => number>("event");
  event(function* () {
    yield 1;
    yield* async(Promise.reject());
    yield 2;
  });
  event.catch();
  expect(await all(event())).toEqual([1]);
});
