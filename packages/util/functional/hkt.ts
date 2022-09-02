interface HKT<Id extends string = string> {
  readonly type: this[""];
  readonly ""?: unknown;
  readonly $: Id;
}

type Kind<F extends HKT, T> = (F & { readonly "": T })["type"];

type Composed<HKTs extends readonly HKT[], T> = HKTs extends [
  ...infer Rest extends HKT[],
  infer Last extends HKT
]
  ? Kind<Last, Composed<Rest, T>>
  : T;

export type { HKT, Kind, Composed };
