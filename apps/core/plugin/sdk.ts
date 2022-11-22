import {
  PluginInfo,
  type ConfigStruct,
  type Configure,
  type Plugin,
} from "./types";
import { fetch, fetcher, type FetchOptions } from "./fetch";
import { bright, reset } from "@amadeus-music/util/color";
import { command, usage } from "../status/commands";
import { init, stop, pool } from "../event";
import * as log from "../status/log";
import { info } from "../status/log";
import { assert } from "superstruct";
import { format, plugins } from ".";

const bound = { pool, init, stop, command, usage, ...log };

function register<T extends ConfigStruct = undefined>(plugin: Plugin<T>) {
  assert(plugin, PluginInfo, "Tried to register an invalid plugin!");
  plugin.name = format(plugin.name);
  plugins.add(plugin);

  info(`Loading ${bright}${plugin.name}${reset} plugin v${plugin.version}...`);

  const name = plugin.name.toLowerCase();
  const context = { group: name, scope: name };
  return Object.fromEntries(
    Object.entries(bound).map(([key, fn]) => [key, (fn as any).bind(context)])
  ) as Configure<typeof bound, T>;
}

export { register, fetch, fetcher };
export { async, take, first, map } from "libfun";
export type { FetchOptions };
