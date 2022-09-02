import { monad, type Monad } from "./monad";

interface Maybe extends Monad<"Maybe"> {
  then: NonNullable<this[""]>;
}

const maybe = monad<Maybe>((value, fn) => {
  const updated = fn(value);
  if (updated != null) return updated;
  throw new Error("Value is nothing!");
});

interface Spread extends Monad<"Spread"> {
  unwrap: this[""][];
  then: this[""] extends Iterable<infer T>
    ? T
    : this[""] extends Generator<infer T>
    ? T
    : this[""];
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

  throw new SpreadError(value);
});

export { maybe, spread, SpreadError };
export type { Maybe, Spread };
