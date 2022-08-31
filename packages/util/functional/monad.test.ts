import { expect, it, vitest } from "vitest";
import { maybe, spread } from "./monads";
import { monad, unwrap } from "./monad";

const check = (x: any) => expect(unwrap(x));
const invalid = (x: any) => expect(() => unwrap(x)).toThrow();

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
    new Error("Value is nothing!")
  );

  invalid(maybe(null).catch(() => null));
});

it("is awaited properly", async () => {
  expect(maybe(42)).resolves.toBe(42);
  expect(maybe(null)).rejects.toEqual(new Error("Value is nothing!"));
});

it("rejects inline", () => {
  {
    const resolve = vitest.fn();
    const reject = vitest.fn();
    maybe(null).then(resolve, reject);
    expect(resolve).not.toBeCalled();
    expect(reject).toBeCalled();
  }
  {
    const monad = maybe(null)
      .then(() => null)
      .then(
        () => 42,
        () => null
      );
    invalid(monad);
  }
  {
    const monad = maybe(1)
      .then(
        () => null,
        () => 2
      )
      .then(
        () => 3,
        () => 4
      );
    check(monad).toBe(4);
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
    expect(monad).rejects.toBe("Error");
    expect(monad.unwrap()).rejects.toBe("Error");

    const never = vitest.fn<[], undefined>();
    const rejected = vitest.fn<[], undefined>();
    // TODO:                              ↓ this breaks
    await monad.then(never, rejected); // .then((x) => console.log("!!!!!", x));
    expect(never).not.toBeCalled();
    expect(rejected).toBeCalled();
  }
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

it("spreads array", () => {
  const list = spread([1, 2, 3, 4]);
  const result = list
    .then((x) => x * 2)
    .then((x) => x.toString())
    .then((x) => [x]);

  check(result).toEqual([["2"], ["4"], ["6"], ["8"]]);
});
