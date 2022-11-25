import { take, async, context, map, first } from "./iterator";
import { PoolError, pools } from "./pool";
import type { Fn } from "../utils/types";
import { expect, it, vi } from "vitest";
import { delay } from "../utils/async";

const { pool, count, status } = pools({ group: "test" });
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

  expect(await take(double(4))).toEqual([8]);
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
  expect(take(event())).resolves.toEqual([42]);
  expect(impl).toHaveBeenCalledTimes(1);
  expect(take(event())).resolves.toEqual([]);
  expect(impl).toHaveBeenCalledTimes(1);
  resolve();
  await delay(60);
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
  expect(take(event())).resolves.toEqual([42]);
  expect(impl).toHaveBeenCalledTimes(1);
  expect(take(event())).resolves.toEqual([42]);
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

  const results = take(event());
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

  const loading = take(event());
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

  expect(await take(doubled())).toEqual([2, 4, 6, 1, 4, 9]);
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

  const result = await take(event());
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
    expect(error.reason).toBe("2");
    expect(error.pool).toBe("event");
    expect(error.caller).toBe("test");
    expect(error.handler).toBe("test");
    expect(error.trace).toEqual(["event"]);
  });
  event.catch(handler);
  expect(await take(event())).toEqual([1, 10, 11, 12]);
  expect(handler).toHaveBeenCalledTimes(1);
  event.close();
});

it("catches with global handler", async () => {
  const space = pools();
  const handler = vi.fn((error: PoolError) => {
    expect(error).toBeInstanceOf(PoolError);
    expect(error.reason).toBe("1");
    expect(error.pool).toBe("event");
    expect(error.caller).toBeUndefined();
    expect(error.handler).toBeUndefined();
    expect(error.trace).toEqual(["event"]);
  });
  space.catch(handler);

  const event = space.pool("event");
  event(() => {
    throw new Error(1 as any);
  });
  expect(await take(event())).toEqual([]);
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
  expect(await take(event())).toEqual([1]);
  event.close();
});

it("supports context groups", async () => {
  const space = pools({ group: "core" });
  const event = space.pool<() => string>("event");
  const g1Event = event.bind({ group: "g1" });
  const g2Event = event.bind({ group: "g2" });

  const block1 = barrier();
  const block2 = barrier();

  g1Event(function* () {
    yield* async(block1.promise);
    yield "g1";
  });
  g2Event(function* () {
    yield* async(block2.promise);
    yield "g2";
  });

  const result = take(event());
  const status = space.status("event");
  const executor = first(status.executing.values());
  expect(executor.group).toBe("core");
  const tasks = take(executor.tasks.values());
  expect(tasks).toEqual(
    expect.arrayContaining([
      expect.objectContaining({ group: "g1" }),
      expect.objectContaining({ group: "g2" }),
    ])
  );
  space.abort("event", { handler: "g1" });
  block1.resolve();
  block2.resolve();
  expect(await result).toEqual(["g2"]);
  expect(await take(g1Event())).toEqual(["g1", "g2"]);
  expect(await take(g2Event())).toEqual(["g1", "g2"]);

  {
    const result = take(g1Event());
    space.drain("event", { caller: "g1" });
    expect(await result).toEqual([]);
  }
  {
    const result = take(g1Event());
    space.drain("event", { group: "g1" });
    expect(await result).toEqual([]);
  }
  {
    const result = take(g1Event());
    space.drain("event", { handler: "g1" });
    expect(await result).toEqual(["g2"]);
  }

  event.close();
  expect(space.count()).toBe(0);
});

it("traces pools on catch", async () => {
  const first = pool<() => number>("first");
  const second = pool<() => number>("second");
  const third = pool<() => number>("third");

  third.bind({ group: "broken" })(function* () {
    throw new Error("No!");
  });
  second.bind({ group: "before" })(function* () {
    const result = yield* map(third.bind({ group: "before" })(), function* (x) {
      yield x;
    });
    yield result.length;
  });
  first(function* () {
    yield 10;
    const result = yield* map(second(), function* (x) {
      yield x;
    });
    yield result.length;
  });

  const caught = vi.fn();
  third.catch((error) => {
    expect(error.trace).toEqual(["first", "second", "third"]);
    expect(error.message).toContain("No!");
    expect(error.handler).toBe("broken");
    expect(error.caller).toBe("before");
    expect(error.pool).toBe("third");
    expect(error.reason).toBe("No!");
    caught();
  });

  expect(await take(first())).toEqual([10, 0, 1]);
  expect(caught).toHaveBeenCalled();
  first.close();
  second.close();
  third.close();
});

it("caches pool calls", async () => {
  const square = vi.fn((x) => x * x);
  const double = vi.fn((x) => x * 2);
  const cached = pool<(x: number) => number>("cached", { cache: 3 });
  cached(double);
  cached(square);
  for (let i = 0; i < 5; i++) {
    expect(await take(cached(4))).toEqual([8, 16]);
    expect(square).toHaveBeenCalledTimes(1);
    expect(double).toHaveBeenCalledTimes(1);
  }
  for (let i = 0; i < 5; i++) {
    expect(await take(cached(7))).toEqual([14, 49]);
    expect(square).toHaveBeenCalledTimes(2);
    expect(double).toHaveBeenCalledTimes(2);
  }
  for (let i = 0; i < 5; i++) {
    expect(await take(cached(5))).toEqual([10, 25]);
    expect(square).toHaveBeenCalledTimes(3);
    expect(double).toHaveBeenCalledTimes(3);
  }
  for (let i = 0; i < 5; i++) {
    expect(await take(cached(4))).toEqual([8, 16]);
    expect(square).toHaveBeenCalledTimes(3);
    expect(double).toHaveBeenCalledTimes(3);
  }
  for (let i = 0; i < 5; i++) {
    expect(await take(cached(10))).toEqual([20, 100]);
    expect(square).toHaveBeenCalledTimes(4);
    expect(double).toHaveBeenCalledTimes(4);
  }
  for (let i = 0; i < 5; i++) {
    expect(await take(cached(4))).toEqual([8, 16]);
    expect(square).toHaveBeenCalledTimes(5);
    expect(double).toHaveBeenCalledTimes(5);
  }
  cached.close();
});

it("handles timeouts", async () => {
  const { promise, resolve } = barrier();
  const spy = vi.fn();

  const event = pool<() => string>("event", { timeout: 25 });
  event(function* () {
    yield* async(promise);
    spy();
    yield "test";
  });
  expect(take(event())).resolves.toEqual([]);
  await delay(50);
  resolve();
  await delay();
  expect(spy).not.toHaveBeenCalled();
  event.close();
});

it("schedules events", async () => {
  let counter = 0;
  const event = pool<() => number>("event");
  event(() => counter++);
  expect(await take(event.schedule({ relative: 10 })())).toEqual([0]);
  const repeating = event.schedule({
    absolute: Date.now() + 30,
    interval: 30,
  });

  expect(take(repeating())).resolves.toEqual([1, 2]);
  expect(counter).toBe(1);
  await delay(31);
  expect(counter).toBeGreaterThan(1);
  let last = counter;
  await delay(31);
  expect(counter).toBeGreaterThan(last);
  last = counter;
  event.close();
  await delay(31);
  expect(counter).toBe(last);
});

it("respects scopes", async () => {
  const all = pools();
  const a = all.pool.bind({ scope: "a" });
  const b = all.pool.bind({ scope: "b" });
  const event1 = a("event");
  const event2 = b("event");
  const spy = vi.fn();
  event1(spy);
  event2(spy);

  await take(event1());
  expect(spy).toHaveBeenCalledTimes(1);
  await take(event2());
  expect(spy).toHaveBeenCalledTimes(2);
  const ids = all.status().map((x) => x.id);
  expect(ids).toEqual(["a/event", "b/event"]);
});

it("does filtered calls", async () => {
  const event = pool("event");
  const spy1 = vi.fn();
  const spy2 = vi.fn();

  event.bind({ group: "1" })(spy1);
  event.bind({ group: "2" })(spy2);

  event.where("1")();
  expect(spy1).toHaveBeenCalled();
  expect(spy2).not.toHaveBeenCalled();
  event.where("2")();
  expect(spy1).toHaveBeenCalledTimes(1);
  expect(spy2).toHaveBeenCalled();
  event();
  expect(spy1).toHaveBeenCalledTimes(2);
  expect(spy2).toHaveBeenCalledTimes(2);
});
