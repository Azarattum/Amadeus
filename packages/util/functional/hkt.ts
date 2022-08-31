interface HKT {
  readonly _?: unknown;
  readonly type: this["_"];
}

type Kind<F extends HKT, A> = (F & { readonly _: A })["type"];

export type { HKT, Kind };
