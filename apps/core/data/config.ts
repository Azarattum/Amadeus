import {
  defaulted,
  intersection,
  type,
  create,
  number,
  type Infer,
} from "superstruct";
import { readFile, writeFile } from "node:fs/promises";
import { merge } from "@amadeus-music/util/object";
import { persistence, users } from "./persistence";
import type { Plugin } from "../plugin/types";
import { plugins } from "../plugin/loader";
import { fallback, pipe } from "libfun";
import { resolve } from "node:path";

type Config = Infer<typeof base>;
const base = type({
  port: defaulted(number(), 8080),
});

async function configure(plugins: Map<string, Plugin>, overrides = {}) {
  const configs = [...plugins.values()].map((x) => type(x.config || {}));
  const config = intersection([base, ...configs]);
  const file = import.meta.env.DEV
    ? "./config.json"
    : resolve(__dirname, "./config.json");

  return pipe(file)(
    (x) => readFile(x, "utf8"),
    JSON.parse,
    fallback({}),
    (x) => merge(x, overrides),
    (x) => create(x, config, "Invalid configuration!"),
    (x) => writeFile(file, JSON.stringify(x, null, 2)).then(() => x)
  );
}

async function setup() {
  const settings = [...plugins.values()].map((x) => type(x.settings || {}));
  const setup = intersection(settings as any);
  const defaults = setup.create({});
  const promises = [];

  for (const [user, settings] of Object.entries(await users())) {
    const storage = persistence(user);
    promises.push(
      Object.entries(defaults)
        .filter(([key]) => key in settings)
        .map(([key, value]) => storage.store(key, JSON.stringify(value)))
    );
  }
  await Promise.all(promises);
}

async function register(username: string) {
  if (username.includes("shared")) throw new Error("Username is not allowed!");
  const settings = [...plugins.values()].map((x) => type(x.settings || {}));
  const setup = intersection(settings as any);
  const defaults: Record<string, any> = setup.create({ name: username });

  const storage = persistence(username.toLowerCase());
  const promises = Object.entries(defaults).map(([key, value]) =>
    storage.store(key, JSON.stringify(value))
  );
  await Promise.all(promises);
  return defaults;
}

export { configure, register, setup };
export type { Config };
