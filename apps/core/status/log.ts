import {
  black,
  bright,
  clean,
  clear,
  green,
  paint,
  red,
  reset,
  yellow,
  type Color,
} from "@amadeus-music/util/color";
import { type WriteStream, createWriteStream } from "node:fs";
import { access, mkdir } from "node:fs/promises";
import type { Context } from "../plugin/types";
import { log as logged } from "../event/pool";
import { stderr, stdout } from "node:process";
import { format } from "../data/error";
import { path } from "../data/path";
import { resolve } from "node:path";
import { pipeline } from "libfun";
import { inspect } from "util";

function time() {
  return new Date().toTimeString().slice(0, 8);
}

function log(this: Context, { level, separator, color, data, pure }: LogInfo) {
  separator ??= "|";
  level ??= "info";
  color ??= reset;

  const group = this?.group?.toUpperCase() || "CORE";
  const save = pipeline(clean, (x) => (logged(x), x), store);
  const log = console[level];

  if (level === "info") stdout.write(clear);
  else stderr.write(clear);

  if (pure) {
    log(...data);
    return save(data.join(" "));
  }

  log(
    bright + black + time() + reset,
    color + separator + reset,
    `[${bright}${group}${reset}]:`,
    ...data.map((x) => {
      if (typeof x !== "string") x = inspect(x);
      return paint(x.replaceAll(reset, reset + color), color || reset);
    }),
  );
  save(
    [
      time(),
      separator,
      `[${group}]:`,
      ...data.map((x) => (typeof x !== "string" ? inspect(x) : x)),
    ].join(" "),
  );
}

/** Logs a successful message */
function ok(this: Context, ...data: any[]) {
  log.bind(this)({ color: green, separator: "+", data });
}

/** Logs a informational message */
function info(this: Context, ...data: any[]) {
  log.bind(this)({ separator: "|", data });
}

/** Logs a warning message */
function wrn(this: Context, ...data: any[]) {
  log.bind(this)({ level: "warn", color: yellow, separator: "?", data });
}

/** Logs an error message */
function err(this: Context, ...data: any[]) {
  // Filter silent errors
  data = data.filter((x) => !(x instanceof SilentError));
  if (!data.length) return;

  // Add stack trace if there isn't one
  if (!data.find((x) => x instanceof Error)) {
    data.push(new Error().stack?.replace(/^.*$/m, "") || "");
  }

  // Format errors
  const context: Context = { ...(this || {}) };
  data = data.map((x) => format(x, context));

  log.bind(context)({ level: "error", color: red, separator: "!", data });
}

/** Prints a visual log divider  */
function divide(title = "") {
  const divider = "=".repeat(30 - title.length / 2);
  const data = [divider + title + divider + (title.length % 2 ? "=" : "")];
  log({ data, pure: true });
}

let logFile: string | undefined;
let stream: WriteStream | undefined;

/** Stores log line on the disk */
async function store(line: string) {
  const folder = path("logs");
  const file = new Date().toISOString().slice(0, 10) + ".txt";
  await access(folder).catch(() => mkdir(folder).catch(() => {}));
  if (!stream || file !== logFile) {
    stream?.end();
    stream = createWriteStream(resolve(folder, file), { flags: "a" });
    logFile = file;
  }

  stream.write(line + "\n");
}

type LogInfo = {
  level?: "info" | "warn" | "error";
  separator?: string;
  pure?: boolean;
  color?: Color;
  data: any[];
};

class SilentError extends Error {
  constructor() {
    super();
  }
}

export { ok, info, wrn, err, divide, SilentError };
