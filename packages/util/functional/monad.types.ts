import type { HKT, Kind } from "./hkt";

type Resolve<T, R = T, F extends HKT = HKT> = (value: Kind<F, Awaited<T>>) => R;
type Reject<R = any> = (reason?: any) => R;

interface Thenable<T> {
  then<U = T, K = never>(
    resolved?: Resolve<T, U | Thenable<U>>,
    rejected?: Reject<K | Thenable<K>>
  ): Thenable<U | K>;
}

interface Catchable {
  catch<U = never>(rejected?: Reject<U | Thenable<U>>): Catchable;
}

interface Wrapped<T> {
  unwrap(): Unwrapped<T>;
}

type Wrapper = (value: any, fn: (value: any) => any) => any;

type Unwrapped<T> = T extends Wrapped<infer U>
  ? Unwrapped<U>
  : T extends Thenable<infer U>
  ? Unwrapped<U> extends Thenable<any>
    ? Unwrapped<U>
    : Thenable<Unwrapped<U>>
  : T;

interface Monad<T, F extends HKT = HKT> {
  then<Result1 = T, Result2 = never>(
    resolved?: Resolve<T, Result1, F>,
    rejected?: Reject<Result2>
  ): Monad<Result1 | Result2, F>;
  catch<Result1 = never>(rejected?: Reject<Result1>): Monad<T | Result1, F>;
  unwrap(): Unwrapped<T>;
}

export type {
  Thenable,
  Catchable,
  Wrapped,
  Monad,
  Unwrapped,
  Wrapper,
  Resolve,
  Reject,
};
