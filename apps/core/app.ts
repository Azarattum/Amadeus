import { complete, start } from "./status/manage";
import { fallback, pipe, take } from "libfun";
import { interactive } from "./status/cli";
import { init, pools } from "./event/pool";
import { configure } from "./data/config";
import { load } from "./plugin/loader";
import { err } from "./status/log";

pools.catch(err);
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
