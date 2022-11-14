import { createInterface } from "node:readline/promises";
import { log, stop as close } from "../event";
import { stdin, stdout } from "node:process";
import { stop } from ".";

function handle(command: string) {
  /// TODO: handle command (mb filesystem based)
  //    - create a pool builder like: `command("test")(() => ...)
  //    - plugins should be able to register commands too
}

function interactive() {
  /// TODO:
  ///   syntax highlighting
  ///   command auto completion
  const cli = createInterface({
    input: stdin,
    output: stdout,
    prompt: "> ",
  });
  const unsubscribe = log(() => cli.prompt(true));
  close(() => cli.close());

  cli.on("close", () => {
    cli.removeAllListeners();
    unsubscribe();
    return stop();
  });
  cli.on("line", (input) => {
    handle(input);
    cli.prompt();
  });
  cli.prompt();
}

export { interactive };
