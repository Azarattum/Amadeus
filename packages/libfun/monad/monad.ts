import type {
  Extensions,
  Unwrapped,
  Transform,
  Wrappable,
  Promised,
  Identity,
  Resolve,
  Wrapper,
  Wrapped,
  Reject,
  Monad,
  All,
} from "./monad.types";
import { thenable } from "../utils/async";
import { errorify } from "../utils/error";

const empty = Symbol();
const nothing = [empty] as const;
type Nothing = typeof empty | typeof nothing;

const error = Symbol();
const state = Symbol();

function monad<F extends Transform = Identity>(
  transformer: Wrapper<F> = (value, fn) => fn(value),
  extensions: Extensions<F> = {}
) {
  const proto: Monad<unknown, [F]> = {
    then(resolve, reject): any {
      if (native(reject) && native(resolve)) {
        try {
          resolve(this.unwrap());
        } catch (message) {
          reject(message);
        }
        return create(this[state]);
      }

      return create(transform(this[state], resolve, reject, transformer));
    },
    catch(reject): any {
      return this.then((x) => x, reject);
    },
    unwrap(fallback) {
      return unwrap(this[state], fallback);
    },
    expose(): any {
      try {
        const data = unwrap(this[state]);
        if (thenable(data)) {
          return data.then(
            (x) => ({ data: x }),
            (e) => ({ error: invalidate(e)[error] })
          );
        }
        return { data };
      } catch (reason) {
        return { error: invalidate(reason)[error] };
      }
    },
    get [Symbol.toStringTag]() {
      return "Monad";
    },
  };

  const create = <T>(value: T): Monad<T, [F]> => {
    while (value && Object.getPrototypeOf(value) === extensions) {
      value = (value as any)[state];
    }
    const instance = { [state]: value };
    return Object.setPrototypeOf(instance, extensions);
  };

  Object.setPrototypeOf(extensions, proto);
  return <T extends F["accept"]>(value: T) => create(value).then((x) => x);
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

function unwrap<T, U = never, F extends Transform[] = [Identity]>(
  value: Monad<T, F> | PromiseLike<T> | T,
  fallback?: U
): Unwrapped<F, T> | Promised<F, U> {
  if (unwrappable(value)) value = value.unwrap(fallback) as any;
  if (thenable(value)) {
    value = value.then(
      (x) => unwrap(x, fallback) as any,
      (e) => {
        if (fallback !== undefined) return fallback;
        throw e;
      }
    ) as any;
  }

  if (invalid(value)) {
    if (fallback === undefined) throw value[error];
    return fallback as any;
  }
  return value as any;
}

function transform<T, F extends Transform = Identity>(
  value: T,
  resolve?: Resolve<T>,
  reject?: Reject,
  transformer: Wrapper<F> = (value, fn) => fn(value)
) {
  return apply(
    (value) => {
      if (invalid(value)) throw value[error];
      return resolve ? transformer(value, resolve as any) : value;
    },
    (reason) => {
      try {
        return reject ? transformer(reason, reject) : invalidate(reason);
      } catch (reason) {
        return invalidate(reason);
      }
    }
  )(value);
}

function apply<T, U, F extends Transform>(
  resolve: Resolve<Wrapped<[F], T>, U>,
  reject: Reject
) {
  return function next(value: any): any {
    if (thenable(value)) return value.then(next, reject);
    try {
      return resolve ? resolve(value) : value;
    } catch (reason) {
      return reject ? reject(reason) : reason;
    }
  };
}

function unwrappable<T = unknown>(value: any): value is Wrappable<T> {
  return (
    value !== null &&
    typeof value === "object" &&
    "unwrap" in value &&
    typeof value["unwrap"] === "function"
  );
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

function invalid(value: any): value is { [error]: any } {
  return value !== null && typeof value === "object" && error in value;
}

function invalidate(what: unknown): { [error]: Error } {
  if (invalid(what)) what = what[error];
  return { [error]: errorify(what) };
}

export { monad, all, unwrap, transform, state, nothing };
export type { Transform as Monad, Nothing };
