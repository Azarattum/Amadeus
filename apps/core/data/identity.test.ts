import { stringify, uniquify } from "./identity";
import { expect, it } from "vitest";

it("stringifies track", () => {
  const track = {
    title: "The Test",
    artists: ["The Chemical Brothers", "Ed Simons", "Tom Rowlands"],
    album: "Come With Us",
    length: 466.28,
    year: null,
  };
  expect(stringify(track)).toBe(
    "ed simons,the chemical brothers,tom rowlands - the test - come with us"
  );
});

it("uniquifies track", () => {
  const track = {
    title: "The Test",
    artists: [{ title: "First" }, { title: "A Second " }],
    album: { title: "Music" },
  };
  expect(uniquify(track)).toEqual({
    id: 4180209679,
    title: "The Test",
    artists: [
      { id: 2851137560, title: "First" },
      { id: 1864478276, title: "A Second " },
    ],
    album: { id: 4108725818, title: "Music" },
  });
});
