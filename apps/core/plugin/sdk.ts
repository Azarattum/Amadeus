import {
  PluginInfo,
  type ConfigStruct,
  type Configure,
  type Plugin,
} from "./types";
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

  const id = plugin.name.toLowerCase();
  if (plugins.has(id)) {
    throw new Error(
      `Plugin ${bright}${id}${reset} has already been registered!`
    );
  }

  info(`Loading ${bright}${plugin.name}${reset} plugin v${plugin.version}...`);
  plugins.set(id, plugin);

  const context = { group: id, scope: id };
  return Object.fromEntries(
    Object.entries(bound).map(([key, fn]) => [key, (fn as any).bind(context)])
  ) as Configure<typeof bound, T>;
}

export { register };
export { http } from "../network/http";
export { fetch, fetcher, type FetchOptions } from "../network/fetch";

export * from "libfun";
export { map } from "libfun";
export * from "superstruct";
export { map as dict } from "superstruct";
