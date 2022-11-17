import { createInterface, Interface } from "node:readline/promises";
import { log, pool, pools, stop as close } from "../event";
import { cyan, highlight } from "@amadeus/util/color";
import { prefix, split } from "@amadeus/util/string";
import { stdin, stdout } from "node:process";
import type { WriteStream } from "node:tty";
import { plugins } from "../plugin";
import { map, take } from "libfun";
import { wrn } from "./log";
import { stop } from ".";

type Argument = readonly (string | symbol)[] | string | symbol;
const commands = new Map<string, Argument[] | []>();

function command(
  this: { group?: string } | void,
  what: string,
  ...args: readonly Argument[]
) {
  if (!what) throw new Error("Invalid command!");
  commands.set(what, (args || []) as any);
  return pool<(...args: (string | undefined)[]) => void>(
    `command/${what}`
  ).bind(this);
}

function* usage(this: { group?: string } | void, command: string) {
  const help = pool<(filter: string) => void>("command/help");
  yield* map(help.bind(this)(command));
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

  const unsubscribe = log(() => (cli.prompt(true), colorizer()));
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

function options(parts: string[], index: number) {
  if (index <= 0) return [...commands.keys()];

  let docs = commands.get(parts[0])?.[index - 1] || [];
  if (!Array.isArray(docs)) docs = [docs as any];
  return docs.flatMap((x) => {
    if (x === arg.text) return [];
    if (x === arg.command) return [...commands.keys()];
    if (x === arg.pool) return pools.status().map((x) => x.id);
    if (x === arg.plugin) {
      return [...plugins.values()].map((x) => x.name.toLowerCase());
    }
    if (typeof x === "string") return x;
    return [];
  });
}

function completer(this: Interface, line: string) {
  if (this.cursor !== this.line.length) return [[], line];
  const parts = split(line);
  const index = parts.length - (line.endsWith(" ") ? 0 : 1);
  const completions = options(parts, index);
  const target = parts[index] || "";
  const hits = completions.filter((x) => x.startsWith(target));

  const common = prefix(hits).replace(target, "");
  if (hits.length === 1) this.write(hits[0].replace(target, ""));
  else if (common) this.write(common);
  if (hits.length > 1) {
    console.log(`\n${hits.join("\t")}\n`);
    this.prompt(true);
  }
  stdin.emit("data", Buffer.from([]));

  return [[], line];
}

function colorize(cli: Interface) {
  const output: WriteStream = (cli as any).output;
  return () => {
    const patterns = [...commands.keys()].map(
      (x) => new RegExp(`(^${x}(\\s|$))`)
    );
    const colored = highlight(cli.line, patterns, cyan);
    if (colored === cli.line) return;
    const { cols } = cli.getCursorPos();
    output.write(`\r${cli.getPrompt()}${colored}`);
    output.cursorTo(cols);
  };
}

const arg = {
  text: Symbol("text"),
  pool: Symbol("pool"),
  plugin: Symbol("plugin"),
  command: Symbol("command"),
};

export { interactive, command, commands, arg, usage };
