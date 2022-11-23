import { plural, capitalize, unprefix } from "@amadeus-music/util/string";
import { ok, wrn, err } from "../status/log";
import { readdir } from "node:fs/promises";
import { parse, resolve } from "node:path";
import type { Plugin } from "./types";
import { pipeline } from "libfun";

const format = pipeline(unprefix, capitalize);
const plugins = new Map<string, Plugin>();

async function load() {
  const path = resolve(__dirname, "./plugins");
  const imports = import.meta.env.DEV
    ? import.meta.glob("../../../plugins/*/index.ts")
    : await readdir(path).then((x) =>
        Object.fromEntries(
          x.map((file) => [file, () => import(resolve(path, file))])
        )
      );

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

export { load, format, plugins };
