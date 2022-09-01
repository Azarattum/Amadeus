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
  type: this["_"] extends (infer T)[]
    ? T
    : this["_"] extends Generator<infer T>
    ? T
    : this["_"];
}

const spread = monad<Spread>((value, fn) => {
  const nothing = Symbol();
  const filter = (x: any) => x !== nothing;
  const map = (x: any) => {
    try {
      return fn(x);
    } catch {
      return nothing;
    }
  };

  if (Array.isArray(value)) return value.map(map).filter(filter);
  if (typeof value?.[Symbol.iterator] === "function") {
    return Array.from(value, map).filter(filter);
  }

  return fn(value);
});

export { maybe, spread };
