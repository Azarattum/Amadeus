import type { HKT } from "./hkt";
import { monad } from "./monad";

interface Maybe extends HKT {
  type: NonNullable<this["_"]>;
}

const maybe = monad<Maybe>((value, fn) => {
  const updated = fn(value);
  if (updated != null) return updated;
  throw new Error("Value is nothing!");
});

interface Spread extends HKT {
  type: this["_"] extends (infer T)[] ? T : this["_"];
}

const spread = monad<Spread>((value, fn) => {
  if (Array.isArray(value)) return value.map(fn);
  return fn(value);
});

export { maybe, spread };
