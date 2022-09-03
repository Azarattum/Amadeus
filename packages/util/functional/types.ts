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
type IsTuple<
  T extends readonly any[],
  True = true,
  False = false
> = any[] extends T ? False : True;

/** Checks whether the type `T` is equal to `never` */
type IsNever<T, True = true, False = false> = [T] extends [never]
  ? True
  : False;

export type { Deduplicated, IsTuple, IsNever };
