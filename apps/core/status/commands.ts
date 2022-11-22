import {
  black,
  bright,
  green,
  magenta,
  reset,
  yellow,
} from "@amadeus-music/util/color";
import { capitalize, format } from "@amadeus-music/util/string";
import { pretty } from "@amadeus-music/util/object";
import { log, pool, pools } from "../event";
import { async, map, take } from "libfun";
import { info, wrn } from "./log";
import { stop } from ".";

type Argument = readonly (string | symbol)[] | string | symbol;
const commands = new Map<string, Argument[] | []>();

const arg = {
  text: Symbol("text"),
  pool: Symbol("pool"),
  plugin: Symbol("plugin"),
  command: Symbol("command"),
};

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

function usage(this: { group?: string } | void, command: string) {
  const docs = commands.get(command);
  if (!docs) return wrn(`No such command "${command}"!`);
  let usage = `Usage for "${command}" command is:\n  `;
  usage += `${bright}${command}${reset} `;
  const args = docs.map((x) => {
    if (!Array.isArray(x)) x = [x as any];
    return x
      .map((type) =>
        type.description
          ? `${bright + magenta}${type.description}${reset}`
          : type
      )
      .join(`${bright + black}/${reset}`);
  });
  usage += args.join(" ") + "\n";
  info(usage);
}

command("stop")(function* () {
  yield* async(stop());
});

command("status", ["all", arg.plugin, arg.pool])((filter) => {
  const glyphs = "⚡↓@";
  const [running, pending, handlers] = glyphs;
  const status = pools.status();

  filter = filter?.toLowerCase();
  let message = filter
    ? `Status report for ${bright}${filter}${reset}:\n`
    : "Status report:\n";

  const filtered = status.filter((x) => {
    if (filter === "all") return true;
    if (filter === x.id) return true;
    if (x.id.startsWith(filter + "/")) return true;
    const executors = [...x.executing.values(), ...x.pending.values()];
    executors.push(...executors.flatMap((x: any) => [...x.tasks.values()]));
    if (executors.find((x) => filter === x.group)) return true;
    if (!filter) {
      if (!executors.length) return false;
      return ["command/status", "log"].every((y) => x.id !== y);
    }
  });
  if (!filtered.length) {
    if (filter) return wrn(`No pools found with filter "${filter}"!`);
    return info(`No pools running. (Maybe try ${bright}status all${reset}).`);
  }

  filtered.forEach((x) => {
    message += `${bright}${capitalize(x.id)}${reset}`;
    message += ": ";
    message += `${x.listeners.size}${handlers} `;
    message += `${yellow}${x.pending.size}${pending}${reset} `;
    message += `${green}${x.executing.size}${running}${reset} `;
    if (x.last) message += `${bright + black}(${format(x.last)})${reset}`;
    message += "\n";

    x.executing.forEach((executor) => {
      message += ` ${green}${running}${reset}`;
      message += `${capitalize(executor.group || "unknown")} ← [`;
      message += [...executor.tasks]
        .map((x) => capitalize(x.group || "unknown"))
        .join(", ");
      message += "]\n";
    });
    x.pending.forEach((executor) => {
      message += ` ${yellow}${pending}${reset}`;
      message += `${capitalize(executor.group || "unknown")}...`;
    });
    if (x.executing.size || x.pending.size) message += "\n";
  });

  message = message.trimEnd() + "\n";
  message = message.replace(/\n/g, "\n  ");
  info(message);
});

command("help", [arg.command])((command) => {
  if (command) return usage(command);
  info(`Available commands: ${take(commands.keys()).sort().join(", ")}.`);
});

command("clear")(() => {
  console.clear();
  take(log(""));
});

command("abort", ["all", arg.plugin, arg.pool])(function* (filter) {
  if (!filter) return usage("abort");
  filter = filter.toLowerCase();
  const status = pools.status().find((x) => x.id === filter);

  if (filter === "all") {
    pools.abort();
    info("Aborted all running pools!");
  } else if (status) {
    const target = pool(status.id);
    target.abort();
    info(`Aborted pool ${bright}${status.id}${reset}!`);
  } else {
    pools.abort("*", { group: filter });
    info(`Aborted everything matching ${bright}${filter}${reset}!`);
  }
});

command("drain", ["all", arg.plugin, arg.pool])(function* (filter) {
  if (!filter) return usage("drain");
  filter = filter.toLowerCase();
  const status = pools.status().find((x) => x.id === filter);

  if (filter === "all") {
    pools.drain();
    info("Drained all the pools!");
  } else if (status) {
    const target = pool(status.id);
    target.drain();
    info(`Drained pool ${bright}${status.id}${reset}!`);
  } else {
    pools.drain("*", { group: filter });
    info(`Drained everything matching ${bright}${filter}${reset}!`);
  }
});

command("exec", [arg.pool])(function* (what, ...args) {
  if (!what) return usage("exec");
  const name = `${bright}${what}${reset}`;
  if (!pools.status().find((x) => x.id === what)) {
    return wrn(`No such pool ${name}!`);
  }
  const target = pool(what);
  yield* map(target(...(args as [])), function* (item: any) {
    info(`${name} responds with: ${pretty(item)}`);
  });
  info(`${name} done executing!`);
});

export { command, commands, arg, usage };
