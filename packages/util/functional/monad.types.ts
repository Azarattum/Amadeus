import type { Composed, HKT } from "./hkt";

type Wrapper = (value: any, fn: (value: any) => any) => any;
type Resolve<T, R = any> = (value: T) => R;
type Reject<R = any> = (reason?: any) => R;

interface Thenable<T> {
  then<U = T, K = never>(
    resolved?: Resolve<Awaited<T>, U | Thenable<U>> | null,
    rejected?: Reject<K | Thenable<K>> | null
  ): Thenable<U | K>;
}

interface Catchable {
  catch<U = never>(rejected?: Reject<U | Thenable<U>> | null): Catchable;
}

interface Wrapped<T> {
  unwrap(): Unwrapped<T>;
}

interface Monad<T = any, F extends HKT[] = []> {
  then<Result1 = T, Result2 = never>(
    resolved?: Resolve<Composed<F, T>, Result1> | null,
    rejected?: Reject<Result2> | null
  ): Resolved<Result1 | Result2, T, F>;

  catch<Result1 = never>(
    rejected?: Reject<Result1> | null
  ): Resolved<T | Result1, T, F>;

  unwrap(): Unwrapped<T, F>;

  readonly [Symbol.toStringTag]: string;
  readonly [state: symbol]: any;
}

// ======================= UTILS ======================= //

interface Future extends HKT<"Promise"> {
  type: Awaited<this[""]>;
}

type Unwrapped<T, F extends HKT[] = []> = Contains<F, Future> extends true
  ? Promise<T>
  : T;

type Dedupe<T, A> = T extends [infer B, ...infer Tail]
  ? B extends A
    ? [...Dedupe<Tail, B>]
    : [B, ...Dedupe<Tail, B>]
  : T;

type Deduplicated<T extends any[]> = T extends [infer A, ...infer Tail]
  ? [A, ...Dedupe<Tail, A>]
  : T;

type Contains<U extends any[], T> = U extends [T, ...any]
  ? true
  : U extends [any, ...infer Rest]
  ? Contains<Rest, T>
  : false;

type Monadify<T> = T extends Promise<infer U> ? Monad<U, [Future]> : T;

type Merged<T, F extends HKT[] = []> = Monadify<T> extends Monad<
  infer T1,
  infer F1
>
  ? T1 extends Monad<any, any>
    ? Merged<T1, [...F, ...F1]>
    : Monad<T1, [...F, ...F1]>
  : Monad<T, F>;

type Parsed<T, F extends HKT[] = []> = Merged<T, F> extends Monad<
  infer T1,
  infer F1
>
  ? Monad<T1, Deduplicated<F1>>
  : never;

type Resolved<T, U, F extends HKT[] = []> = Composed<F, T> extends never
  ? Parsed<U, F>
  : Parsed<T, F>;

export type {
  Unwrapped,
  Catchable,
  Thenable,
  Wrapped,
  Wrapper,
  Resolve,
  Reject,
  Monad,
};
