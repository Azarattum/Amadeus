import { capitalize, offset, unprefix } from "./string";
import { expect, it } from "vitest";

it("capitalizes", () => {
  expect(capitalize("test string")).toBe("Test String");
  expect(capitalize("test string", false)).toBe("Test string");
});

it("unprefixes", () => {
  expect(unprefix("@some/data")).toBe("data");
  expect(unprefix("prefix-data")).toBe("data");
  expect(unprefix("@some/prefix-data")).toBe("data");
  expect(unprefix("prefix-second-data")).toBe("data");
  expect(unprefix("@some/prefix-second-data")).toBe("data");
});

it("offsets", () => {
  expect(offset("one\ntwo\nthree")).toBe("    one\n    two\n    three");
  expect(offset("one\ntwo\nthree", 2)).toBe("  one\n  two\n  three");
});
