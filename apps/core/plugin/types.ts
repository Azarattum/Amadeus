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
import type { BaseConfig } from "../data/config";
import type { Pool } from "libfun";

const PluginInfo = object({
  name: string(),
  version: string(),
  config: optional(record(string(), instance(Struct<any>))),
  context: optional(record(string(), any())),
});

type ConfigStruct = Record<string, Struct<any>> | undefined;
type InferMap<T extends Record<string, Struct<any>>> = {
  [K in keyof T]: Infer<T[K]>;
};

type Plugin<
  T extends ConfigStruct = ConfigStruct,
  C extends Record<string, any> = Record<string, any>
> = Infer<typeof PluginInfo> & {
  config?: T;
  context?: C;
};

type PluginConfig<T extends ConfigStruct> = BaseConfig &
  (T extends object ? InferMap<T> : Record<string, never>);

type Configure<
  T extends Record<string, any>,
  U extends ConfigStruct,
  C extends Record<string, any>
> = {
  [K in keyof T]: K extends "init"
    ? Pool<(config: PluginConfig<U>) => void, C>
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

export { PluginInfo };
export type { Plugin, PluginConfig, ConfigStruct, Configure };
