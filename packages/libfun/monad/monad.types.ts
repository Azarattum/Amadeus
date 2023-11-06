import type { Contains, Combine, IsNever, IsTuple } from "../utils/types";
import type { Composed, Piped, Kind, HKT } from "../utils/hkt";

type Transforms = readonly Transform[];
type Resolve<T, R = any> = ((value: T) => R) | null;
type Reject<R = any> = ((reason?: any) => R) | null;
type Unwrapped<F extends Transforms, T> = IsNever<
  T,
  never,
  Composed<F, T, "unwrap">
>;
type Wrapped<F extends Transforms, T> = IsNever<T, never, Piped<F, T, "then">>;
type All<T extends readonly any[]> = MonadsTransform<T> extends []
  ? Monad<T, [Identity]>
  : Monad<MonadsType<T>, MonadsTransform<T>>;

interface Wrappable<T, F extends Transforms = []> {
  unwrap<U = never>(fallback?: U): Unwrapped<F, T> | Promised<F, U>;
}

interface Transform<ID extends string = string> extends HKT {
  readonly extensions: Record<any, any>;
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

declare const types: unique symbol;
interface Base<T = any, F extends Transforms = [Identity]> {
  then<Result1 = T, Result2 = never>(
    resolved?: Resolve<Wrapped<F, T>, Result1>,
    rejected?: Reject<Result2>,
  ): Resolved<Wrapped<F, Result2> | Result1, T, F>;

  expose(): Promised<
    F,
    | { data: Awaited<Unwrapped<F, T>>; error: undefined }
    | { data: undefined; error: Error }
  >;

  catch<Result1 = never>(
    rejected?: Reject<Result1>,
  ): Resolved<Wrapped<F, Result1> | T, T, F>;

  unwrap<U = never>(fallback?: U): Unwrapped<F, T> | Promised<F, U>;

  finally(handler?: (() => void) | undefined | null): Base<T, F>;

  readonly [Symbol.toStringTag]: string;
  readonly [types]?: [T, F];
  [state: symbol]: any;
}

type Monad<T = any, F extends Transforms = [Identity]> = Base<T, F> &
  (F extends [infer U extends Transform, ...any[]]
    ? Kind<U, T, "extensions">
    : Record<string, never>);

// ======================= UTILS ======================= //

type Monadify<T> = T extends Promise<infer U> ? Monad<U, [Future]> : T;
type Promised<F extends Transforms, T> = IsNever<
  T,
  never,
  Contains<F, Future, Promise<T>, T>
>;

type Merged<T, F extends Transforms> = Monadify<T> extends Monad<
  infer T1,
  infer F1
>
  ? Merged<T1, Combine<F, F1>>
  : [T, F];

type Parsed<T, U extends Transforms> = Merged<T, U> extends [
  infer T1,
  infer U1 extends Transforms,
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

type Wrapper<F extends Transform> = {
  <U>(
    value: F["accept"] | Error,
    fn: <T>(value: Kind<F, T, "then"> | Error) => U,
  ): Kind<F, U, "unwrap">;
};

type Extensions<F extends Transform> =
  | {
      [key in keyof (F["extensions"] &
        Partial<Monad<unknown, [F]>>)]: (F["extensions"] &
        Monad<unknown, [F]>)[key] extends (..._: infer P) => infer R
        ? (this: Monad<unknown, [F]>, ..._: P) => R
        : (F["extensions"] & Monad<unknown, [F]>)[key];
    }
  | Record<string, never>;

export type {
  MonadsTransform,
  Extensions,
  Transform,
  Unwrapped,
  Wrappable,
  Promised,
  Identity,
  Wrapped,
  Wrapper,
  Resolve,
  Future,
  Reject,
  Monad,
  All,
};
