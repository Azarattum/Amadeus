import { createInterface, type Interface } from "node:readline/promises";
import { log, pool, pools, stop as close } from "../event/pool";
import { cyan, highlight } from "@amadeus-music/util/color";
import { prefix, split } from "@amadeus-music/util/string";
import { stdin, stdout } from "node:process";
import { users } from "../data/persistence";
import type { WriteStream } from "node:tty";
import { plugins } from "../plugin/loader";
import { arg, commands } from "./commands";
import { settings } from "../data/config";
import { stop } from "./manage";
import { take } from "libfun";
import { wrn } from "./log";
import "./commands";

function handle(command: string) {
  const parts = split(command);
  const main = parts.shift()?.toLowerCase();
  if (!main) return;
  if (!commands.has(main)) return wrn(`No such command "${main}"!`);
  take(pool(`command/${main}`)(...(parts as [])));
}

async function interactive() {
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
    unsubscribe();
    return stop();
  });
  cli.on("line", (input) => {
    take(log(cli.getPrompt() + input));
    handle(input);
  });
  cli.prompt();
}

async function options(parts: string[], index: number) {
  if (index <= 0) return [...commands.keys()];

  let docs = commands.get(parts[0])?.[index - 1] || [];
  if (!Array.isArray(docs)) docs = [docs as any];
  return Promise.all(
    docs.map(async (x) => {
      if (x === arg.text) return [];
      if (x === arg.command) return [...commands.keys()];
      if (x === arg.pool) return pools.status().map((x) => x.id);
      if (x === arg.user) return Object.keys(await users());
      if (x === arg.setting) return Object.keys(settings().create({}));
      if (x === arg.plugin) {
        return [...plugins.values()].map((x) => x.name.toLowerCase());
      }
      if (typeof x === "string") return x;
      return [];
    })
  ).then((x) => x.flat(2));
}

async function completer(this: Interface, line: string) {
  if (this.cursor !== this.line.length) return [[], line];
  const parts = split(line);
  const index = parts.length - (line.endsWith(" ") ? 0 : 1);
  const completions = await options(parts, index);
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

export { interactive };
