import type { Fn } from "./types";

/** ==================== Helpers ===================== */

type λ<A extends any[] = any[], Z = any> = (
  ...args: { -readonly [P in keyof A]: Awaited<A[P]> }
) => Z;

type Result<Z> = Z extends [...any, Fn<any[], infer R>]
  ? R
  : Z extends Fn<any[], infer R>[]
  ? R
  : Z;

type To<A, Z, Y> = Y extends false
  ? Fn<A extends [infer T] ? T : A, Result<Z>>
  : Result<Z>;

type Args<A, Z extends Fn[]> = Z extends [Fn<any[], infer R>, ...infer Rest]
  ? Rest extends [Fn, ...any]
    ? [λ<[A], R>, ...Args<R, Rest>]
    : [λ<[A], R>]
  : Z;

/** =================== Arguments ==================== */

type Arg1<A extends any[], Z> = [λ<A, Z>];
type Arg2<A extends any[], B, Z> = [λ<A, B>, λ<[B], Z>];
type Arg3<A extends any[], B, C, Z> = [...Arg2<A, B, C>, λ<[C], Z>];
type Arg4<A extends any[], B, C, D, Z> = [...Arg3<A, B, C, D>, λ<[D], Z>];
type Arg5<A extends any[], B, C, D, E, Z> = [...Arg4<A, B, C, D, E>, λ<[E], Z>];
// prettier-ignore
type Arg6<A extends any[], B, C, D, E, F, Z> = [...Arg5<A, B, C, D, E, F>, λ<[F], Z>];
// prettier-ignore
type Arg7<A extends any[], B, C, D, E, F, G, Z> = [...Arg6<A, B, C, D, E, F, G>, λ<[G], Z>];
// prettier-ignore
type ArgAny<A extends any[], B, C, D, E, F, G, H, Z extends Fn[]> = [...Arg7<A, B, C, D, E, F, G, H>, ...Args<H, Z>];

/** ================= Implementation ================= */

// prettier-ignore
type Pipe<X extends any[] = unknown[], Y = false> = {
  <A extends any[] = X>(): To<A, A[0], Y>;
  <Z, A extends any[] = X>(..._: Arg1<A, Z>): To<A, Z, Y>;
  <B, Z, A extends any[]= X>(..._: Arg2<A, B, Z>): To<A, Z, Y>;
  <B, C, Z, A extends any[]= X>(..._: Arg3<A, B, C, Z>): To<A, Z, Y>;
  <B, C, D, Z, A extends any[]= X>(..._: Arg4<A, B, C, D, Z>): To<A, Z, Y>;
  <B, C, D, E, Z, A extends any[]= X>(..._: Arg5<A, B, C, D, E, Z>): To<A, Z, Y>;
  <B, C, D, E, F, Z, A extends any[]= X>(..._: Arg6<A, B, C, D, E, F, Z>): To<A, Z, Y>;
  <B, C, D, E, F, G, Z, A extends any[] = X>(..._: Arg7<A, B, C, D, E, F, G, Z>): To<A, Z, Y>;
  <B, C, D, E, F, G, H, Z extends Fn[], A extends any[]= X>(
    ..._: ArgAny<A, B, C, D, E, F, G, H, Z>
  ): To<A, Z, Y>;
  <Z extends Fn[], A = X>(..._: Args<A, Z>): To<A, Z, Y>;
};

type Pipeline = <T extends any[]>(...data: T) => Pipe<T, true>;

export type { Pipe, Pipeline };
