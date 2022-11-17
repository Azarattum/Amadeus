import {
  black,
  bright,
  green,
  magenta,
  reset,
  yellow,
} from "@amadeus/util/color";
import { capitalize, format } from "@amadeus/util/string";
import { arg, command, commands } from "./cli";
import { log, pools } from "../event";
import { async, take } from "libfun";
import { info, wrn } from "./log";
import { stop } from ".";

command("stop")(function* () {
  yield* async(stop());
});

command("status", ["all", arg.plugin, arg.pool])((filter) => {
  const glyphs = "⚡↓@";
  const [running, pending, handlers] = glyphs;
  const status = pools.status();

  let message = filter
    ? `Status report for ${bright}${filter}${reset}:\n`
    : "Status report:\n";

  const filtered = status.filter((x) => {
    if (filter === "all") return true;
    if (filter === x.id) return true;
    const executors = [...x.executing.values(), ...x.pending.values()];
    executors.push(...executors.flatMap((x: any) => [...x.tasks.values()]));
    if (executors.find((x) => filter === x.group)) return true;
    if (!filter) {
      return ["command/", "init", "stop", "log"].every(
        (y) => !x.id.startsWith(y)
      );
    }
  });
  if (!filtered.length) {
    if (filter) return wrn(`No pools found with filter "${filter}"!`);
    return info(`No pools to show. (Maybe try ${bright}status all${reset}).`);
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
  if (!command) {
    return info(`Available commands: ${take(commands.keys()).join(", ")}.`);
  }
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
});

command("clear")(() => {
  console.clear();
  take(log(""));
});
