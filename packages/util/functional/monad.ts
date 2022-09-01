import type {
  Unwrapped,
  Thenable,
  Wrapped,
  Wrapper,
  Monad,
  Resolve,
  Reject,
} from "./monad.types";
import type { HKT } from "./hkt";

const error = Symbol();
const noop: Wrapper = (value, fn) => fn(value);

function monad<F extends HKT>(transform = noop) {
  const failure = (reject?: Reject) => (e?: any) => {
    try {
      return reject ? transform(e, reject) : { [error]: e };
    } catch (message) {
      return { [error]: message };
    }
  };

  const wrap = <T>(value: T): Monad<T, F> => ({
    then(resolve, reject) {
      const success: Resolve<T, any, F> = (x) => {
        if (invalid(x)) throw x[error];
        return resolve ? transform(x, resolve) : x;
      };

      return wrap(apply(success, failure(reject))(value));
    },
    catch(reject) {
      const success: Resolve<T, any, F> = (x) => {
        if (invalid(x)) throw x[error];
        return x;
      };

      return wrap(apply(success, failure(reject))(value));
    },
    unwrap() {
      return unwrap(value);
    },
  });

  /// TODO: dedupe identical monads
  /// TODO: add promises to monad HKT chain (now they are lost)
  return <T>(value: T) => wrap(value).then((x) => x);
}

function unwrap<T>(value: Wrapped<T> | Thenable<T> | T): Unwrapped<T> {
  if (unwrappable(value)) value = value.unwrap() as any;
  // Instantly unwrap synchronous thenables
  if (thenable(value)) {
    const nothing = Symbol();
    let result: any = nothing;

    value = value.then(
      (x) => (result = unwrap(x)),
      (e) => (result = { [error]: e })
    ) as any;
    value = result !== nothing ? result : value;
  }
  if (invalid(value)) throw value[error];
  return value as any;
}

function apply<T, U, F extends HKT>(resolve: Resolve<T, U, F>, reject: Reject) {
  return function next(value: any): any {
    if (thenable(value)) return value.then(next, reject);
    try {
      return resolve(value);
    } catch (message) {
      return reject(message);
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
