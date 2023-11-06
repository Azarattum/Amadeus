import { type ClassNameValue, twMerge } from "tailwind-merge";

export function tw(
  strings: TemplateStringsArray,
  ...interpolated: readonly ClassNameValue[]
) {
  if (strings.length === 1 && !interpolated.length) return strings[0];
  return twMerge(
    strings.reduce(
      (arr, x, i) => (arr.push(x, interpolated[i]), arr),
      [] as ClassNameValue[],
    ),
  );
}
