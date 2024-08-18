import type { Either } from "@amadeus-music/ui/internal/types";

/** Returns the input object if it is an object, otherwise returns null */
function ok<T>(maybeObject: T) {
  return typeof maybeObject === "object" ? maybeObject : null;
}

/** Creates a new array with unique values from the input array. */
function unique<T>(x: T[]) {
  return [...new Set(x)];
}

/**
 * Coerces object to its either form (has no runtime effect)
 */
function gather<T extends Record<string, unknown>>(object: T) {
  return object as Either<T>;
}

/** Finds the entry in the object where the value is an object */
function which<T extends Record<string, any>>(
  object: T,
): readonly [keyof T | undefined, (T[keyof T] & object) | null] {
  const entries = Object.entries(object);
  const nothing = () => [entries.find((entry) => entry[1])?.[0], null] as const;
  return entries.find((entry) => ok(entry[1])) || nothing();
}

export { gather, unique, which, ok };
