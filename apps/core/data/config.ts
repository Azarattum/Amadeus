import {
  defaulted,
  intersection,
  type,
  create,
  number,
  type Infer,
  string,
  record,
  any,
} from "superstruct";
import { bright, reset } from "@amadeus-music/util/color";
import { readFile, writeFile } from "node:fs/promises";
import { merge } from "@amadeus-music/util/object";
import type { Plugin } from "../plugin/types";
import { plugins } from "../plugin/loader";
import { fallback, pipe } from "libfun";
import { resolve } from "node:path";

const Config = type({
  users: defaulted(record(string(), type({})), {}),
  port: defaulted(number(), 8080),
});
type BaseConfig = Infer<typeof Config>;

async function configure(plugins: Map<string, Plugin>, overrides = {}) {
  const Plugins = [...plugins.values()].map((x) => type(x.config || {}));
  const Settings = intersection([Config, ...Plugins]);
  const file = import.meta.env.DEV
    ? "./config.json"
    : resolve(__dirname, "./config.json");

  return pipe(file)(
    (x) => readFile(x, "utf8"),
    JSON.parse,
    fallback({}),
    (x) => merge(x, overrides),
    (x) => create(x, Settings, "Invalid configuration!"),
    (x) => writeFile(file, JSON.stringify(x, null, 2)).then(() => x)
  );
}

async function register(username: string) {
  const coercers = [...plugins.values()].map((x) => ({
    config: x.config?.users || any(),
    plugin: x.name,
  }));
  coercers.push({ config: Config.schema.users, plugin: "Core" });

  let users = { [username]: {} };
  coercers.forEach(({ config, plugin }) => {
    users = config.create(
      users,
      `Sorry, ${bright}${plugin}${reset} ` +
        "doesn't support user registration! " +
        "Please ask the developer to add default " +
        "values for users configuration."
    );
  });

  return configure(plugins, { users });
}

export { configure, register };
export type { BaseConfig };
