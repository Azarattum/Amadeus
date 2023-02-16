import { existsSync, mkdirSync, readdirSync } from "fs";
import { close, connect } from "@amadeus-music/crdata";
import { database, stop, users } from "./plugin";
import { async } from "@amadeus-music/core";

database(function* (user = "shared") {
  if (!existsSync("users")) mkdirSync("users");
  const db = connect(`users/${user}.db`, user === "shared");
  yield {
    ...db.playlists,
    ...db.settings,
    async extract(key, collection = "settings") {
      return (await db.connection)
        .selectFrom(collection as any)
        .select("value")
        .where("key", "=", key)
        .executeTakeFirstOrThrow()
        .then((x) => JSON.parse(x.value));
    },
    async lookup(value, collection = "settings") {
      return (await db.connection)
        .selectFrom(collection as any)
        .select("key")
        .where("value", "=", JSON.stringify(value))
        .executeTakeFirstOrThrow()
        .then((x) => x.key);
    },
  };
});

stop(function* () {
  yield* async(close());
});

users(function* () {
  if (!existsSync("users")) return yield {};
  const all = readdirSync("users")
    .filter((x) => !x.includes("shared") && x.endsWith(".db"))
    .map(async (filename) => {
      const { connection } = connect(`users/${filename}`);
      const db = await connection;
      const entries = await db.selectFrom("settings").selectAll().execute();
      const data = entries.map(({ key, value }) => [key, JSON.parse(value)]);
      return [filename.replace(".db", ""), Object.fromEntries(data)] as const;
    });
  yield yield* async(Promise.all(all).then(Object.fromEntries));
});
