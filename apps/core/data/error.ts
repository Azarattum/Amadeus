import { bright, highlight, red } from "@amadeus-music/util/color";
import { offset, rescape } from "@amadeus-music/util/string";
import type { Context } from "../plugin/types";
import { StructError } from "superstruct";
import { PoolError } from "libfun";

function format(error: any, context?: Context, message = false) {
  const original = error.message || "";
  if (error instanceof Error && error.cause) {
    error.message = error.message + "\n" + format(error.cause, context, true);
  }

  if (error instanceof PoolError && context) {
    context.group = error.handler || error.caller;
  } else if (error instanceof StructError) {
    const { branch } = error;
    const root = JSON.stringify(branch[0], null, 2);
    const target = JSON.stringify(branch[branch.length - 1], null, 2) || "";
    const pattern = new RegExp(
      rescape(target).replace(/(\s|\n)+/g, "(\\s|\\n)*") || "$^"
    );
    const important = [error.path.join("."), error.value + "", error.type]
      .filter((x) => x)
      .map((x) => new RegExp("\\b" + rescape(x) + "\\b", "g"));

    error.message =
      highlight(error.message, important, bright, red) +
      "\nReceived:\n" +
      offset(highlight(root, pattern, bright, red));
  }

  if (error instanceof Error) {
    if (!error.stack?.includes(original) && !message) {
      error.stack = error.message + (error.stack ? "\n" + error.stack : "");
    } else if (error.message !== original && !message) {
      error.stack = error.stack?.replace(original, error.message);
    }
    return message ? error.message : error.stack;
  }

  return typeof error === "object"
    ? JSON.stringify(error) || "undefined"
    : error.toString();
}

export { format };
