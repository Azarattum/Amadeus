import { monad, unwrap, all } from "./monad";
import { expect, it, vitest } from "vitest";
import type { Monad } from "./monad.types";
import { maybe, spread } from "../monads";

const check = (x: any) => expect(unwrap(x));
const identity = monad();

it("monad chains thens", () => {
  const value1 = identity(123)
    .then((x) => x.toString())
    .then((x) => x.split(""))
    .unwrap();

  expect(value1).toEqual(["1", "2", "3"]);
});

it("unwraps promises", async () => {
  const promise = identity(Promise.resolve(42)).unwrap();
  expect(promise).toBeInstanceOf(Promise);
  expect(await promise).toBe(42);
});

it("transforms promised values", async () => {
  const promise = identity(Promise.resolve(42))
    .then((x) => x * 2)
    .unwrap();

  expect(promise).toBeInstanceOf(Promise);
  expect(await promise).toBe(84);
});

it("then is empty", () => {
  const fortyTwo = identity(42);
  expect(fortyTwo).not.toBe(fortyTwo.then());

  check(fortyTwo.then().then((x) => x / 2)).toBe(21);
});

it("transforming monad", () => {
  const fortyTwo = identity(42);
  expect(fortyTwo).not.toBe(fortyTwo.then());

  check(fortyTwo.then().then((x) => x / 2)).toBe(21);
});

it("mixes with promises", async () => {
  check(maybe(maybe(1))).toBe(1);
  check(maybe(maybe(maybe(1).then((x) => x + 2)).then((x) => x + 3))).toBe(6);
  check(await maybe(Promise.resolve(maybe(123) as any))).toBe(123);

  const maybe1 = maybe(1);
  const promise1 = new Promise<typeof maybe1>((r) => r(maybe1));
  const promise2 = new Promise<typeof promise1>((r) => r(promise1));
  const maybeMaybe = maybe(promise2);

  expect(await maybeMaybe).toBe(1);
  check(await maybeMaybe.then((x) => x.toFixed())).toBe("1");
  check(maybeMaybe.unwrap()).toBeInstanceOf(Promise);
});

it("calls inner thenable", async () => {
  let value = 42;
  const then = vitest.fn((resolve?: ((_: any) => void) | null) => {
    value = resolve?.(value) ?? value;
    return thenable as any;
  });
  const thenable = { then } as any as Promise<number>;

  thenable.then((x) => (expect(x).toBe(42), 42));
  expect(then).toBeCalledTimes(1);

  const mayThen = maybe(thenable);
  expect(then).toBeCalledTimes(2);
  mayThen.then();
  expect(then).toBeCalledTimes(3);

  expect(await mayThen.then((x) => x * 2)).toBe(84);
  expect(then).toBeCalledTimes(6);
});

it("return a string tag", () => {
  expect(identity(123).toString()).toBe("[object Monad]");
  expect(maybe(null).toString()).toBe("[object Monad]");
  expect(spread([]).toString()).toBe("[object Monad]");
});

it("deduplicates wrappers", async () => {
  const impl = vitest.fn((x, fn) => fn(x));
  const logger = monad(impl);

  const double = logger(logger(42));
  check(double).toBe(42);
  expect(impl).toBeCalledTimes(2);

  const more = maybe(double);
  expect(impl).toBeCalledTimes(3);
  more.then((x) => x);
  expect(impl).toBeCalledTimes(4);

  const wrapped = maybe(more);
  expect(impl).toBeCalledTimes(5);
  wrapped.then((x) => x);
  expect(impl).toBeCalledTimes(6);
  wrapped.then((x) => x);
  expect(impl).toBeCalledTimes(7);

  const self = logger(42);
  const ofNumber = self.then(() => logger(123));
  check(ofNumber).toBe(123);
  expect(impl).toBeCalledTimes(10);
});

it("resolves a long chain", async () => {
  const a = maybe(1);
  expect(a.unwrap()).toBe(1);
  const b = a.then((x) => x * 2);
  expect(b.unwrap()).toBe(2);
  const c = b.then((x) => Promise.resolve(x * 3));
  expect(c.unwrap()).toBeInstanceOf(Promise);
  expect(c.unwrap()).resolves.toBe(6);
  const d = c.then((x) => maybe(x + 10));
  expect(d.unwrap()).toBeInstanceOf(Promise);
  expect(d.unwrap()).resolves.toBe(16);
  const e = d.then(() => null).catch(() => "123");
  expect(e.unwrap()).toBeInstanceOf(Promise);
  expect(e.unwrap()).resolves.toBe("123");
  const f = e.then((x) => maybe(x.toString()));
  expect(f.unwrap()).toBeInstanceOf(Promise);
  expect(f.unwrap()).resolves.toBe("123");
  const g = f.then((x) => Promise.resolve(x.split("")));
  expect(g.unwrap()).toBeInstanceOf(Promise);
  expect(g.unwrap()).resolves.toEqual(["1", "2", "3"]);

  const h = g
    .then((x) => +x)
    .then((x) => x.toFixed() || null)
    .then((x) => x.toLowerCase())
    .then(() => ("" || null) as never)
    .then((x) => x.toUpperCase())
    .catch(() => "[]");

  expect(h.unwrap()).toBeInstanceOf(Promise);
  expect(h.unwrap()).resolves.toBe("[]");
});

it("alls primitives", () => {
  const values = [1, 2, 3, 4] as const;
  const single = all(values);

  expect(single).not.toBeInstanceOf(Array);
  expect(single.unwrap()).toEqual([1, 2, 3, 4]);
});

it("alls monads", () => {
  const values = [1, maybe(2), 3, maybe(identity(4))] as const;
  const single = all(values);

  expect("then" in single);
  expect("unwrap" in single);
  expect(single.unwrap()).toEqual([1, 2, 3, 4]);
});

it("alls monads & promises", async () => {
  const values = [
    maybe(12),
    maybe(Promise.resolve(42)),
    123,
    "test",
    maybe(Promise.resolve(1337)),
  ] as const;

  const single = all(values);
  single.then((x) => x);

  expect("then" in single);
  expect("unwrap" in single);
  expect(single.unwrap()).toBeInstanceOf(Promise);
  expect(await single.unwrap()).toEqual([12, 42, 123, "test", 1337]);
  expect(await single).toEqual([12, 42, 123, "test", 1337]);

  const one = single.then((x) => x.reduce((acc, x) => acc + x?.toString(), ""));
  const two = one.then((x) => x.toUpperCase());
  expect(two.unwrap()).toBeInstanceOf(Promise);
  expect(await two).toEqual("1242123TEST1337");

  expect(two.then(() => null).unwrap()).rejects.toEqual(
    new Error("Value is nothing!")
  );
});

it("correctly rejects promises", async () => {
  const value = maybe(Promise.resolve(1));
  let target: Monad<any, any> = identity([] as any);
  target = target.then((x: any) => value.then((y) => [...x, y]));

  expect(target.then(() => null)).rejects.toEqual(
    new Error("Value is nothing!")
  );
  expect(target.then(() => null).unwrap()).rejects.toEqual(
    new Error("Value is nothing!")
  );

  expect(maybe(Promise.resolve(123))).resolves.toBe(123);
});

it("unwraps for native await", async () => {
  const a = maybe(identity(identity(spread([1, 2, 3]))));

  expect(await a.then((x) => x + 1)).toEqual([2, 3, 4]);
  expect(await a).toEqual([1, 2, 3]);

  const check = vitest.fn();
  const mock = ((x: any) => {
    check();
    expect(x).not.toBeInstanceOf(Array);
    expect(x).not.toBeInstanceOf(Error);
  }).bind({});

  spread([1]).then(mock, mock);
  expect(check).toBeCalledTimes(1);
});

it("respects unwrap fallback", () => {
  function bad() {
    throw new Error();
    return 123;
  }

  const monad = maybe(42).then(bad);
  const result = monad.unwrap("1337");
  expect(result).toBe("1337");

  const future = identity(Promise.resolve(42)).then(bad);
  const result2 = future.unwrap(":(");
  expect(result2).resolves.toBe(":(");
});

it("exposes data & error", async () => {
  {
    const monad = maybe(42);
    const { data, error } = monad.expose();
    expect(data).toBe(42);
    expect(error).toBeTypeOf("undefined");
  }
  {
    const monad = maybe<number>(undefined as any);
    const { data, error } = monad.expose();
    expect(data).toBeTypeOf("undefined");
    expect(error).toBeInstanceOf(Error);
  }
  {
    const monad = maybe(Promise.resolve(42));
    const { data, error } = await monad.expose();
    expect(data).toBe(42);
    expect(error).toBeTypeOf("undefined");
  }
  {
    const monad = maybe(Promise.reject("123"));
    const { data, error } = await monad.expose();
    expect(data).toBeTypeOf("undefined");
    expect(error).toBeInstanceOf(Error);
  }
});
