import {
  any,
  instance,
  object,
  optional,
  record,
  string,
  Struct,
  type Infer,
} from "superstruct";
import type { PoolMaker } from "libfun/pool/pool.types";
import type { User } from "../data/persistence";
import type { Config } from "../data/config";
import type { Pool } from "libfun";

const PluginInfo = object({
  name: string(),
  version: string(),
  config: optional(record(string(), instance(Struct<any>))),
  context: optional(record(string(), any())),
  settings: optional(record(string(), instance(Struct<any, null>))),
});

type RecordStruct = Record<string, Struct<any>> | undefined;
type InferMap<T> = T extends Record<string, Struct<any>>
  ? {
      [K in keyof T]: Infer<T[K]>;
    }
  : Record<string, never>;

type Plugin<
  T extends RecordStruct = RecordStruct,
  S extends RecordStruct = RecordStruct,
  C extends Record<string, any> = Record<string, any>
> = Infer<typeof PluginInfo> & {
  config?: T;
  context?: C;
  settings?: S;
};

type Configure<
  T extends Record<string, any>,
  U extends RecordStruct,
  S extends RecordStruct,
  C extends Record<string, any>
> = {
  [K in keyof T]: K extends "init"
    ? Pool<(config: Config & InferMap<U>) => void, C>
    : K extends "users"
    ? (_?: () => Generator<User>) => Promise<Record<string, User & InferMap<S>>>
    : K extends "stop"
    ? Pool<() => void, Partial<C>>
    : T[K] extends Pool<infer U, infer R>
    ? Pool<U, R & C>
    : T[K] extends PoolMaker<infer R>
    ? PoolMaker<R & C>
    : T[K] extends (this: infer H, ..._: infer A) => Pool<infer U, infer R>
    ? (this: H, ..._: A) => Pool<U, R & C>
    : T[K];
};

type Context = void | { group?: string };

export { PluginInfo };
export type { Plugin, RecordStruct, Configure, Context };
