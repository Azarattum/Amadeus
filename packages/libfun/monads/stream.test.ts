import { expect, it, vi } from "vitest";
import { stream, maybe } from ".";

it("wraps streamed values", () => {
  const a = stream(42);
  expect(a.unwrap()).toBe(42);
  const b = a.then((x) => x * 2);
  expect(b.unwrap()).toBe(84);
});

it("pushes values to streams", () => {
  const a = stream(1);
  expect(a.unwrap()).toBe(1);
  expect(a.push(2).unwrap()).toBe(2);
  expect(a.push(3).unwrap()).toBe(3);
});

it("propagates streamed values", () => {
  const twice = vi.fn((x: number) => x * 2);
  const add = vi.fn((x: number) => x + 1);

  const a = stream(42);
  const b = a.then(twice);
  const c = b.then(add);

  expect(a.unwrap()).toBe(42);
  expect(b.unwrap()).toBe(84);
  expect(c.unwrap()).toBe(85);

  expect(twice).toBeCalledTimes(1);
  expect(add).toBeCalledTimes(1);

  a.push(1337);
  expect(a.unwrap()).toBe(1337);
  expect(b.unwrap()).toBe(2674);
  expect(c.unwrap()).toBe(2675);

  expect(twice).toBeCalledTimes(2);
  expect(add).toBeCalledTimes(2);

  b.push(69);
  expect(a.unwrap()).toBe(1337);
  expect(b.unwrap()).toBe(69);
  expect(c.unwrap()).toBe(70);

  expect(twice).toBeCalledTimes(2);
  expect(add).toBeCalledTimes(3);

  c.push(11);
  expect(a.unwrap()).toBe(1337);
  expect(b.unwrap()).toBe(69);
  expect(c.unwrap()).toBe(11);

  expect(twice).toBeCalledTimes(2);
  expect(add).toBeCalledTimes(3);
});

it("combines with other monads", () => {
  const a = stream(maybe(1));

  const combined = maybe(a);
  expect("push" in combined).toBeFalsy();
  expect("detach" in combined).toBeFalsy();
  expect(combined.unwrap()).toBe(1);

  const spy = vi.fn((x) => x * x);

  const b = a.then(spy);
  expect(spy).toHaveBeenLastCalledWith(1);
  a.push(2);
  expect(spy).toHaveBeenLastCalledWith(2);
  expect(b.unwrap()).toBe(4);

  a.push(undefined as any);
  expect(a.expose().error).toBeInstanceOf(Error);
});

it("updates upstream monads", () => {
  const inner = stream(1 as number | null);
  const upper = maybe(inner);

  expect(inner.unwrap()).toBe(1);
  expect(upper.unwrap()).toBe(1);
  inner.push(null);
  expect(inner.unwrap()).toBe(null);
  expect(upper.expose().error).toBeInstanceOf(Error);
});

it("combines with promises", () => {
  const a = stream(Promise.resolve(42));
  expect(a.unwrap()).resolves.toBe(42);

  const b = a.then((x) => x * 2);
  const promise = b.unwrap();
  expect(promise).toBeInstanceOf(Promise);
  expect(promise).resolves.toBe(84);
});

it("catches errors", () => {
  const broken = stream(maybe(1));
  const cloned = broken.then((x) => x);
  const fixed = broken.catch(() => 42);

  expect(broken.unwrap()).toBe(1);
  expect(cloned.unwrap()).toBe(1);
  expect(fixed.unwrap()).toBe(1);

  broken.push(2);
  expect(broken.unwrap()).toBe(2);
  expect(cloned.unwrap()).toBe(2);
  expect(fixed.unwrap()).toBe(2);

  broken.push(null as any);
  expect(broken.expose().error).toBeInstanceOf(Error);
  expect(cloned.expose().error).toBeInstanceOf(Error);
  expect(fixed.unwrap()).toBe(42);
});

it("subscribes listeners", async () => {
  const calls: number[] = [];
  const listener = vi.fn((x) => calls.push(x));

  const pusher = stream(1);
  const unsubscribe = pusher.subscribe(listener);
  pusher.push(2);
  pusher.push(42);
  pusher.push(Promise.resolve(10) as any);
  await new Promise((x) => setTimeout(x));
  expect(listener).toHaveBeenCalledTimes(4);
  expect(calls).toEqual([1, 2, 42, 10]);

  unsubscribe();
  pusher.push(1337);
  await new Promise((x) => setTimeout(x));
  expect(listener).toHaveBeenCalledTimes(4);
  expect(calls).toEqual([1, 2, 42, 10]);
});

it("nested streams", () => {
  const a = stream(1);
  const b = stream("");
  const c = a.then((x) => b.then((y) => y + x));

  expect(c.unwrap()).toBe("1");
  a.push(2);
  expect(c.unwrap()).toBe("2");
  b.push("_");
  expect(c.unwrap()).toBe("_2");
  b.push("+");
  a.push(3);
  expect(c.unwrap()).toBe("+3");
  b.push("-");
  expect(c.unwrap()).toBe("-3");
  c.push("0_o");
  expect(a.unwrap()).toBe(3);
  expect(b.unwrap()).toBe("-");
  expect(c.unwrap()).toBe("0_o");
});
