import { it, expect, vitest } from "vitest";
import { pipe, pipeline } from "./pipe";
import { maybe } from "./monads";
import { monad } from "./monad";

function adders(length: number) {
  return Array.from({ length }).map(() => (x: number) => x + 1);
}

it("pipes", () => {
  expect(pipe()(1)).toBe(1);
  expect(pipe((x: number) => x * 2)(1)).toBe(2);
  expect(
    pipe(
      (x: string) => x.toUpperCase(),
      (x) => x.split(" "),
      ([a, b]) => `${a}, ${+b * 2}`
    )("hello 123")
  ).toBe("HELLO, 246");

  for (let i = 0; i < 10; i++) {
    const value = pipe(...adders(i))(0);
    expect(value).toBe(i);
  }
});

it("pipelines", () => {
  expect(pipeline(1)()).toBe(1);
  expect(pipeline(1)((x) => x * 2)).toBe(2);

  pipeline("hello 123")(
    (x: string) => x.toUpperCase(),
    (x) => x.split(" "),
    ([a, b]) => `${a}, ${+b * 2}`,
    expect,
    (x) => x.equal("HELLO, 246")
  );

  for (let i = 0; i < 10; i++) {
    const value = pipeline(0)(...adders(i));
    expect(value).toBe(i);
  }

  const process = pipeline(123, 321);
  const result = process(
    (x, y) => x * y,
    (x) => `Value: ${x}`,
    (x) => x.toUpperCase()
  );
  expect(result).toBe("VALUE: 39483");
});

it("supports promises", async () => {
  /// TODO: mb possible to type with generics?
  //    now it is unknown
  const noop = pipe((x) => x);

  expect(noop(Promise.resolve(123))).toBeInstanceOf(Promise);
  expect(noop(Promise.resolve(123))).resolves.toBe(123);

  /// FIX: value should really be a promise of string
  const value = pipeline(Promise.resolve(42))(
    (x) => x * 2,
    (x) => Promise.resolve(x),
    (x) => x.toString(),
    (x) => Promise.resolve(x),
    (x) => x
  );

  expect(value).toBeInstanceOf(Promise);
  expect(await value).toBe("84");

  const future = monad()(Promise.resolve(1337));
  const result = pipeline(future)(
    (x) => `data: ${x}`,
    (x) => x.toUpperCase()
  );

  expect(result).toBeInstanceOf(Promise);
  expect(result).resolves.toBe("DATA: 1337");
});

it("supports monads", async () => {
  const value = pipeline(maybe(42))(
    (x) => x * 2,
    (x) => x.toString()
  );

  expect(typeof value).toBe("string");
  expect(value).toBe("84");

  const value2 = pipeline(maybe(Promise.resolve(42)))(
    (x) => x * 2,
    (x) => x.toString()
  );

  expect(value2).toBeInstanceOf(Promise);
  expect(await value2).toBe("84");

  /// TODO: add spread monad test. (fix unwrap typings)
});

it("handles longs chains", async () => {
  const data = pipe(
    (x: string, y: number) => (x ? 1 : y),
    (x) => [x],
    (x) => ({ x }),
    (x) => Promise.resolve(x.x[0] * 2),
    (x) => x.toString(),
    (x) => !!x + x,
    (x) => +x + "",
    // Arguments below are not inferred automatically
    (x: string) => x.toLowerCase(),
    (x: string) => Promise.resolve(x + "!"),
    (x) => x,
    (x: string) => [x]
  );

  expect(data("123", 123)).resolves.toEqual(["nan!"]);
});

it("can be used as a callback", () => {
  const check = vitest.fn();
  function test(callback: (x: string, y: number) => [string]) {
    check();
    expect(callback("test", 123)).toEqual(["TEST123"]);
  }

  test(
    pipe(
      (x, y) => x.toUpperCase() + y.toPrecision(),
      (x) => [x]
    )
  );
  expect(check).toBeCalled();
});

it("handles spread functions", () => {
  const transform = pipe(...[(x: number) => +x + 1, (x: any) => String(x)]);
  expect(transform(42)).toBe("43");
});
