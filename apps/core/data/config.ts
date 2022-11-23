import {
  array,
  defaulted,
  intersection,
  type,
  create,
  number,
  type Infer,
} from "superstruct";
import { readFile, writeFile } from "node:fs/promises";
import type { Plugin } from "../plugin/types";
import { fallback, pipe } from "libfun";
import { resolve } from "node:path";

const Config = type({
  users: defaulted(array(), []),
  port: defaulted(number(), 8080),
});
type BaseConfig = Infer<typeof Config>;

async function configure(plugins: Map<string, Plugin>) {
  const Plugins = [...plugins.values()].map((x) => type(x.config || {}));
  const Settings = intersection([Config, ...Plugins]);
  const file = import.meta.env.DEV
    ? "./config.json"
    : resolve(__dirname, "./config.json");

  return pipe(file)(
    (x) => readFile(x, "utf8"),
    JSON.parse,
    fallback({}),
    (x) => create(x, Settings, "Invalid configuration!"),
    (x) => writeFile(file, JSON.stringify(x, null, 2)).then(() => x)
  );
}

export { configure };
export type { BaseConfig };
