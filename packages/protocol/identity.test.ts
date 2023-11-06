import { stringify, convert, merge } from ".";
import { expect, it } from "vitest";

it("stringifies track", () => {
  const track = {
    artists: ["The Chemical Brothers", "Ed Simons", "Tom Rowlands"],
    album: "Come With Us",
    title: "The Test",
    length: 466.28,
    year: null,
  };
  expect(stringify(track)).toBe(
    "ed simons,the chemical brothers,tom rowlands - the test - come with us",
  );
});

it("uniquifies track", () => {
  const track = {
    artists: [{ title: "First" }, { title: "A Second " }],
    album: { title: "Music", year: null },
    title: "The Test",
  };
  expect(convert(track as any)).toEqual({
    artists: [
      { title: "A Second ", id: 1864478276, thumbnails: [], arts: [] },
      { id: 2851137560, title: "First", thumbnails: [], arts: [] },
    ],
    album: {
      id: 2025077785,
      title: "Music",
      thumbnails: [],
      year: null,
      arts: [],
    },
    title: "The Test",
    id: 4180209679,
  });
});

it("merges tracks", () => {
  const a = {
    artists: [{ title: "First" }, { title: "A Second " }],
    album: { title: "music", arts: ["c"] },
    title: "The Test",
    sources: ["a"],
  };
  const b = {
    artists: [{ title: "A Second" }, { title: "Last" }],
    album: { title: "Music", arts: ["d"], year: 42 },
    sources: ["b", "a"],
    title: "THE TEST",
    meta: "hey",
  };
  expect(merge(a, b)).toEqual({
    artists: [{ title: "A Second " }, { title: "First" }, { title: "Last" }],
    album: { arts: ["c", "d"], title: "Music", year: 42 },
    sources: ["a", "b"],
    title: "The Test",
    meta: "hey",
  });
});
