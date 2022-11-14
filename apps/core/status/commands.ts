import { command, commands } from "./cli";
import { log, pools } from "../event";
import { async, take } from "libfun";
import { info } from "./log";
import { stop } from ".";

command("stop")(function* () {
  yield* async(stop());
});

command("status")(() => {
  const status = pools.status();
  status
    .filter((x) => !x.id.startsWith("command/"))
    .forEach((x) => {
      /// TODO: add proper formatting
      info(x);
    });
});

command("help")(() => {
  info(`Available commands: ${take(commands.values()).join(", ")}.`);
});

command("clear")(() => {
  console.clear();
  take(log(""));
});
