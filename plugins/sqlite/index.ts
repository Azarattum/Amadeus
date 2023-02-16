import { close, connect, json, groupJSON } from "@amadeus-music/crdata";
import { existsSync, mkdirSync, readdirSync } from "fs";
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
    async track(id) {
      return (await db.connection)
        .selectFrom("tracks")
        .innerJoin("albums", "albums.id", "tracks.album")
        .innerJoin("catalogue", "catalogue.album", "albums.id")
        .innerJoin("artists", "artists.id", "catalogue.artist")
        .where("tracks.id", "=", id)
        .select([
          "tracks.id as id",
          "tracks.title as title",
          "tracks.length as length",
          "tracks.source as source",
        ])
        .select((qb) =>
          json(qb, {
            id: "albums.id",
            title: "albums.title",
            year: "albums.year",
            source: "albums.source",
            art: "albums.art",
          }).as("album")
        )
        .select((qb) =>
          groupJSON(qb, {
            id: "artists.id",
            title: "artists.title",
            source: "artists.source",
            art: "artists.art",
          }).as("artists")
        )
        .groupBy("tracks.id")
        .executeTakeFirstOrThrow();
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
