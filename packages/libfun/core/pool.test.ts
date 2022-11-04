import { expect, it, vi } from "vitest";
import { all } from "./iterator";
import { pools } from "./pool";

const { pool, count } = pools();
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
  /// TODO: add a group concurrency test
});

it("rates calls per minute", () => {
  /// TODO: implement a rate limit test
  //          per event/module
});

it("can be aborted", () => {
  /// TODO: test the abort functionality along with the fetch support
});

it("reports status", () => {
  /// TODO: status should be properly reported and globally accessible
});
