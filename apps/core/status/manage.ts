import { stop as close, pools, init } from "../event/pool";
import { SilentError, divide, info, err, ok } from "./log";
import { configure, setup } from "../data/config";
import { plugins, load } from "../plugin/loader";
import { version, name } from "../package.json";
import { fallback, pipe } from "libfun";
import { commands } from "./commands";
import { interactive } from "./cli";

let started: number | null = null;

// Environment variables to fix running `ws` in prod
process.env.WS_NO_BUFFER_UTIL = "true";
process.env.WS_NO_UTF_8_VALIDATE = "true";

const launch = () =>
  pipe(pools.catch(err))(
    start,
    load,
    configure,
    init,
    () => setup(),
    complete,
    interactive,
    fallback(err),
  );

async function start() {
  if (started) throw new SilentError();
  if (import.meta.hot) await import.meta.hot.data.stopping;
  if (started) throw new SilentError();

  started = Date.now();
  info(`Starting ${name} v${version}...`);
  if (import.meta.hot) {
    let reload = () => (info("Performing an HMR reload..."), stop());
    import.meta.hot.on("vite:beforeFullReload", () => {
      const stopping = reload();
      reload = () => Promise.resolve();
      if (import.meta.hot) import.meta.hot.data.stopping = stopping;
    });
  }
}

async function complete() {
  if (!started) throw new Error("The application did not start properly!");
  ok(`Successfully initialized in ${(Date.now() - started) / 1000}s!`);
  divide();
}

async function stop(restart = false) {
  if (!started) return;
  started = null;

  divide();
  info("Stopping all the plugins...");
  pools.drain();
  await close();
  info("Cleaning up all the event handlers...");
  process.removeAllListeners();
  if (!restart) {
    commands.clear();
    pools.close();
    info("Unloading plugins...");
    plugins.clear();
  }
  ok("Successfully stopped!");
  divide();
}

export { complete, launch, start, stop };
