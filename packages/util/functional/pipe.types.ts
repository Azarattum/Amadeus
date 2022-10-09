import type { Monad, MonadsTransform, Unwrapped } from "./monad.types";
import type { Arrayify, Deduplicated, Last } from "./types";

type λs = λ<any, any>[];
type γs = γ<any[], any>[];
type λ<A, Z> = (arg: Awaited<A>) => Z;
type γ<A, Z> = A extends any[] ? (...args: A) => Z : never;

type λ2<A, B, C> = [γ<A, B>, λ<B, C>];
type λ3<A, B, C, D> = [...λ2<A, B, C>, λ<C, D>];
type λ4<A, B, C, D, E> = [...λ3<A, B, C, D>, λ<D, E>];
type λ5<A, B, C, D, E, F> = [...λ4<A, B, C, D, E>, λ<E, F>];
type λ6<A, B, C, D, E, F, G> = [...λ5<A, B, C, D, E, F>, λ<F, G>];
type λ7<A, B, C, D, E, F, G, H> = [...λ6<A, B, C, D, E, F, G>, λ<G, H>];
type λ8<A, B, C, D, E, F, G, H, I> = [...λ7<A, B, C, D, E, F, G, H>, λ<H, I>];
type λ_<A, B, C, D, E, F, G, H, I, Z extends λs> = [
  ...λ8<A, B, C, D, E, F, G, H, I>,
  ...λn<I, Z>
];

type λn<A, Z extends λs> = Z extends [λ<any, infer B>, ...infer Rest]
  ? Rest extends [any, ...any]
    ? [λ<A, B>, ...λn<B, Rest>]
    : [λ<A, B>]
  : Z;

type Type = "pipe" | "pipeline";
type Awaits<T> = { -readonly [P in keyof T]: Awaited<T[P]> };
type Returns<T extends γs> = { -readonly [P in keyof T]: ReturnType<T[P]> };
type Thenable<T> = T | Monad<T, any[]> | Promise<T>;
type Thenify<T extends any[]> = Arrayify<{
  -readonly [P in keyof T]: Thenable<T[P]>;
}>;
type Spread<T> = T extends [infer A extends any[], ...infer B]
  ? [...A, ...B]
  : T;
type Resolve<M extends any[]> = MonadsTransform<Spread<M>> extends []
  ? Last<M>
  : Unwrapped<Deduplicated<MonadsTransform<Spread<M>>>, Awaited<Last<M>>>;

type To<Y extends Type, M extends any[]> = Y extends "pipeline"
  ? (...args: Thenify<M[0]>) => Resolve<M>
  : Resolve<M>;

// prettier-ignore
type Flow<Y extends Type, X extends any[] = unknown[]> = {
  <A = X>(): To<Y, [A extends any[] ? A[0] : A]>;
  <B, A = X>(_: γ<Awaits<A>, B>): To<Y, [A, B]>;
  <C, B, A = X>(..._: λ2<Awaits<A>, B, C>): To<Y, [A, B, C]>;
  <D, C, B, A = X>(..._: λ3<Awaits<A>, B, C, D>): To<Y, [A, B, C, D]>;
  <E, D, C, B, A = X>(..._: λ4<Awaits<A>, B, C, D, E>): To<Y, [A, B, C, D, E]>;
  <F, E, D, C, B, A = X>(..._: λ5<Awaits<A>, B, C, D, E, F>): To<Y, [A, B, C, D, E, F]>;
  <G, F, E, D, C, B, A = X>(..._: λ6<Awaits<A>, B, C, D, E, F, G>): To<Y, [A, B, C, D, E, F, G]>;
  <H, G, F, E, D, C, B, A = X>(..._: λ7<Awaits<A>, B, C, D, E, F, G, H>): To<Y, [A, B, C, D, E, F, G, H]>;
  <I, H, G, F, E, D, C, B, A = X>(..._: λ8<Awaits<A>, B, C, D, E, F, G, H, I>): To<Y, [A, B, C, D, E, F, G, H, I]>;

  <Z extends λs, I, H, G, F, E, D, C, B, A = X>(
    ..._: λ_<Awaits<A>, B, C, D, E, F, G, H, I, Z>
  ): To<Y, [A, B, C, D, E, F, G, H, I, ...Returns<Z>]>;
};

type Pipeline = Flow<"pipeline">;
type Pipe = <T extends any[]>(...data: T) => Flow<"pipe", T>;

export type { Pipeline, Pipe };
