import type { Deduplicated, IsTuple } from "./types";
import type { HKT, Piped, Composed } from "./hkt";

type Wrapper = (value: any, fn: (value: any) => any) => any;
type Resolve<T, R = any> = (value: T) => R;
type Reject<R = any> = (reason?: any) => R;
type Unwrapped<F extends readonly Identity[], T> = T extends never
  ? never
  : Composed<F, T, "unwrap">;
type Wrapped<F extends readonly Identity[], T> = T extends never
  ? never
  : Piped<F, T, "then">;
type All<T extends readonly any[]> = MonadsTransform<T> extends []
  ? T
  : Monad<MonadsType<T>, Deduplicated<MonadsTransform<T>>>;

interface Thenable<T> {
  then<U = T, K = never>(
    resolved?: Resolve<Awaited<T>, U | Thenable<U>> | null,
    rejected?: Reject<K | Thenable<K>> | null
  ): Thenable<U | K>;
}

interface Catchable {
  catch<U = never>(rejected?: Reject<U | Thenable<U>> | null): Catchable;
}

interface Wrappable<T, F extends Identity[] = []> {
  unwrap(): Unwrapped<F, T>;
}

interface Identity<ID extends string = string> extends HKT {
  readonly unwrap: this[""];
  readonly then: this[""];
  readonly $: ID;
}

interface Future extends Identity<"Future"> {
  unwrap: Promise<this[""]>;
  then: Awaited<this[""]>;
}

interface Monad<T = any, F extends readonly Identity[] = [Identity]> {
  then<Result1 = T, Result2 = never>(
    resolved?: Resolve<Wrapped<F, T>, Result1> | null,
    rejected?: Reject<Result2> | null
  ): Resolved<Result1 | Wrapped<F, Result2>, T, F>;

  catch<Result1 = never>(
    rejected?: Reject<Result1> | null
  ): Resolved<T | Wrapped<F, Result1>, T, F>;

  unwrap(): Unwrapped<F, T>;

  readonly [Symbol.toStringTag]: string;
  readonly [state: symbol]: any;
}

// ======================= UTILS ======================= //

type Monadify<T> = T extends Promise<infer U> ? Monad<U, [Future]> : T;

type Merged<T, F extends readonly Identity[] = []> = Monadify<T> extends Monad<
  infer T1,
  infer F1
>
  ? Monadify<T1> extends Monad<any, any>
    ? Merged<T1, [...F, ...F1]>
    : Monad<T1, [...F, ...F1]>
  : Monad<T, F>;

type Parsed<T, F extends readonly Identity[] = []> = Merged<T, F> extends Monad<
  infer T1,
  infer F1
>
  ? Monad<T1, Deduplicated<F1>>
  : never;

type Resolved<T, U, F extends readonly Identity[] = []> = Wrapped<
  F,
  T
> extends never
  ? Parsed<U, F>
  : Parsed<T, F>;

type MonadsType<T extends readonly any[]> = IsTuple<
  T,
  T extends readonly [infer A, ...infer Tail]
    ? Monadify<A> extends Monad<infer R, any>
      ? [R, ...MonadsType<Tail>]
      : [A, ...MonadsType<Tail>]
    : [],
  T extends readonly (infer A)[]
    ? ((A extends Monad<infer U, any> ? U : A) extends infer K
        ? K extends Promise<infer U>
          ? U
          : K
        : never)[]
    : never
>;

type MonadsTransform<T extends readonly any[]> = IsTuple<
  T,
  T extends readonly [infer A, ...infer Tail]
    ? A extends Monad<any, infer R extends Identity[]>
      ? [...R, ...MonadsTransform<Tail>]
      : A extends Promise<any>
      ? [Future, ...MonadsTransform<Tail>]
      : [...MonadsTransform<Tail>]
    : [],
  T extends readonly (infer A)[]
    ? (A extends Monad<any, infer F> ? F : A) extends infer K
      ? K extends Promise<any>
        ? [Future]
        : K extends Identity[]
        ? K
        : never
      : never
    : never
>;

export type {
  Identity as Transform,
  Unwrapped,
  Catchable,
  Wrappable,
  Thenable,
  Resolved,
  Wrapped,
  Wrapper,
  Resolve,
  Reject,
  Monad,
  All,
};
