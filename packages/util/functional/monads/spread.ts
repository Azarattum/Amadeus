import { monad, type Monad } from "../monad";
import type { Flatten } from "../types";

interface Spread extends Monad<"Spread"> {
  accept: { [Symbol.iterator]: () => any };
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

export { spread, SpreadError, type Spread };
