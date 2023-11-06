import { type Nothing, type Monad, nothing, monad } from "..";
import type { Flatten } from "../utils/types";

interface Spread extends Monad<"Spread"> {
  then: Exclude<Flatten<this[""]>, Nothing>;
  accept: { [Symbol.iterator]: () => any };
  unwrap: this[""][];
}

const error = Symbol();
const spread = monad<Spread>((value, fn) => {
  if (value instanceof Error) {
    if (!Array.isArray(value.cause)) return fn(value) as unknown[];
    return value.cause
      .map((x) => {
        if (typeof x !== "object" || x === null || !(error in x)) return x;
        else return fn(x[error]);
      })
      .filter((x) => x !== nothing);
  }
  if (typeof value?.[Symbol.iterator] !== "function") {
    throw new Error(`${value} is not iterable!`, { cause: value });
  }

  let ok = true;
  const result = Array.from(value)
    .flat(Infinity)
    .map((x) => {
      try {
        return fn(x);
      } catch (err) {
        ok = false;
        return { [error]: err };
      }
    })
    .filter((x) => x !== nothing);

  if (!ok) throw new Error("Mapped result contains errors!", { cause: result });
  return result;
});

export { type Spread, spread };
