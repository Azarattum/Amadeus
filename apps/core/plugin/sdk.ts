import {
  PluginInfo,
  type ConfigStruct,
  type Configure,
  type Plugin,
} from "./types";
import { bright, reset } from "@amadeus/util/color";
import { assert } from "@amadeus/util/superstruct";
import { command, usage } from "../status/cli";
import { init, stop, pool } from "../event";
import * as log from "../status/log";
import { info } from "../status/log";
import { format, plugins } from ".";

const bound = { pool, init, stop, command, usage, ...log };

function register<T extends ConfigStruct = undefined>(plugin: Plugin<T>) {
  assert(plugin, PluginInfo, "Tried to register an invalid plugin!");
  plugin.name = format(plugin.name);
  plugins.add(plugin);

  info(`Loading ${bright}${plugin.name}${reset} plugin v${plugin.version}...`);

  const context = { group: plugin.name.toLowerCase() };
  return Object.fromEntries(
    Object.entries(bound).map(([key, fn]) => [key, (fn as any).bind(context)])
  ) as Configure<typeof bound, T>;
}

/// TODO: `fetch` generator
//    - global iterator context based abort signal
//    - error prone (log errors per module)
//    - auto superstruct validation
//    - maybe use gretchen
//    - auto json parse (mb when validated?)
//      - this should be type specific (e.g. do not json parse streams)
//
// Consider the API:
//  yield* fetch(User, "...");
// vs
//  yield* fetch("...").json(); ← gretchen under the hood
//  yield* fetch("...").as(User);

export { register };
export { async, take, first, map } from "libfun";
