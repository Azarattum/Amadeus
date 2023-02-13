import { existsSync, mkdirSync, readdirSync } from "fs";
import { database, stop, users } from "./plugin";
import { connect } from "@amadeus-music/crdata";

database(function* (user) {
  if (!existsSync("users")) mkdirSync("users");
  const db = this.connections.get(user) || connect(`users/${user}.db`);
  this.connections.set(user, db);
  yield db;
});

stop(function* () {
  this.connections?.forEach((x) => x.close());
});

users(() => {
  if (!existsSync("users")) return 0;
  return readdirSync("users").length;
});
