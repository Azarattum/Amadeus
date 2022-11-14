import { capitalize, plural, unprefix } from "@amadeus/util/string";
import { ok, wrn, err } from "../status/log";
import { readdir } from "fs/promises";
import type { Plugin } from "./types";
import { pipeline } from "libfun";
import { existsSync } from "fs";
import { resolve } from "path";

const format = pipeline(unprefix, capitalize);
const plugins: Set<Plugin> = new Set();

async function load() {
  // Resolve from the file when compiled
  let from = __filename.endsWith(".cjs")
    ? resolve(__dirname, "./plugins")
    : "./plugins";

  // Load the monorepo plugins in a development environment
  if (import.meta.env.DEV && existsSync("../../package.json")) {
    from = resolve("../..", from);
  }

  const files = await readdir(from);
  const results = await Promise.allSettled(
    files.map((x) =>
      import(resolve(from, x)).catch((e) => {
        wrn(`Failed to load plugin "${x}" from ${from}!`);
        err.bind({ group: x })(e);
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

export { load, format, plugins };
export type { Plugin };
