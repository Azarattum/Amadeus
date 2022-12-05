import {
  black,
  bright,
  clean,
  magenta,
  reset,
} from "@amadeus-music/util/color";
import { command, err, info, init, stop, wrn } from "./plugin";
import { pretty } from "@amadeus-music/util/object";
import { AceBaseServer } from "acebase-server";
import { async } from "@amadeus-music/core";
import { DebugLogger } from "acebase-core";
import { mkdir } from "node:fs/promises";
import { resolve } from "node:path";

init(function* () {
  throw "In development!";
  const path = (import.meta as any).env.DEV
    ? "../../data"
    : resolve(__dirname, "../data");
  yield* async(mkdir(path, { recursive: true }));

  info(
    `Using ${magenta}AceBase${reset} ` +
      `${bright + black}(realtime database)${reset}. ` +
      "Please consider sponsoring the project."
  );

  const logger = {
    error: (...args) => err(...args.map(clean)),
    warn: (...args) => wrn(...args.map(clean)),
    setLevel: () => {},
    verbose: () => {},
    write: () => {},
    log: () => {},
  };
  Object.assign(DebugLogger.prototype, logger);

  const server = new AceBaseServer("cache", {
    path,
    /// SECURITY: NO AUTH! FOR TESTING!
    authentication: { enabled: false },
  });

  yield* async(server.ready());
  init.context({ server, db: server.db });
});

stop(function* () {
  const closed = Promise.resolve(this.server?.once("shutdown"));
  this.server?.shutdown();
  yield* async(closed);
});

command("db")(function* (action) {
  if (!action) {
    const root = yield* async(this.db.root.get({ exclude: ["__auth__"] }));
    return info("Database:", pretty(root.val()));
  }

  const [path, value] = action.split("=").map((x) => x.trim());
  const node = this.db.ref(path);

  if (value) yield* async(node.set(value));
  const data = yield* async(node.get().then((x) => x.val()));
  info("Current value:", data);
});
