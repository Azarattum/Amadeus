import {
  black,
  bright,
  green,
  highlight,
  paint,
  red,
  reset,
  yellow,
  type Color,
} from "@amadeus/util/color";
import { offset, rescape } from "@amadeus/util/string";
import type { PluginContext } from "../plugin";
import { StructError } from "superstruct";

function time() {
  return new Date().toTimeString().slice(0, 8);
}

function log(
  this: PluginContext,
  { level, separator, color, data, pure }: LogInfo
) {
  separator ??= "|";
  level ??= "log";
  color ??= reset;

  const module = this?.module?.toUpperCase() || "CORE";
  const logger = console[level];

  if (pure) return logger(...data, reset);
  logger(
    bright + black + time() + reset,
    color + separator + reset,
    `[${bright}${module}${reset}]:${color}`,
    ...data.flatMap((x) => {
      if (typeof x !== "string") return [reset, x, reset];
      return paint(x, color || reset, color);
    }),
    reset
  );
}

/** Logs a successful message */
function ok(this: PluginContext, ...data: any[]) {
  log.bind(this)({ color: green, separator: "+", data });
}

/** Logs a informational message */
function info(this: PluginContext, ...data: any[]) {
  log.bind(this)({ separator: "|", data });
}

/** Logs a warning message */
function wrn(this: PluginContext, ...data: any[]) {
  log.bind(this)({ level: "warn", color: yellow, separator: "?", data });
}

/** Logs an error message */
function err(this: PluginContext, ...data: any[]) {
  // Filter silent errors
  data = data.filter((x) => !(x instanceof SilentError));
  if (!data.length) return;

  // Add stack trace if there isn't one
  if (!data.find((x) => x instanceof Error)) {
    data.push(new Error().stack?.replace(/^.*$/m, "") || "");
  }

  // Format errors properly
  data = data.map((e) => {
    if (e instanceof StructError) {
      const root = JSON.stringify(e.branch[0], null, 2);
      const target = JSON.stringify(e.branch[e.branch.length - 1], null, 2);
      const pattern = new RegExp(
        rescape(target || "").replace(/(\s|\n)+/g, "(\\s|\\n)*") || "$^"
      );
      const important = [e.path.join("."), e.value + "", e.type].map(
        (x) => new RegExp("\\b" + rescape(x) + "\\b")
      );

      const received = offset(highlight(root, pattern, bright, red));
      const stack = highlight(e.stack || "", important, bright, red);

      return stack + "\nReceived:\n" + received;
    }
    if (e instanceof Error) return e.stack || "", red;
    return e;
  });

  log.bind(this)({ level: "error", color: red, separator: "!", data });
}

/** Prints a visual log divider  */
function divide(title = "") {
  const divider = "=".repeat(30 - title.length / 2);
  const data = [divider + title + divider + (title.length % 2 ? "=" : "")];
  log({ data, pure: true });
}

type LogInfo = {
  level?: "log" | "warn" | "error";
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
