import { rescape } from "./string";

export const reset: Color = "\x1b[0m";
export const bright: Color = "\x1b[1m";
export const dim: Color = "\x1b[2m";
export const black: Color = "\x1b[30m";
export const red: Color = "\x1b[31m";
export const green: Color = "\x1b[32m";
export const yellow: Color = "\x1b[33m";
export const blue: Color = "\x1b[34m";
export const magenta: Color = "\x1b[35m";
export const cyan: Color = "\x1b[36m";
export const white: Color = "\x1b[37m";

/**
 * Colors a given string with respect to multiple lines
 * @param string String to paint
 * @param color Color to paint the string
 * @param regular Regular color of the text
 */
export function paint(string: string, color: Color, regular = reset) {
  return (
    string.replace(/(\n|^)/g, "$&" + color) +
    reset +
    (regular !== reset ? regular : "")
  );
}

/**
 * Highlight parts of a string with a given color
 * @param string String to process
 * @param segments An array of patterns of segments to highlight
 * @param color Highlighted color
 * @param regular Regular (non highlighted) color
 */
export function highlight(
  string: string,
  segments: (string | RegExp | undefined)[] | (string | RegExp | undefined),
  color: Color,
  regular = reset
) {
  if (!Array.isArray(segments)) segments = [segments];
  for (let segment of segments) {
    if (!segment) continue;
    if (typeof segment === "string") segment = rescape(segment);
    string = string.replace(segment, (x) => paint(x, color, regular));
  }
  return string;
}

/** Color type */
export type Color =
  | "\x1b[0m"
  | "\x1b[1m"
  | "\x1b[2m"
  | "\x1b[30m"
  | "\x1b[31m"
  | "\x1b[32m"
  | "\x1b[33m"
  | "\x1b[34m"
  | "\x1b[35m"
  | "\x1b[36m"
  | "\x1b[37m";
