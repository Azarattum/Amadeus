import { persistence, users } from "./persistence";
import { expect, it, vi } from "vitest";

const spy = vi.fn();
const err = async () => {
  throw new Error();
};

persistence(() => ({
  settings: { lookup: async (a, b) => `${b}.${a}`, extract: err },
  tracks: { get: async () => ({ title: "aaa", sources: ["b"] } as any) },
  history: { get: async () => [{ query: "a", date: 1 }] },
  artists: { get: async () => ({ title: "Test" } as any) },
  subscribe: () => spy,
}));
persistence(() => ({
  playlists: { create: async () => 123 as any },
  settings: { lookup: () => Promise.resolve("never") },
  tracks: { get: async () => ({ title: "Aaa", sources: ["a"] } as any) },
  history: { get: async () => [{ query: "b", date: 2 }] },
  artists: { get: async () => err() },
  subscribe: () => spy,
}));

it("processes voided", async () => {
  const result = await persistence().playlists.create({ title: "name" });
  expect(result).toBeUndefined();
});

it("processes raced", async () => {
  const result = await persistence().settings.lookup("test");
  expect(result).toBe("settings.test");
});

it("processes merged", async () => {
  const result = await persistence().tracks.get(123);
  expect(result).toEqual({ title: "Aaa", sources: ["b", "a"] });
});

it("processes dated", async () => {
  const result = await persistence().history.get();
  expect(result).toEqual([
    { query: "b", date: 2 },
    { query: "a", date: 1 },
  ]);
});

it("processes composed", async () => {
  const unsubscribe = await persistence().subscribe([], () => {});
  expect(spy).not.toHaveBeenCalled();
  unsubscribe();
  expect(spy).toHaveBeenCalledTimes(2);
});

it("throws unimplemented", () => {
  expect(persistence().history.log("test")).rejects.toThrowError(
    "history.log is not implemented!"
  );
});

it("handles exceptions", async () => {
  expect(await persistence().artists.get(42)).toEqual({ title: "Test" });
  expect(persistence().settings.extract("")).rejects.toThrowError(
    "All promises were rejected"
  );
});

users(() => ({
  first: {
    name: "First",
    data: 42,
  },
  second: {
    name: "Second",
  },
}));

users(() => ({
  second: {
    name: "second",
    data: 1337,
  },
  third: {
    name: "Third",
  },
}));

it("merges users", async () => {
  expect(await users()).toEqual({
    first: {
      name: "First",
      data: 42,
    },
    second: {
      name: "Second",
      data: 1337,
    },
    third: {
      name: "Third",
    },
  });
});
