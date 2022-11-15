import { black, bright, green, reset, yellow } from "@amadeus/util/color";
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
    if (filter === x.group) return true;
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

command("help")(() => {
  info(`Available commands: ${take(commands.keys()).join(", ")}.`);
});

command("clear")(() => {
  console.clear();
  take(log(""));
});
