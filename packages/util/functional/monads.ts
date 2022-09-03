import { monad, type Monad } from "./monad";
import type { Flatten } from "./types";

interface Maybe extends Monad<"Maybe"> {
  then: NonNullable<this[""]>;
}

const maybe = monad<Maybe>((value, fn) => {
  const updated = fn(value);
  if (updated != null) return updated;
  throw new Error("Value is nothing!");
});

interface Spread extends Monad<"Spread"> {
  then: Flatten<this[""]>;
  unwrap: this[""][];
}

class SpreadError extends Error {
  value: any;
  constructor(value: any) {
    super(`${value} is not iterable!`);
    this.value = value;
  }
}

const spread = monad<Spread>((value, fn) => {
  if (value instanceof Error) return fn(value);
  if (typeof value?.[Symbol.iterator] !== "function") {
    throw new SpreadError(value);
  }

  const nothing = Symbol();
  return Array.from(value)
    .flat(Infinity)
    .map((x) => {
      try {
        return fn(x);
      } catch {
        return nothing;
      }
    })
    .filter((x) => x !== nothing);
});

export { maybe, spread, SpreadError };
export type { Maybe, Spread };
