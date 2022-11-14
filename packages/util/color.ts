import { rescape } from "./string";

export const clear = "\x1b[2K\r";
export const reset = "\x1b[0m";
export const bright = "\x1b[1m";
export const dim = "\x1b[2m";
export const black = "\x1b[30m";
export const red = "\x1b[31m";
export const green = "\x1b[32m";
export const yellow = "\x1b[33m";
export const blue = "\x1b[34m";
export const magenta = "\x1b[35m";
export const cyan = "\x1b[36m";
export const white = "\x1b[37m";
export const colors = [
  clear,
  reset,
  bright,
  dim,
  black,
  red,
  green,
  yellow,
  blue,
  magenta,
  cyan,
  white,
] as const;

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

/**
 * Cleans the given string from any colors
 * @param string Text to clean
 */
export function clean(string: string) {
  let clean = string;
  colors.forEach((x) => (clean = clean.replaceAll(x, "")));
  return clean;
}

/** Color type */
export type Color = typeof colors[number];
