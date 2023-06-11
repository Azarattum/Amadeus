import { persistence, stop, users, err } from "./plugin";
import { existsSync, mkdirSync, readdirSync } from "fs";
import { close, connect } from "@amadeus-music/crdata";
import { async, path } from "@amadeus-music/core";

persistence(function* (user = "shared") {
  if (!existsSync(path("users"))) mkdirSync(path("users"));
  yield connect({
    name: path(`users/${user}.db`),
    local: user === "shared",
    error: err,
    paths,
  });
});

stop(function* () {
  yield* async(close());
});

users(function* () {
  if (!existsSync(path("users"))) return yield {};
  const all = readdirSync(path("users"))
    .filter((x) => !x.includes("shared") && x.endsWith(".db"))
    .map(async (filename) => {
      const { settings } = connect({ name: path(`users/${filename}`), paths });
      const data = await settings
        .then((x) => x.map(({ key, value }) => [key, value]))
        .then(Object.fromEntries);

      return [filename.replace(".db", ""), data] as const;
    });
  yield yield* async(Promise.all(all).then(Object.fromEntries));
});

const paths = {
  binding: import.meta.env.DEV
    ? undefined
    : path(`plugins/sqlite/${process.arch}/sqlite.${process.platform}`),
  extension: import.meta.env.DEV
    ? undefined
    : path(`plugins/sqlite/${process.arch}/crsqlite`),
};
