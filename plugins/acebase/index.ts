import { command, info, init, stop } from "./plugin";
import { AceBaseServer } from "acebase-server";
import { async } from "@amadeus-music/core";

init(function* (config) {
  throw "AceBase is still in development!";
  /// Sponsor rewrite, custom http server, custom route prefix, custom logger
  const server = new AceBaseServer("test", { logLevel: "error" });
  yield* async(server.ready());
  const db = server.db;
  /// Putting a TEST value here
  db.ref("test").set("mister");

  init.context({ server, db });
});

stop(function* () {
  this.server?.shutdown();
});

command("db")(function* (path) {
  if (!path) return;
  const snap = yield* async(this.db.ref(path).get());
  info("Got value:", snap.val());
  snap.forEach((x) => {
    info("Got value:", x.val());
    return true;
  });
});
