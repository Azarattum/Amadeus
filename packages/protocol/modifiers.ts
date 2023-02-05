import { assign, number, object, Struct } from "superstruct";

type Unique<T> = T & { id: number };
const unique = <T extends Struct<any>>(t: T) =>
  assign(t as any, object({ id: number() })) as any as Struct<
    T["TYPE"] & { id: number },
    T["schema"] & { id: Struct<number, null> }
  >;

export type { Unique };
export { unique };
