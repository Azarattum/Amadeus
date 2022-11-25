import { complete, start } from "./status/manage";
import { fallback, pipe, take } from "libfun";
import { interactive } from "./status/cli";
import { configure } from "./data/config";
import { load } from "./plugin/loader";
import { init } from "./event/pool";
import { err } from "./status/log";

pipe(start())(
  load,
  configure,
  init,
  take,
  complete,
  interactive,
  fallback(err)
);

export * from "./plugin/sdk";
