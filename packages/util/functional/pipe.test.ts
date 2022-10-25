import { pipeline, pipe, fallback, expose } from "./pipe";
import { it, expect, vitest } from "vitest";
import { maybe, spread } from "./monads";
import { monad } from "./monad";

function adders(length: number) {
  return Array.from({ length }).map(() => (x: number) => x + 1) as [];
}

it("pipeline", () => {
  expect(pipeline()(1)).toBe(1);
  expect(pipeline((x: number) => x * 2)(1)).toBe(2);
  expect(
    pipeline(
      (x: string) => x.toUpperCase(),
      (x) => x.split(" "),
      ([a, b]) => `${a}, ${+b * 2}`
    )("hello 123")
  ).toBe("HELLO, 246");

  for (let i = 0; i < 10; i++) {
    const value = pipeline(...adders(i))(0);
    expect(value).toBe(i);
  }
});

it("pipe", () => {
  expect(pipe(1)()).toBe(1);
  expect(pipe(1)((x) => x * 2)).toBe(2);

  pipe("hello 123")(
    (x: string) => x.toUpperCase(),
    (x) => x.split(" "),
    ([a, b]) => `${a}, ${+b * 2}`,
    expect,
    (x) => x.equal("HELLO, 246")
  );

  for (let i = 0; i < 10; i++) {
    const value = pipe(0)(...adders(i));
    expect(value).toBe(i);
  }

  const process = pipe(123, 321);
  const result = process(
    (x, y) => x * y,
    (x) => `Value: ${x}`,
    (x) => x.toUpperCase()
  );
  expect(result).toBe("VALUE: 39483");
});

it("supports promises", async () => {
  const noop = pipeline((x) => x);

  expect(noop(Promise.resolve(123))).toBeInstanceOf(Promise);
  expect(noop(Promise.resolve(123))).resolves.toBe(123);

  const value = pipe(Promise.resolve(42))(
    (x) => x * 2,
    (x) => Promise.resolve(x),
    (x) => x.toString(),
    (x) => Promise.resolve(x),
    (x) => x
  );

  expect(value).toBeInstanceOf(Promise);
  expect(await value).toBe("84");

  const future = monad()(Promise.resolve(1337));
  const result = pipe(future)(
    (x) => `data: ${x}`,
    (x) => x.toUpperCase()
  );

  expect(result).toBeInstanceOf(Promise);
  expect(result).resolves.toBe("DATA: 1337");
});

it("supports monads", async () => {
  const value = pipe(maybe(42))(
    (x) => x * 2,
    (x) => x.toString()
  );

  expect(typeof value).toBe("string");
  expect(value).toBe("84");

  const value2 = pipe(maybe(Promise.resolve(42)))(
    (x) => x * 2,
    (x) => x.toString()
  );

  expect(value2).toBeInstanceOf(Promise);
  expect(await value2).toBe("84");

  const value3 = pipe([
    [1, 2, 3],
    [4, 5, 6],
  ])(
    spread,
    (x) => x * x,
    (x) => x - 1,
    (x) => x.toString()
  );

  expect(value3).toBeInstanceOf(Array);
  expect(value3).toEqual(["0", "3", "8", "15", "24", "35"]);
});

it("handles longs chains", async () => {
  const data = pipeline(
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
  function multiple(callback: (x: string, y: number) => [string]) {
    check();
    expect(callback("test", 123)).toEqual(["TEST123"]);
  }

  multiple(
    pipeline(
      (x, y) => x.toUpperCase() + y.toPrecision(),
      (x) => [x]
    )
  );
  expect(check).toBeCalled();

  function single(callback: (x: string) => [string]) {
    check();
    expect(callback("123")).toEqual(["123"]);
  }

  single(pipeline((x) => [x] as [string]));
  expect(check).toBeCalledTimes(2);
});

it("handles spread functions", () => {
  const fns = [(x: number) => +x + 1, (x: any) => String(x)];
  // A hack to make TypeScript happy, generally we don't want
  //  to allow a spread function pipeline
  const hack = fns as [];

  const transform = pipeline(...hack);
  expect(transform(42)).toBe("43");
});

it("unwraps monads", () => {
  {
    const result = pipe(maybe(1))();
    expect(result).toBeTypeOf("number");
    expect(result).toBe(1);
  }
  {
    const result = pipe(maybe(1))((x) => x);
    expect(result).toBeTypeOf("number");
    expect(result).toBe(1);
  }
  {
    const result = pipe(maybe(1))(
      (x) => x,
      (x) => x
    );
    expect(result).toBeTypeOf("number");
    expect(result).toBe(1);
  }
});

it("propagates monads", () => {
  const none = () => undefined as number | undefined;
  const dunno = <T>(x: T) => x as T | undefined;

  const value = pipe(maybe(4))(
    (x) => x * 2,
    dunno,
    (x) => x.toString()
  );
  expect(value).toBe("8");

  const never = vitest.fn();
  const invalid = pipeline(
    () => 42,
    maybe,
    none,
    (x) => x.toFixed(),
    never
  );
  expect(invalid).toThrow();
  expect(never).not.toBeCalled();

  const check = vitest.fn();
  const long = pipeline(
    () => 1,
    (x) => x + 1,
    dunno,
    (x) => (x ? x + 1 : undefined),
    maybe,
    (x) => x + 1,
    (x) => x + 1,
    (x) => x + 1,
    (x) => x + 1,
    maybe,
    check,
    none,
    /// TODO: should `x: number` work?
    (x) => x.toFixed(),
    never
  );

  expect(long).toThrow();
  expect(check).toBeCalled();
  expect(never).not.toBeCalled();
});

it("respects fallback", () => {
  function bad() {
    throw new Error("fail");
    return 123;
  }

  const result = pipe(42)(bad, fallback(":("));
  expect(result).toBe(":(");

  const message = pipe(1)(
    bad,
    (x) => x * 2,
    fallback((e: Error) => e.message),
    (x) => x.toString(),
    (x) => x.toUpperCase()
  );
  expect(message).toBe("FAIL");

  {
    const { data, error } = pipe(1)(bad, (x) => x * 2, ...expose);
    expect(data).toBeTypeOf("undefined");
    expect(error?.message).toBe("fail");
  }
  {
    const { data, error } = pipe(1)((x) => x * 2, ...expose);
    expect(error).toBeTypeOf("undefined");
    expect(data).toBe(2);
  }
});
