import { capitalize, unprefix, offset, nully } from "./string";
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

it("nullifies", () => {
  expect(nully`Hi ${0} there`).toBe("Hi 0 there");
  expect(nully`Hi ${null} there`).toBe(undefined);
  expect(nully`Hi ${undefined} there`).toBe(undefined);
  expect(nully`Hi ${"you"} there`).toBe("Hi you there");
  expect(nully`Hi ${"you"} there ${null}`).toBe(undefined);
  expect(nully`Hi ${"you"} there ${undefined}`).toBe(undefined);
  expect(nully`Hi ${false} there`).toBe("Hi false there");
  expect(nully`Hi ${null}` || "Hello").toBe("Hello");
  expect(nully`${undefined}` || "").toBe("");
});
