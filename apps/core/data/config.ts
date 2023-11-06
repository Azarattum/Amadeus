import {
  intersection,
  type Infer,
  defaulted,
  create,
  number,
  string,
  array,
  type,
} from "superstruct";
import { persistence, users } from "../event/persistence";
import { writeFile, readFile } from "node:fs/promises";
import { merge } from "@amadeus-music/util/object";
import { plugins, unload } from "../plugin/loader";
import type { Plugin } from "../plugin/types";
import { fallback, pipe } from "libfun";
import { wrn } from "../status/log";
import { path } from "./path";

type Config = Infer<typeof baseConfig>;
const baseConfig = type({
  disabled: defaulted(array(string()), []),
  port: defaulted(number(), 8080),
});
const baseSetting = type({
  name: defaulted(string(), "Unknown"),
});

async function configure(plugins: Map<string, Plugin>, overrides = {}) {
  const configs = [...plugins.values()].map((x) => type(x.config || {}));
  const schema = intersection([baseConfig, ...configs]);
  const file = path("config.json");

  const config = await pipe(file)(
    (x) => readFile(x, "utf8"),
    JSON.parse,
    fallback({}),
    (x) => merge(x, overrides),
    (x) => create(x, schema, "Invalid configuration!"),
    (x) => writeFile(file, JSON.stringify(x, null, 2)).then(() => x),
  );

  const disabled = await Promise.all(
    config.disabled
      .filter((x) => plugins.has(x.toLowerCase()))
      .map((x) => unload(x).then(() => x)),
  );

  if (disabled.length) {
    const names = disabled.join(", ");
    wrn(`${disabled.length} plugins (${names}) were disabled in config!`);
  }

  return config;
}

function settings() {
  const settings = [...plugins.values()].map((x) => type(x.settings || {}));
  return intersection([baseSetting, ...settings]);
}

async function setup(username?: string) {
  const defaults = settings().create({});
  const promises = [];

  for (const [user, settings] of Object.entries(await users())) {
    if (username != null && user !== username) continue;
    const storage = persistence(user);
    promises.push(
      ...Object.entries(defaults)
        .filter(([key]) => !(key in settings))
        .map(([key, value]) => storage.settings.store(key, value)),
    );
  }
  await Promise.all(promises);
}

async function register(username: string) {
  if (username.includes("shared")) throw new Error("Username is not allowed!");
  const user = username.toLowerCase();
  await persistence(user).settings.store("name", username);
  await setup(user);
}

export { configure, register, settings, setup };
export type { Config };
