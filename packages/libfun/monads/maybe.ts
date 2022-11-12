import { monad, type Monad } from "..";

interface Maybe extends Monad<"Maybe"> {
  then: NonNullable<this[""]>;
}

const maybe = monad<Maybe>((value, fn) => {
  const updated = fn(value);
  if (updated != null) return updated;
  throw new Error("Value is nothing!");
});

export { maybe, type Maybe };
