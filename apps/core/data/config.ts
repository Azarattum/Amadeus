import {
  defaulted,
  intersection,
  type,
  create,
  number,
  type Infer,
  string,
} from "superstruct";
import { persistence, users } from "../event/persistence";
import { readFile, writeFile } from "node:fs/promises";
import { merge } from "@amadeus-music/util/object";
import type { Plugin } from "../plugin/types";
import { plugins } from "../plugin/loader";
import { fallback, pipe } from "libfun";
import { path } from "./path";

type Config = Infer<typeof baseConfig>;
const baseConfig = type({
  port: defaulted(number(), 8080),
});
const baseSetting = type({
  name: defaulted(string(), "Unknown"),
});

async function configure(plugins: Map<string, Plugin>, overrides = {}) {
  const configs = [...plugins.values()].map((x) => type(x.config || {}));
  const config = intersection([baseConfig, ...configs]);
  const file = path("config.json");

  return pipe(file)(
    (x) => readFile(x, "utf8"),
    JSON.parse,
    fallback({}),
    (x) => merge(x, overrides),
    (x) => create(x, config, "Invalid configuration!"),
    (x) => writeFile(file, JSON.stringify(x, null, 2)).then(() => x)
  );
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
        .map(([key, value]) => storage.settings.store(key, value))
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

export { configure, register, setup, settings };
export type { Config };
