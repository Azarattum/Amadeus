import { existsSync, mkdirSync, readdirSync } from "fs";
import { close, connect } from "@amadeus-music/crdata";
import { database, stop, users } from "./plugin";
import { async } from "@amadeus-music/core";

database(function* (user = "shared") {
  if (!existsSync("users")) mkdirSync("users");
  const db = connect(`users/${user}.db`, user === "shared");
  yield {
    ...db.playlists,
    async store(collection, key, value) {
      return db.update(async (db) => {
        await db.schema
          .createTable(collection)
          .ifNotExists()
          .addColumn("key", "text", (x) => x.primaryKey())
          .addColumn("value", "text")
          .execute();
        await db.schema
          .createIndex(collection + "_value")
          .ifNotExists()
          .on(collection)
          .column("value")
          .execute();
        await db
          .insertInto(collection as any)
          .onConflict((x) => x.doUpdateSet({ value }))
          .values({ key, value })
          .execute();
      });
    },
    async extract(collection, key) {
      return (await db.connection)
        .selectFrom(collection as any)
        .select("value")
        .where("key", "=", key)
        .executeTakeFirstOrThrow()
        .then((x) => x.value);
    },
    async lookup(collection, value) {
      return (await db.connection)
        .selectFrom(collection as any)
        .select("key")
        .where("value", "=", value)
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
