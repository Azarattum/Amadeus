import { stringify } from "./identity";
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
    "ed simons,the chemical brothers,tom rowlands-the test-come with us"
  );
});
