import { expect, it, vitest } from "vitest";
import { pool, pools } from "./pool";

it("fires events", () => {
  const event = pool<(_: number) => void>("event");

  const callback = vitest.fn(function* (x) {
    expect(x).toBe(42);
  });

  event(callback);
  event(42);
  expect(callback).toBeCalledTimes(1);
  event.close();
});

it("registers globally", () => {
  const impl = vitest.fn(function* () {});

  const event = pool("event");
  expect(pools.status().length).toBe(1);
  event(impl);
  event();
  expect(impl).toBeCalledTimes(1);
  expect(pools.status().length).toBe(1);
  event.close();
  expect(pools.status().length).toBe(0);

  event();
  expect(impl).toBeCalledTimes(1);

  event(impl);
  event();
  expect(impl).toBeCalledTimes(2);

  expect(pools.status().length).toBe(1);
  event.close();
  expect(pools.status().length).toBe(0);
});

it("limits concurrency", () => {
  /// TODO: implement as concurrency test
  //          per event/module
});

it("rates calls per minute", () => {
  /// TODO: implement a rate limit test
  //          per event/module
});

it("associates with a module", () => {
  /// TODO: test that a pool can be bound to a module
});

it("can be aborted", () => {
  /// TODO: test the abort functionality along with the fetch support
});

it("reports status", () => {
  /// TODO: status should be properly reported and globally accessible
});
