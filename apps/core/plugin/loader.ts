import { plural, capitalize, unprefix } from "@amadeus-music/util/string";
import { delay } from "@amadeus-music/util/async";
import { init, pools, stop } from "../event/pool";
import { commands } from "../status/commands";
import { ok, wrn, err } from "../status/log";
import { readdir } from "node:fs/promises";
import { parse, resolve } from "node:path";
import type { Plugin } from "./types";
import { pipeline } from "libfun";

const format = pipeline(unprefix, capitalize);
const plugins = new Map<string, Plugin>();

async function load() {
  init.catch((error) => {
    if (error.handler) unload(error.handler);
    wrn.bind({ group: error.handler })(
      "Plugin disabled! " +
        ((error.cause as any)?.message || error.cause || error.message)
    );
  });

  const path = resolve(__dirname, "./plugins");
  const imports = import.meta.env.DEV
    ? import.meta.glob("../../../plugins/*/index.ts")
    : await readdir(path).then((x) =>
        Object.fromEntries(
          x
            .filter((x) => x.endsWith(".cjs"))
            .map((file) => [
              file,
              () => import("file://" + resolve(path, file)),
            ])
        )
      );

  // Wait a bit to make sure everything is initialized
  await delay(500);
  const results = await Promise.allSettled(
    Object.entries(imports).map(([file, load]) =>
      load().catch((e) => {
        const name = format(parse(file).name);
        wrn(`Failed to load plugin "${name}"!`);
        err.bind({ group: name })(e);
        throw e;
      })
    )
  );

  const successes = results.filter((x) => x.status === "fulfilled").length;
  const failures = results.filter((x) => x.status === "rejected").length;
  if (failures) {
    wrn(`${failures} ${plural("plugin", failures)} loaded with errors!`);
  }
  if (successes) {
    ok(`${successes} ${plural("plugin", successes)} successfully loaded!`);
  }

  return plugins;
}

async function unload(plugin: string) {
  for (const command of commands.keys()) {
    try {
      const status = pools.status(`command/${command}`);
      if (status.group === plugin) commands.delete(command);
      if ([...status.listeners.values()].every((x) => x.group === plugin)) {
        commands.delete(command);
      }
    } catch {}
  }

  pools.drain("*", { group: plugin });
  await stop.where(plugin)();
  pools.close("*", { group: plugin });
  plugins.delete(plugin);
}

export { load, unload, format, plugins };
