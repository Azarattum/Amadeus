import { assert } from "./superstruct";
import { string } from "superstruct";
import { expect, it } from "vitest";

it("shows custom message", () => {
  expect(() => {
    assert(123, string(), "Custom message");
  }).toThrowError(/^Custom message\nExpected a string, but received: 123/);

  expect(() => {
    assert(123, string());
  }).toThrowError(/^Expected a string, but received: 123/);
});
