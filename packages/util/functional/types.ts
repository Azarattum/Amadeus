/** Combines deduplicated arrays without any new duplicates */
type Combine<A extends readonly any[], B extends readonly any[]> = A extends [
  ...infer S,
  infer L
]
  ? Equal<L, B[0], Combine<S, B>, [...A, ...B]>
  : B;

/** Checks whether two types are equal to each other */
type Equal<A, B, True = true, False = false> = A extends B
  ? B extends A
    ? True
    : False
  : False;

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

/** Checks whether a tuple or an array contains the given type */
type Contains<
  T extends readonly any[],
  U,
  True = true,
  False = false
> = IsTuple<
  T,
  T extends [infer Item, ...infer Rest]
    ? U extends Item
      ? True
      : Contains<Rest, U, True, False>
    : False,
  T extends (infer Item)[] ? (U extends Item ? True : False) : never
>;

export type { Contains, Combine, IsTuple, IsNever, Flatten, Equal, Last, Fn };
