import type { Combine, Contains, IsNever, IsTuple } from "./types";
import type { HKT, Piped, Composed } from "./hkt";

type Transforms = readonly Transform[];
type Wrapper = (value: any, fn: (value: any) => any) => any;
type Resolve<T, R = any> = (value: T) => R;
type Reject<R = any> = (reason?: any) => R;
type Unwrapped<F extends Transforms, T> = IsNever<
  T,
  never,
  Composed<F, T, "unwrap">
>;
type Wrapped<F extends Transforms, T> = IsNever<T, never, Piped<F, T, "then">>;
type All<T extends readonly any[]> = MonadsTransform<T> extends []
  ? Monad<T, [Identity]>
  : Monad<MonadsType<T>, MonadsTransform<T>>;

interface Thenable<T> {
  then<U = T, K = never>(
    resolved?: Resolve<Awaited<T>, U | Thenable<U>> | null,
    rejected?: Reject<K | Thenable<K>> | null
  ): Thenable<U | K>;
}

interface Wrappable<T, F extends Transforms = []> {
  unwrap<U = never>(fallback?: U): Unwrapped<F, T> | Promised<F, U>;
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

type Monad<T = any, F extends Transforms = [Identity]> = {
  then<Result1 = T, Result2 = never>(
    resolved?: Resolve<Wrapped<F, T>, Result1> | null,
    rejected?: Reject<Result2> | null
  ): Resolved<Result1 | Wrapped<F, Result2>, T, F>;

  catch<Result1 = never>(
    rejected?: Reject<Result1> | null
  ): Resolved<T | Wrapped<F, Result1>, T, F>;

  unwrap<U = never>(fallback?: U): Unwrapped<F, T> | Promised<F, U>;

  expose(): Promised<
    F,
    | { data: Awaited<Unwrapped<F, T>>; error: undefined }
    | { data: undefined; error: Error }
  >;

  readonly [Symbol.toStringTag]: string;
  readonly [state: symbol]: any;
};

// ======================= UTILS ======================= //

type Promised<F extends Transforms, T> = Contains<F, Future, Promise<T>, T>;

type Merged<T, F extends Transforms> = T extends Monad<infer T1, infer F1>
  ? Merged<T1, Combine<F, F1>>
  : T extends Promise<infer T1>
  ? Merged<T1, Combine<F, [Future]>>
  : [T, F];

type Parsed<T, U extends Transforms> = Merged<T, U> extends [
  infer T1,
  infer U1 extends Transforms
]
  ? Monad<T1, U1>
  : never;

type Resolved<T, U, F extends readonly any[] = []> = IsNever<
  Wrapped<F, T>,
  Parsed<U, F>,
  Parsed<T, F>
>;

type MonadsType<T extends readonly any[]> = IsTuple<
  T,
  T extends readonly [infer A, ...infer Tail]
    ? A extends Monad<infer R, any>
      ? [R, ...MonadsType<Tail>]
      : A extends Promise<infer R>
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
    ? IsNever<A, unknown, A> extends Monad<any, infer R extends Transforms>
      ? Combine<R, MonadsTransform<Tail>>
      : IsNever<A, unknown, A> extends Promise<any>
      ? Combine<[Future], MonadsTransform<Tail>>
      : MonadsTransform<Tail>
    : [],
  T extends readonly (infer A)[]
    ? (A extends Monad<any, infer F> ? F : A) extends infer K
      ? K extends Promise<any>
        ? [Future]
        : K extends Transforms
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
