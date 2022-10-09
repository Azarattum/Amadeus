import type {
  Unwrapped,
  Transform,
  Wrappable,
  Thenable,
  Identity,
  Resolve,
  Wrapper,
  Wrapped,
  Reject,
  Monad,
  All,
  Future,
} from "./monad.types";
import type { Contains } from "./types";

const error = Symbol();
const noop: Wrapper = (value, fn) => fn(value);

function monad<F extends Transform = Identity>(transform = noop) {
  type M<T> = Monad<T, [F]>;

  const failure = (reject?: Reject | null) => (e?: any) => {
    try {
      return reject ? transform(e, reject) : { [error]: e };
    } catch (message) {
      return { [error]: message };
    }
  };

  const state = Symbol();
  const wrap = <T>(value: T): M<T> => {
    // Dedupe monads of the same type
    if (value && typeof value === "object" && state in value) {
      return create((value as any)[state]);
    }
    return create(value);
  };

  const create = <T>(value: T): M<T> => ({
    then(resolve, reject) {
      if (native(reject) && native(resolve)) {
        try {
          resolve(unwrap<[F], T>(value));
        } catch (message) {
          reject(message);
        }
        return wrap(value);
      }

      const success: Resolve<Wrapped<[F], T>> = (x) => {
        if (invalid(x)) throw x[error];
        return resolve ? transform(x, resolve) : x;
      };

      return wrap(apply(success, failure(reject))(value)) as any;
    },
    catch(reject) {
      const success: Resolve<Wrapped<[F], T>> = (x) => {
        if (invalid(x)) throw x[error];
        return x;
      };

      return wrap(apply(success, failure(reject))(value)) as any;
    },
    unwrap(fallback) {
      return unwrap<[F], T>(value, fallback as any);
    },
    get [Symbol.toStringTag]() {
      return "Monad";
    },
    get [state]() {
      return value;
    },
  });

  return <T extends F["accept"]>(value: T) => wrap(value).then((x) => x);
}

function unwrap<F extends Transform[], T, U = never>(
  value: Wrappable<T> | Thenable<T> | T,
  fallback?: U
): Unwrapped<F, T> | Contains<F, Future, Promise<U>, U> {
  if (unwrappable(value)) value = value.unwrap(fallback) as any;
  // Instantly unwrap synchronous thenables
  if (thenable(value)) {
    const nothing = Symbol();
    let result: any = nothing;

    value = value.then(
      (x) => (result = unwrap<F, T>(x, fallback as any) as any),
      (e) => {
        if (fallback !== undefined) return fallback;
        if (value instanceof Promise) throw e;
        return (result = { [error]: e });
      }
    ) as any;
    value = result !== nothing ? result : value;
  }
  if (invalid(value)) {
    if (fallback !== undefined) return fallback as any;
    throw value[error];
  }
  return value as any;
}

function apply<T, U, F extends Transform>(
  resolve: Resolve<Wrapped<[F], T>, U>,
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
  let container = monad()([] as any);
  let buffer: any[] = [];
  for (const value of values) {
    if (!thenable(value)) {
      buffer.push(value);
      continue;
    }

    const current = [...buffer];
    container = container.then((x) => value.then((y) => [...x, ...current, y]));
    buffer = [];
  }

  return container.then((x) => [...x, ...buffer]) as All<T>;
}

/// TODO: implement a safe unwrap function
//    (returns an error, does not throw it)

function thenable(value: any): value is Thenable<unknown> {
  return (
    value != null &&
    typeof value === "object" &&
    "then" in value &&
    typeof value["then"] === "function"
  );
}

function unwrappable(value: any): value is Wrappable<unknown> {
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

function native(fn: any, args = 1): fn is (...args: any[]) => void {
  if (typeof fn !== "function") return false;
  const signature = Function.prototype.toString.call(fn);
  return (
    signature === "function () { [native code] }" &&
    fn.length === args &&
    fn.name === ""
  );
}

export { monad, unwrap, all };
export type { Transform as Monad };
