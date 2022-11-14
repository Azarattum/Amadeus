import { createInterface, Interface } from "node:readline/promises";
import { cyan, highlight } from "@amadeus/util/color";
import { log, pool, stop as close } from "../event";
import { split } from "@amadeus/util/string";
import { stdin, stdout } from "node:process";
import type { WriteStream } from "node:tty";
import { take } from "libfun";
import { wrn } from "./log";
import { stop } from ".";

const commands = new Set<string>();

function command(this: { group?: string } | void, what: string) {
  if (!what) throw new Error("Invalid command!");
  commands.add(what);
  return pool<(...args: (string | undefined)[]) => void>(
    `command/${what}`
  ).bind(this);
}

function handle(command: string) {
  const parts = split(command);
  const main = parts.shift();
  if (!main) return;
  if (!commands.has(main)) return wrn(`No such command "${main}"!`);
  take(pool(`command/${main}`)(...(parts as [])));
}

async function interactive() {
  await import("./commands");
  const cli = createInterface({
    input: stdin,
    output: stdout,
    prompt: "> ",
    tabSize: 2,
    completer,
  });
  const colorizer = colorize(cli);
  stdin.on("data", colorizer);

  const unsubscribe = log(() => cli.prompt(true));
  close(() => cli.close());

  cli.on("close", () => {
    stdin.removeListener("data", colorizer);
    cli.removeAllListeners();
    commands.clear();
    unsubscribe();
    return stop();
  });
  cli.on("line", (input) => {
    take(log(cli.getPrompt() + input));
    handle(input.toLowerCase());
  });
  cli.prompt();
}

function completer(line: string) {
  /// Support multiple words: https://stackoverflow.com/questions/44708200/nodejs-readline-autocomplete-several-words
  const completions = [...commands];
  const hits = completions.filter((c) => c.startsWith(line));
  setTimeout(() => stdin.emit("data", Buffer.from([])));
  return [hits.length ? hits : completions, line];
}

function colorize(cli: Interface) {
  const output: WriteStream = (cli as any).output;
  return () => {
    const patterns = [...commands].map((x) => new RegExp(`(^${x}(\\s|$))`));
    const colored = highlight(cli.line, patterns, cyan);
    if (colored === cli.line) return;
    output.write(`\r${cli.getPrompt()}${colored}`);
  };
}

export { interactive, command, commands };
