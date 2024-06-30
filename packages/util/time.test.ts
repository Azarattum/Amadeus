import { expect, it } from "vitest";
import { parse } from "./time";

it("parses time strings", () => {
  expect(parse("1h5s42")).toBe(3605_042);
  expect(parse("1w")).toBe(604_800_000);
  expect(parse("1h")).toBe(3600_000);
  expect(parse("10m")).toBe(600_000);
  expect(parse("123")).toBe(123);

  expect(parse("-1s bla bla")).toBe(1000);
  expect(parse("")).toBe(0);
  expect(parse()).toBe(0);
});
