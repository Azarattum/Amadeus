import {
  PluginInfo,
  type ConfigStruct,
  type Configure,
  type Plugin,
} from "./types";
import { bright, reset } from "@amadeus-music/util/color";
import type { FetchOptions } from "../network/fetch";
import { command, usage } from "../status/commands";
import { format, plugins } from "./loader";
import * as fetch from "../network/fetch";
import * as events from "../event/pool";
import * as log from "../status/log";
import { info } from "../status/log";
import { assert } from "superstruct";

const bound = { command, ...log, ...events, ...fetch };

function register<
  T extends ConfigStruct = undefined,
  C extends Record<string, any> = Record<string, never>
>(plugin: Plugin<T, C>) {
  assert(plugin, PluginInfo, "Tried to register an invalid plugin!");
  plugin.name = format(plugin.name);

  const id = plugin.name.toLowerCase();
  if (plugins.has(id)) {
    throw new Error(`Plugin "${id}" has already been registered!`);
  }

  info(`Loading ${bright}${plugin.name}${reset} plugin v${plugin.version}...`);
  plugins.set(id, plugin);

  const context = {
    group: id,
    scope: id,
    context: { fetch: {}, ...(plugin.context || {}) },
  };
  return Object.fromEntries(
    Object.entries(bound)
      .filter((entry) => "bind" in entry[1])
      .map(([key, fn]) => [key, (fn as any).bind(context)])
  ) as Configure<typeof bound, T, C & { fetch: FetchOptions }>;
}

export { register, usage };
export * from "../data/aggregate";
export { http } from "../network/http";
export { identify } from "../data/identity";
export { inferTrack, inferArtists } from "../data/infer";

export * from "superstruct";
export { map as dict } from "superstruct";
export * from "libfun";
export { map } from "libfun";
