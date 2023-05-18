import { assign, integer, object, type Struct } from "superstruct";

type Simplify<T> = T extends any[] | Date
  ? T
  : { [K in keyof T]: T[K] } & NonNullable<unknown>;

type Unique<T> = T & { id: number };
const unique = <T extends Struct<any>>(t: T) =>
  assign(t as any, object({ id: integer() })) as any as Struct<
    Simplify<T["TYPE"] & { id: number }>,
    Simplify<T["schema"] & { id: Struct<number, null> }>
  >;

export type { Unique, Simplify };
export { unique };
