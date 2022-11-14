import {
  instance,
  object,
  optional,
  record,
  string,
  Struct,
  type Infer,
} from "superstruct";
import type { BaseConfig } from "../data/config";
import type { Pool } from "libfun";

const PluginInfo = object({
  name: string(),
  version: string(),
  config: optional(record(string(), instance(Struct<any>))),
});

type ConfigStruct = Record<string, Struct<any>> | undefined;
type InferMap<T extends Record<string, Struct<any>>> = {
  [K in keyof T]: Infer<T[K]>;
};

type Plugin<T extends ConfigStruct = ConfigStruct> = Infer<
  typeof PluginInfo
> & {
  config?: T;
};

type PluginConfig<T extends ConfigStruct> = BaseConfig &
  (T extends object ? InferMap<T> : Record<string, never>);

type Configure<T extends Record<string, any>, U extends ConfigStruct> = Omit<
  T,
  "init"
> & {
  init: Pool<(config: PluginConfig<U>) => void>;
};

export { PluginInfo };
export type { Plugin, PluginConfig, ConfigStruct, Configure };
