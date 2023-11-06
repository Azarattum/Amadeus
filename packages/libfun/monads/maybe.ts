import { type Nothing, type Monad, nothing, monad } from "..";

interface Maybe extends Monad<"Maybe"> {
  then: Exclude<NonNullable<this[""]>, Nothing>;
}

const maybe = monad<Maybe>((value, fn) => {
  const updated = fn(value);
  if (updated != null && updated !== nothing) return updated;
  throw new Error("Value is nothing!");
});

export { type Maybe, maybe };
