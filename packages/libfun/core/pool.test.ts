import { expect, it, vi } from "vitest";
import type { Fn } from "./types";
import { all } from "./iterator";
import { pools } from "./pool";

const { pool, count, status } = pools();
const delay = (ms: number) => new Promise((x) => setTimeout(x, ms));

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

it("assigns a group", () => {
  const event = pool("event", { group: "Test" });
  expect(event.status().group).toBe("Test");
  expect(pool("").status().group).toBeUndefined();
});

it("reports status", () => {
  const a = pool("a");
  const b = pool("b");

  expect(a.status().id).toBe("a");
  expect(b.status().id).toBe("b");
  expect(a.status().executing).toBe(0);
  expect(b.status().executing).toBe(0);
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
    yield new Promise((x) => (resolve = x));
    yield 42;
  });

  const event = pool<() => number>("event", {
    concurrency: 1,
  });

  event(impl);
  expect(impl).not.toHaveBeenCalled();
  expect(all(event())).resolves.toEqual([42]);
  expect(impl).toHaveBeenCalledTimes(1);
  expect(all(event())).resolves.toEqual([42]);
  expect(impl).toHaveBeenCalledTimes(1);
  resolve();
  await delay(100);
  expect(impl).toHaveBeenCalledTimes(2);
  event.close();
});

it("rates calls per minute", async () => {
  const resolve: Fn[] = [];
  const impl = vi.fn(function* () {
    yield new Promise((x) => resolve.push(x));
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
  event.close();
});

it("can be aborted", () => {
  /// TODO: test the abort functionality along with the fetch support
});
