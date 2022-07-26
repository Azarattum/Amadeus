import { Struct, assert as test, StructError } from "superstruct";

/**
 * A wrapper around superstruct's `assert` that assert that a value passes a
 * struct, throwing if it doesn't. It also allows for a custom error message.
 */
export function assert<T, S>(
  value: unknown,
  struct: Struct<T, S>,
  message = ""
): asserts value is T {
  try {
    test(value, struct);
  } catch (error) {
    if (error instanceof StructError && message) {
      error.message = message + "\n" + error.message;
    }
    throw error;
  }
}
