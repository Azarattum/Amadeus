import type {
  Unwrapped,
  Thenable,
  Wrapped,
  Wrapper,
  Monad,
  Resolve,
  Reject,
  All,
} from "./monad.types";
import type { Composed, HKT } from "./hkt";

const error = Symbol();
const noop: Wrapper = (value, fn) => fn(value);

function monad<F extends HKT>(transform = noop) {
  const failure = (reject?: Reject | null) => (e?: any) => {
    try {
      return reject ? transform(e, reject) : { [error]: e };
    } catch (message) {
      return { [error]: message };
    }
  };

  const state = Symbol();
  const wrap = <T>(value: T): Monad<T, [F]> => {
    // Dedupe monads of the same type
    if (value && typeof value === "object" && state in value) {
      return create((value as any)[state]);
    }
    return create(value);
  };

  const create = <T>(value: T): Monad<T, [F]> => ({
    then(resolve, reject) {
      const success: Resolve<Composed<[F], T>> = (x) => {
        if (invalid(x)) throw x[error];
        return resolve ? transform(x, resolve) : x;
      };

      return wrap(apply(success, failure(reject))(value)) as any;
    },
    catch(reject) {
      const success: Resolve<Composed<[F], T>> = (x) => {
        if (invalid(x)) throw x[error];
        return x;
      };

      return wrap(apply(success, failure(reject))(value)) as any;
    },
    unwrap() {
      return unwrap<T, [F]>(value);
    },
    get [Symbol.toStringTag]() {
      return "Monad";
    },
    get [state]() {
      return value;
    },
  });

  return <T>(value: T) => wrap(value).then((x) => x);
}

function unwrap<T, F extends HKT[]>(
  value: Wrapped<T> | Thenable<T> | T
): Unwrapped<T, F> {
  if (unwrappable(value)) value = value.unwrap();
  // Instantly unwrap synchronous thenables
  if (thenable(value)) {
    const nothing = Symbol();
    let result: any = nothing;

    value = value.then(
      (x) => (result = unwrap<T, F>(x)),
      (e) => (result = { [error]: e })
    ) as any;
    value = result !== nothing ? result : value;
  }
  if (invalid(value)) throw value[error];
  return value as any;
}

function apply<T, U, F extends HKT>(
  resolve: Resolve<Composed<[F], T>, U>,
  reject: Reject
) {
  return function next(value: any): any {
    if (thenable(value)) return value.then(next, reject);
    try {
      return resolve(value);
    } catch (message) {
      return reject(message);
    }
  };
}

function all<T extends readonly any[]>(values: T) {
  let monad = null;
  let buffer: any[] = [];
  for (const value of values) {
    if (!thenable(value)) {
      buffer.push(value);
      continue;
    }

    const current = [...buffer];
    if (!monad) {
      monad = value.then((x) => [...current, x]);
    } else {
      monad = monad.then((x) => value.then((y) => [...x, ...current, y]));
    }
    buffer = [];
  }

  if (!monad) return buffer as any as All<T>;
  return monad.then((x) => [...x, ...buffer]) as All<T>;
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

export { monad, unwrap, all };
