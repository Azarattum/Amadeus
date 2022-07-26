import { object, optional, string, type Infer } from "superstruct";
import { capitalize, unprefix } from "@amadeus/util/string";
import { bright, reset } from "@amadeus/util/color";
import { assert } from "@amadeus/util/superstruct";
import { ok, info, wrn, err } from "../status/log";
import type { Config } from "../data/config";
import { readdir } from "fs/promises";
import * as log from "../status/log";
import { existsSync } from "fs";
import { resolve } from "path";
import * as sdk from "./sdk";

const plugins: Infer<typeof PluginInfo>[] = [];

function register(plugin: Infer<typeof PluginInfo>) {
  assert(plugin, PluginInfo, "Invalid plugin configuration!");
  plugin.name = capitalize(unprefix(plugin.name));

  info(`Loading ${bright}${plugin.name}${reset} plugin v${plugin.version}...`);

  // Register the plugin
  plugins.push(plugin);

  // Define the context
  const context = {
    module: plugin.name,
  };
  /** Binds methods to the context */
  const bind = <T extends Record<any, Function>>(methods: T) =>
    Object.fromEntries(
      Object.entries(methods).map(([key, fn]) => [key, fn.bind(context)])
    ) as T;

  return { ...bind(sdk), ...bind(log) };
}

async function load(config: Config, from = "./plugins") {
  // Load the monorepo plugins in a development environment
  if (import.meta.env.DEV && existsSync("../../package.json")) {
    from = resolve("../..", from);
  }

  const files = await readdir(from);
  const results = await Promise.allSettled(
    files.map((x) =>
      import(resolve(from, x)).catch((e) => {
        wrn(`Failed to load plugin "${x}" from ${from}!`);
        err.bind({ module: x })(e);
        throw e;
      })
    )
  );

  const successes = results.filter((x) => x.status === "fulfilled").length;
  const failures = results.filter((x) => x.status === "rejected").length;
  /// TODO: init plugins
  if (failures) {
    wrn(`${failures} plugin${failures !== 1 ? "s" : ""} loaded with errors!`);
  }
  if (successes) {
    ok(`${successes} plugin${successes !== 1 ? "s" : ""} successfully loaded!`);
  }
}

const PluginInfo = object({
  name: string(),
  version: string(),
});

type PluginContext = {
  module: string;
} | void;

export { register, load };
export type { PluginContext };
