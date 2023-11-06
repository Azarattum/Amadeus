import { expect, it, vi } from "vitest";
import { nothing, unwrap } from "..";
import { maybe } from ".";

const check = (x: any) => expect(unwrap(x));
const invalid = (x: any) => expect(() => unwrap(x)).toThrow();

it("throws & catches errors", async () => {
  const oneish = maybe(1);
  check(oneish).toBe(1);

  invalid(maybe(null));

  const nullish = oneish.then(() => null).then(() => 2);
  invalid(nullish);

  check(nullish.catch(() => 3)).toBe(3);

  const chain = maybe(1)
    .then(() => null)
    .catch(() => 2)
    .then(() => null)
    .catch(() => 3);

  check(chain).toBe(3);
  check(chain.catch(() => 4)).toBe(3);
  check(chain.then(() => 4)).toBe(4);
  invalid(chain.then(() => null));

  expect(maybe(Promise.resolve()).unwrap()).rejects.toEqual(
    new Error("Value is nothing!"),
  );

  invalid(maybe(null).catch(() => null));
});

it("is awaited properly", async () => {
  expect(maybe(42)).resolves.toBe(42);
  expect(maybe(null)).rejects.toEqual(new Error("Value is nothing!"));
});

it("rejects inline", () => {
  {
    const resolve = vi.fn();
    const reject = vi.fn();
    maybe(null).then(resolve, reject);
    expect(resolve).not.toBeCalled();
    expect(reject).toBeCalled();
  }
  {
    const monad = maybe(null)
      .then(() => null)
      .then(
        () => 42,
        () => null,
      );
    invalid(monad);
  }
  {
    const monad = maybe(1)
      .then(
        () => null,
        () => 2,
      )
      .then(
        () => 3,
        () => 4,
      );
    check(monad).toBe(3);
  }
});

it("catches async errors", async () => {
  const promise = Promise.reject("Error");

  {
    const monad = maybe(promise);
    const caught = monad.catch(() => 42);
    expect(caught).not.toBeInstanceOf(Promise);
    expect(await caught).toBe(42);
  }

  {
    const monad = maybe(promise);
    expect(monad).rejects.toThrow("Error");
    expect(monad.unwrap()).rejects.toThrow("Error");
    const never = vi.fn<[], undefined>();
    const rejected = vi.fn<[], undefined>();
    const result = await monad
      .then(never, rejected)
      .then(never)
      .catch(() => 42);
    expect(never).not.toBeCalled();
    expect(rejected).toBeCalled();
    expect(result).toBe(42);
  }
});

it("handles nothing", () => {
  const result = maybe(nothing).expose();
  expect(result.error).toBeInstanceOf(Error);
  expect(result.data).toBeUndefined();
});
