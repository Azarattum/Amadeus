import { close, connect, json, groupJSON } from "@amadeus-music/crdata";
import { async, identify, path } from "@amadeus-music/core";
import { existsSync, mkdirSync, readdirSync } from "fs";
import { database, stop, users } from "./plugin";

database(function* (user = "shared") {
  if (!existsSync(path("users"))) mkdirSync(path("users"));
  const db = connect({
    name: path(`users/${user}.db`),
    local: user === "shared",
    paths,
  });
  yield {
    ...db.playlists,
    ...db.settings,
    ...db.history,
    then: undefined,
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
    async artist(id) {
      return (await db.connection)
        .selectFrom("artists")
        .where("artists.id", "=", id)
        .selectAll()
        .executeTakeFirstOrThrow();
    },
    async history() {
      return (await db.connection)
        .selectFrom("history")
        .selectAll()
        .orderBy("date", "desc")
        .execute();
    },
    async playlist(title) {
      return (await db.connection)
        .selectFrom("playlists")
        .where("id", "=", identify(title))
        .selectAll()
        .executeTakeFirstOrThrow();
    },
  };
});

stop(function* () {
  yield* async(close());
});

users(function* () {
  if (!existsSync(path("users"))) return yield {};
  const all = readdirSync(path("users"))
    .filter((x) => !x.includes("shared") && x.endsWith(".db"))
    .map(async (filename) => {
      const { connection } = connect({
        name: path(`users/${filename}`),
        paths,
      });
      const db = await connection;
      const entries = await db.selectFrom("settings").selectAll().execute();
      const data = entries.map(({ key, value }) => [key, JSON.parse(value)]);
      return [filename.replace(".db", ""), Object.fromEntries(data)] as const;
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
