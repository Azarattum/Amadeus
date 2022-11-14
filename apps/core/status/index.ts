import { divide, info, ok, SilentError } from "./log";
import { name, version } from "../package.json";
import { stop as close, pools } from "../event";
import { plugins } from "../plugin";
import { take } from "libfun";

let started: null | number = null;

async function start() {
  if (started) throw new SilentError();
  info(`Starting ${name} v${version}...`);
  started = Date.now();
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
