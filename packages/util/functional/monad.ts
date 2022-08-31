import type {
  Catchable,
  Unwrapped,
  Thenable,
  Wrapped,
  Wrapper,
  Monad,
} from "./monad.types";
import type { HKT } from "./hkt";

const error = Symbol();
const noop: Wrapper = (value, fn) => fn(value);

function monad<F extends HKT>(transform = noop) {
  const rewrap = <T>(value: T) => wrap<T>(value).then<T>((x: any) => x);
  const wrap = <T>(value: T): Monad<T, F> => ({
    then(resolve, reject) {
      if (!resolve) return wrap(value);
      if (invalid(value)) {
        const resolved = reject?.(value[error]);
        return resolved !== undefined ? rewrap(resolved) : wrap(value);
      }
      return wrap(apply((x) => transform(x, resolve), reject)(value));
    },
    catch(resolve) {
      if (!resolve || !invalid(value)) {
        const caught = catchable(value) ? value.catch(resolve) : value;
        return wrap(caught as any);
      }
      return rewrap(resolve(value[error]));
    },
    unwrap() {
      return unwrap(value);
    },
  });

  return rewrap;
}

function unwrap<T>(value: Wrapped<T> | Thenable<T> | T): Unwrapped<T> {
  if (unwrappable(value)) return value.unwrap() as any;
  if (thenable(value)) return value.then<T>((x) => unwrap(x) as any) as any;
  if (invalid(value)) throw value[error];
  return value as any;
}

function apply<T, U>(fn: (value: T) => U, reject?: (reason: any) => void) {
  return function next(value: any): any {
    if (thenable(value)) return value.then(next, reject);
    try {
      if (invalid(value)) throw value[error];
      return fn(value);
    } catch (message) {
      return { [error]: message };
    }
  };
}

function thenable(value: any): value is Thenable<unknown> {
  return (
    value != null &&
    typeof value === "object" &&
    "then" in value &&
    typeof value["then"] === "function"
  );
}

function catchable(value: any): value is Catchable {
  return (
    value != null &&
    typeof value === "object" &&
    "catch" in value &&
    typeof value["catch"] === "function"
  );
}

function unwrappable(value: any): value is Wrapped<unknown> {
  return (
    value != null &&
    typeof value === "object" &&
    "unwrap" in value &&
    typeof value["unwrap"] === "function"
  );
}

function invalid(value: any): value is { [error]: any } {
  return value != null && typeof value === "object" && error in value;
}

export { monad, unwrap };
