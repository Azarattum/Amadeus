import { divide, info, ok, SilentError } from "./log";
import { name, version } from "../package.json";

let stared: null | number = null;

async function start() {
  if (stared) throw new SilentError();
  info(`Starting ${name} v${version}...`);
  stared = Date.now();
}

async function complete() {
  if (!stared) throw new Error("The application did not start!");
  ok(`Successfully initialized in ${(Date.now() - stared) / 1000}s!`);
  divide();
}

export { start, complete };
