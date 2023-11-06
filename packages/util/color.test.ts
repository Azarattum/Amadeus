import { highlight, paint, reset, blue, red } from "./color";
import { expect, it } from "vitest";

it("paints multiple lines", () => {
  const text = `first\nsecond\nthird`;
  expect(paint(text, red)).toBe(
    `${red}first\n${red}second\n${red}third${reset}`,
  );

  expect(paint(text, red, blue)).toBe(
    `${red}first\n${red}second\n${red}third${reset}${blue}`,
  );
});

it("highlights segments", () => {
  const text = `first\nsecond\nthird`;
  const segments = ["fi", undefined, "never", /ond\n?th/];

  expect(highlight(text, segments, red)).toBe(
    `${red}fi${reset}rst\nsec${red}ond\n${red}th${reset}ird`,
  );

  expect(highlight(text, "second", red, blue)).toBe(
    `first\n${red}second${reset}${blue}\nthird`,
  );

  expect(highlight(text, /s(?=e)/, red)).toBe(
    `first\n${red}s${reset}econd\nthird`,
  );
});
