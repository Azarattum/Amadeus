import { expect, it } from "vitest";
import { spread, nothing } from ".";
import { unwrap } from "..";

const check = (x: any) => expect(unwrap(x));
const invalid = (x: any) => expect(() => unwrap(x)).toThrow();

it("spreads array", async () => {
  const list = spread([1, 2, 3, 4]);

  const result = list
    .then((x) => x * 2)
    .then((x) => x.toString())
    .then((x) => [x])
    .then((x) => x);

  check(result).toEqual(["2", "4", "6", "8"]);
  expect(await result.unwrap()).toEqual(["2", "4", "6", "8"]);
  expect(await result).toEqual(["2", "4", "6", "8"]);

  const broken = spread(1 as any).catch(() => [123]);

  check(spread([[[1, 2, [[3], 4]]]])).toEqual([1, 2, 3, 4]);
  check(broken).toEqual([123]);
  invalid(spread(1 as any));
});

it("spreads iterable", async () => {
  function* iterable() {
    yield 1;
    yield [2];
    yield* [3, 4];
  }

  const list = spread(iterable());
  const result = list
    .then((x) => {
      if (x % 2) throw "";
      return x;
    })
    .catch(() => nothing)
    .then((x) => x * 2)
    .then((x) => x.toString())
    .then((x) => [x])
    .then();

  check(result).toEqual([["4"], ["8"]]);
  expect(await result.unwrap()).toEqual([["4"], ["8"]]);
  expect(await result).toEqual([["4"], ["8"]]);
});
