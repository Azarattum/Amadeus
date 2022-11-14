import { fallback, pipe, take } from "libfun";
import { interactive } from "./status/cli";
import { complete, start } from "./status";
import { configure } from "./data/config";
import { err } from "./status/log";
import { load } from "./plugin";
import { init } from "./event";

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
