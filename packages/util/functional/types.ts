/** Deduplicated consecutive values in a tuple */
type Deduplicated<T extends readonly any[]> = T extends [infer A, ...infer Tail]
  ? [A, ...Dedupe<Tail, A>]
  : T;

type Dedupe<T, A> = T extends [infer B, ...infer Tail]
  ? B extends A
    ? [...Dedupe<Tail, B>]
    : [B, ...Dedupe<Tail, B>]
  : T;

/** Checks whether the value is a tuple or an array */
type IsTuple<T, True = true, False = false> = T extends readonly [any, ...any]
  ? True
  : T extends []
  ? True
  : False;

/** Checks whether the type `T` is equal to `never` */
type IsNever<T, True = true, False = false> = [T] extends [never]
  ? True
  : False;

/** Returns a flat type of any array/tuple/iterable */
type Flatten<T> = IsTuple<
  T,
  T extends readonly [infer U, ...infer Tail extends any[]]
    ? U extends readonly any[]
      ? Flatten<U>
      : U | Flatten<Tail>
    : never,
  T extends string
    ? T
    : T extends Iterable<infer U>
    ? U extends Iterable<infer R>
      ? Flatten<R>
      : U
    : T
>;

/** Returns the type of the last element of an array or tuple */
type Last<T extends any[]> = IsTuple<T> extends true
  ? T extends [...any[], infer L]
    ? L
    : never
  : T extends (infer L)[]
  ? L
  : never;

/** Function shorthand */
type Fn<A = any[], Z = void> = (...args: A extends any[] ? A : [A]) => Z;

export type { Deduplicated, IsTuple, IsNever, Flatten, Last, Fn };
