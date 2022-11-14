import type {
  MonadsTransform,
  Unwrapped,
  Promised,
  Wrapped,
  Monad,
} from "./monad.types";
import type { Last } from "../utils/types";

type γs = γ<any[], any>[];
type λs = λ<any, any, any[]>[];
type γ<A, Z> = A extends any[] ? (..._: A) => Z : never;
type λ<A, Z, T extends any[]> = (_: Wrapped<Wrappers<T>, Awaited<A>>) => Z;

type λ2<W, A, B, C> = [γ<W, B>, λ<B, C, [A]>];
type λ3<W, A, B, C, D> = [...λ2<W, A, B, C>, λ<C, D, [A, B]>];
type λ4<W, A, B, C, D, E> = [...λ3<W, A, B, C, D>, λ<D, E, [A, B, C]>];
type λ5<W, A, B, C, D, E, F> = [...λ4<W, A, B, C, D, E>, λ<E, F, [A, B, C, D]>];
// prettier-ignore
type λ6<W, A, B, C, D, E, F, G> = [...λ5<W, A, B, C, D, E, F>, λ<F, G, [A, B, C, D, E]>];
// prettier-ignore
type λ7<W, A, B, C, D, E, F, G, H> = [...λ6<W, A, B, C, D, E, F, G>, λ<G, H, [A, B, C, D, E, F]>];
// prettier-ignore
type λ8<W, A, B, C, D, E, F, G, H, I> = [...λ7<W, A, B, C, D, E, F, G, H>, λ<H, I, [A, B, C, D, E, F, G]>];
type λ_<W, A, B, C, D, E, F, G, H, I, Z extends λs> = [
  ...λ8<W, A, B, C, D, E, F, G, H, I>,
  ...λn<I, Z, [A, B, C, D, E, F, G, H]>
];

type λn<A, Z extends λs, H extends any[] = []> = Z extends [
  λ<any, infer B, any>,
  ...infer Rest
]
  ? Rest extends [any, ...any]
    ? [λ<A, B, H>, ...λn<B, Rest, [...H, A]>]
    : [λ<A, B, H>]
  : Z;

type Type = "pipe" | "pipeline";
type Awaits<T> = { -readonly [P in keyof T]: Awaited<T[P]> };
type Returns<T extends γs> = { -readonly [P in keyof T]: ReturnType<T[P]> };
type Thenable<T> = T | Monad<T, any> | Promise<T>;
type Thenify<T> = T extends [infer Item, ...infer Rest]
  ? [Thenable<Item>, ...Thenify<Rest>]
  : T;
type Spread<T> = T extends [infer A extends any[], ...infer B]
  ? [...A, ...B]
  : T;
type Wrappers<T extends any[]> = MonadsTransform<Spread<T>>;
type Rewrap<F extends any[], T> = Unwrapped<
  Wrappers<F>,
  Wrapped<Wrappers<F>, Awaited<T>>
>;
type Resolve<M extends any[]> = MonadsTransform<Spread<M>> extends []
  ? Last<M>
  : Rewrap<M, Last<M>>;

type To<Y extends Type, M extends any[]> = Y extends "pipeline"
  ? <T extends Thenify<M[0]>>(
      ..._: T
    ) => Promised<MonadsTransform<T>, Resolve<M>>
  : Resolve<M>;

// prettier-ignore
type Flow<Y extends Type, X extends any[] = unknown[]> = {
  <A = X>(): To<Y, [A extends any[] ? A[0] : A]>;
  <B, A = X>(_: γ<Awaits<A>, B>): To<Y, [A, B]>;
  <C, B, A = X>(..._: λ2<Awaits<A>, A, B, C>): To<Y, [A, B, C]>;
  <D, C, B, A = X>(..._: λ3<Awaits<A>, A, B, C, D>): To<Y, [A, B, C, D]>;
  <E, D, C, B, A = X>(..._: λ4<Awaits<A>, A, B, C, D, E>): To<Y, [A, B, C, D, E]>;
  <F, E, D, C, B, A = X>(..._: λ5<Awaits<A>, A, B, C, D, E, F>): To<Y, [A, B, C, D, E, F]>;
  <G, F, E, D, C, B, A = X>(..._: λ6<Awaits<A>, A, B, C, D, E, F, G>): To<Y, [A, B, C, D, E, F, G]>;
  <H, G, F, E, D, C, B, A = X>(..._: λ7<Awaits<A>, A, B, C, D, E, F, G, H>): To<Y, [A, B, C, D, E, F, G, H]>;
  <I, H, G, F, E, D, C, B, A = X>(..._: λ8<Awaits<A>, A, B, C, D, E, F, G, H, I>): To<Y, [A, B, C, D, E, F, G, H, I]>;

  <Z extends λs, I, H, G, F, E, D, C, B, A = X>(
    ..._: λ_<Awaits<A>, A, B, C, D, E, F, G, H, I, Z>
  ): To<Y, [A, B, C, D, E, F, G, H, I, ...Returns<Z>]>;
};

type Pipeline = Flow<"pipeline">;
type Pipe = <T extends any[]>(...data: T) => Flow<"pipe", T>;

export type { Pipeline, Pipe };
