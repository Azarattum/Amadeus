import {
  black,
  bright,
  clear,
  green,
  highlight,
  paint,
  red,
  reset,
  yellow,
  type Color,
} from "@amadeus/util/color";
import { offset, rescape } from "@amadeus/util/string";
import { StructError } from "superstruct";
import { log as logged } from "../event";
import { stdout } from "node:process";
import { PoolError } from "libfun";
import { inspect } from "util";

function time() {
  return new Date().toTimeString().slice(0, 8);
}

type Context = { group?: string } | void;

function log(this: Context, { level, separator, color, data, pure }: LogInfo) {
  separator ??= "|";
  level ??= "info";
  color ??= reset;

  const group = this?.group?.toUpperCase() || "CORE";
  const log = console[level];

  stdout.write(clear);

  if (pure) {
    log(...data);
    return logged(data.join(" "));
  }

  log(
    bright + black + time() + reset,
    color + separator + reset,
    `[${bright}${group}${reset}]:`,
    ...data.map((x) => {
      if (typeof x !== "string") x = inspect(x);
      return paint(x, color || reset);
    })
  );
  logged(
    [
      time(),
      separator,
      `[${group}]:`,
      ...data.map((x) => (typeof x !== "string" ? inspect(x) : x)),
    ].join(" ")
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

  let context: Context = undefined;
  // Format errors properly
  data = data.map((e) => {
    if (e instanceof StructError) {
      const root = JSON.stringify(e.branch[0], null, 2);
      const target = JSON.stringify(e.branch[e.branch.length - 1], null, 2);
      const pattern = new RegExp(
        rescape(target || "").replace(/(\s|\n)+/g, "(\\s|\\n)*") || "$^"
      );
      const important = [e.path.join("."), e.value + "", e.type].map(
        (x) => new RegExp("\\b" + rescape(x) + "\\b", "g")
      );

      const received = offset(highlight(root, pattern, bright, red));
      const stack = highlight(e.stack || "", important, bright, red);

      return stack + "\nReceived:\n" + received;
    }
    if (e instanceof PoolError) context = { group: e.handler || e.caller };
    if (e instanceof Error) return e.stack || "";
    return e;
  });

  if (context === undefined) context = this;
  log.bind(context)({ level: "error", color: red, separator: "!", data });
}

/** Prints a visual log divider  */
function divide(title = "") {
  const divider = "=".repeat(30 - title.length / 2);
  const data = [divider + title + divider + (title.length % 2 ? "=" : "")];
  log({ data, pure: true });
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
