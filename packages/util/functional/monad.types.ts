import type { HKT, Kind } from "./hkt";

interface Thenable<T> {
  then<U = T, K = never>(
    resolved?: (value: Awaited<T>) => U | Thenable<U>,
    rejected?: (reason?: any) => K | Thenable<K>
  ): Thenable<U | K>;
}

interface Catchable {
  catch<U = never>(rejected?: (reason?: any) => U | Thenable<U>): Catchable;
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
    resolved?: (value: Kind<F, Awaited<T>>) => Result1,
    rejected?: (reason?: any) => Result2
  ): Monad<Result1 | Result2, F>;
  catch<U = never>(rejected?: (reason?: any) => U): Monad<T | U, F>;
  unwrap(): Unwrapped<T>;
}

export type { Thenable, Catchable, Wrapped, Monad, Unwrapped, Wrapper };
