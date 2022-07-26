import { create } from "@amadeus/util/superstruct";
import { object, Struct } from "superstruct";
import { existsSync } from "fs";

async function resolve(file: string) {
  const paths = [`../config/${file}`, `./config/${file}`, `./${file}`];
  const path = paths.find((x) => existsSync(x));
  if (!path) throw new Error(`Configuration "${file}" not found!`);
  return path;
}

async function configure() {
  const load = async <T, S>(file: string, struct: Struct<T, S>) =>
    resolve(file)
      .then((x) => import(x))
      .then((x) => x.default)
      .then((x) => create(x, struct, `Invalid "${file}" configuration!`));

  return {
    settings: await load("settings.json", Settings),
    users: await load("users.json", Users),
  };
}

/// TODO: add users schema
const Users = object({});
/// TODO: add settings schema
const Settings = object({});

type Config = Awaited<ReturnType<typeof configure>>;

export { configure };
export type { Config };
