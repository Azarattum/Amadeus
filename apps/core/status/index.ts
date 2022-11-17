import { divide, info, ok, SilentError } from "./log";
import { name, version } from "../package.json";
import { stop as close, pools } from "../event";
import { plugins } from "../plugin";
import { take } from "libfun";

let started: null | number = null;

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
  if (!started) throw new Error("The application did not start!");
  ok(`Successfully initialized in ${(Date.now() - started) / 1000}s!`);
  divide();
}

async function stop() {
  if (!started) return;
  started = null;

  divide();
  info("Stopping all the plugins...");
  pools.drain();
  await take(close());
  info("Cleaning up all the event handlers...");
  pools.close();
  info("Unloading plugins...");
  plugins.clear();
  ok("Successfully stopped!");
}

export { start, complete, stop };
