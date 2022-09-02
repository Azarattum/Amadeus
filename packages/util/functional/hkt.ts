interface HKT {
  readonly type: this[""];
  readonly ""?: unknown;
}

type Kind<F extends HKT, T, K extends keyof F = "type"> = (F & {
  readonly "": T;
})[K];

type Piped<
  F extends readonly HKT[],
  T,
  K extends keyof F[number] = "type"
> = F extends [...infer Rest extends HKT[], infer Last extends HKT]
  ? Kind<Last, Piped<Rest, T, K>, K>
  : T;

type Composed<
  F extends readonly HKT[],
  T,
  K extends keyof F[number] = "type"
> = F extends [infer First extends HKT, ...infer Rest extends HKT[]]
  ? Kind<First, Piped<Rest, T, K>, K>
  : T;

export type { HKT, Kind, Piped, Composed };
