import {
  array,
  defaulted,
  intersection,
  type,
  create,
  type Infer,
} from "superstruct";
import { readFile, writeFile } from "fs/promises";
import type { Plugin } from "../plugin";
import { fallback, pipe } from "libfun";

const Config = type({
  users: defaulted(array(), []),
});
type BaseConfig = Infer<typeof Config>;

async function configure(plugins: Set<Plugin>) {
  const Plugins = [...plugins].map((x) => type(x.config || {}));
  const Settings = intersection([Config, ...Plugins]);
  const file = "./config.json";

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
