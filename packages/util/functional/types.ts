/** Deduplicated consecutive values in a tuple */
type Deduplicated<T extends readonly any[]> = T extends [infer A, ...infer Tail]
  ? [A, ...Dedupe<Tail, A>]
  : T;

type Dedupe<T, A> = T extends [infer B, ...infer Tail]
  ? B extends A
    ? [...Dedupe<Tail, B>]
    : [B, ...Dedupe<Tail, B>]
  : T;

/** Checks whether an elements is present in a tuple */
type Contains<
  U extends readonly any[],
  T,
  True = true,
  False = false
> = IsTuple<
  U,
  U extends [infer R, ...any]
    ? R extends T
      ? True
      : U extends [any, ...infer Rest]
      ? Contains<Rest, T, True, False>
      : False
    : False,
  U extends (infer R)[] ? (T extends R ? True : False) : False
>;

/** Checks whether the value is a tuple or an array */
type IsTuple<
  T extends readonly any[],
  True = true,
  False = false
> = any[] extends T ? False : True;

export type { Deduplicated, Contains, IsTuple };
