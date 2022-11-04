import { expect, it } from "vitest";
import { all } from "./iterator";

it("alls iterators", async () => {
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

  expect(all(numbers())).toEqual([1, 2, 3]);
  expect(all(numbers(), 2)).toEqual([1, 2]);
  expect(await all(strings(), 1)).toEqual(["1"]);
  expect(await all(strings())).toEqual(["1", "2", "3"]);
  expect(await all(strings(), 4)).toEqual(["1", "2", "3"]);
});
