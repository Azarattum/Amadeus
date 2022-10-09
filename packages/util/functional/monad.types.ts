import type { Contains, Deduplicated, IsNever, IsTuple } from "./types";
import type { HKT, Piped, Composed } from "./hkt";

type Wrapper = (value: any, fn: (value: any) => any) => any;
type Resolve<T, R = any> = (value: T) => R;
type Reject<R = any> = (reason?: any) => R;
type Unwrapped<F extends readonly Transform[], T> = T extends never
  ? never
  : Composed<F, T, "unwrap">;
type Wrapped<F extends readonly Transform[], T> = T extends never
  ? never
  : Piped<F, T, "then">;
type All<T extends readonly any[]> = MonadsTransform<T> extends []
  ? Monad<T, [Identity]>
  : Monad<MonadsType<T>, Deduplicated<MonadsTransform<T>>>;

interface Thenable<T> {
  then<U = T, K = never>(
    resolved?: Resolve<Awaited<T>, U | Thenable<U>> | null,
    rejected?: Reject<K | Thenable<K>> | null
  ): Thenable<U | K>;
}

interface Wrappable<T, F extends Transform[] = []> {
  unwrap<U = never>(
    fallback?: U
  ): Unwrapped<F, T> | Contains<F, Future, Promise<U>, U>;
}

interface Transform<ID extends string = string> extends HKT {
  readonly unwrap: this[""];
  readonly then: this[""];
  readonly accept: any;
  readonly $: ID;
}

interface Identity extends Transform<"Identity"> {
  unwrap: this[""];
  then: this[""];
}

interface Future extends Transform<"Future"> {
  unwrap: Promise<this[""]>;
  then: Awaited<this[""]>;
}

interface Monad<T = any, F extends readonly Transform[] = [Identity]> {
  then<Result1 = T, Result2 = never>(
    resolved?: Resolve<Wrapped<F, T>, Result1> | null,
    rejected?: Reject<Result2> | null
  ): Resolved<Result1 | Wrapped<F, Result2>, T, F>;

  catch<Result1 = never>(
    rejected?: Reject<Result1> | null
  ): Resolved<T | Wrapped<F, Result1>, T, F>;

  unwrap<U = never>(
    fallback?: U
  ): Unwrapped<F, T> | Contains<F, Future, Promise<U>, U>;

  readonly [Symbol.toStringTag]: string;
  readonly [state: symbol]: any;
}

// ======================= UTILS ======================= //

type Monadify<T> = IsNever<T, unknown, T> extends Promise<infer U>
  ? IsNever<U, unknown, U> extends Promise<any>
    ? Monadify<U>
    : Monad<U, [Future]>
  : IsNever<T, unknown, T>;

type Merged<T, F extends readonly Transform[] = []> = Monadify<T> extends Monad<
  infer T1,
  infer F1
>
  ? Monadify<T1> extends Monad<any, any>
    ? Merged<T1, [...F, ...F1]>
    : Monad<T1, [...F, ...F1]>
  : Monad<T, F>;

type Parsed<T, F extends readonly Transform[] = []> = Merged<
  T,
  F
> extends Monad<infer T1, infer F1>
  ? Monad<T1, Deduplicated<F1>>
  : never;

type Resolved<T, U, F extends readonly Transform[] = []> = Wrapped<
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
    ? IsNever<A, unknown, A> extends Monad<any, infer R extends Transform[]>
      ? [...R, ...MonadsTransform<Tail>]
      : IsNever<A, unknown, A> extends Promise<any>
      ? [Future, ...MonadsTransform<Tail>]
      : [...MonadsTransform<Tail>]
    : [],
  T extends readonly (infer A)[]
    ? (A extends Monad<any, infer F> ? F : A) extends infer K
      ? K extends Promise<any>
        ? [Future]
        : K extends Transform[]
        ? K
        : never
      : never
    : never
>;

export type {
  MonadsTransform,
  Transform,
  Unwrapped,
  Wrappable,
  Thenable,
  Identity,
  Wrapped,
  Wrapper,
  Resolve,
  Future,
  Reject,
  Monad,
  All,
};
