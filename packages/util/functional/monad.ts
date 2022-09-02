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
} from "./monad.types";

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
      /// TODO: find a better solution
      const native = "function () { [native code] }";
      if (resolve?.toString() === native && reject?.toString() === native) {
        try {
          return resolve(unwrap<[F], T>(value));
        } catch (message) {
          return reject(message);
        }
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
    unwrap() {
      return unwrap<[F], T>(value);
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

function unwrap<F extends Transform[], T>(
  value: Wrappable<T> | Thenable<T> | T
): Unwrapped<F, T> {
  if (unwrappable(value)) value = value.unwrap();
  // Instantly unwrap synchronous thenables
  if (thenable(value)) {
    const nothing = Symbol();
    let result: any = nothing;

    value = value.then(
      (x) => (result = unwrap<F, T>(x)),
      (e) => {
        // TODO: consider unified validation (see line 109)
        if (value instanceof Promise) throw e;
        return (result = { [error]: e });
      }
    ) as any;
    value = result !== nothing ? result : value;
  }
  if (invalid(value)) throw value[error];
  return value as any;
}

function apply<T, U, F extends Transform>(
  resolve: Resolve<Wrapped<[F], T>, U>,
  reject: Reject
) {
  return function next(value: any): any {
    const validate = (fn: Resolve<Wrapped<[F], T>, U>) => (e: any) => {
      const result = fn(e);
      if (invalid(result) && value instanceof Promise) throw result[error];
      return result;
    };

    if (thenable(value)) return value.then(validate(next), reject);
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

export { monad, unwrap, all };
export type { Transform as Monad };
