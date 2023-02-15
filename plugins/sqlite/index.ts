import { existsSync, mkdirSync, readdirSync } from "fs";
import { close, connect } from "@amadeus-music/crdata";
import { database, stop, users } from "./plugin";
import { async } from "@amadeus-music/core";

database(function* (user = "shared") {
  if (!existsSync("users")) mkdirSync("users");
  yield connect(`users/${user}.db`, user === "shared").playlists;
});

stop(function* () {
  yield* async(close());
});

users(() => {
  if (!existsSync("users")) return 0;
  return readdirSync("users").length;
});
