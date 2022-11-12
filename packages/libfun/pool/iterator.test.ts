import { expect, it } from "vitest";
import { take } from "./iterator";

it("takes iterators", async () => {
  function* numbers() {
    yield 1;
    yield 2;
    yield 3;
  }

  async function* strings() {
    yield "1";
    yield "2";
    await new Promise((x) => setTimeout(x));
    yield "3";
  }

  expect(take(numbers())).toEqual([1, 2, 3]);
  expect(take(numbers(), 2)).toEqual([1, 2]);
  expect(await take(strings(), 1)).toEqual(["1"]);
  expect(await take(strings())).toEqual(["1", "2", "3"]);
  expect(await take(strings(), 4)).toEqual(["1", "2", "3"]);
});
