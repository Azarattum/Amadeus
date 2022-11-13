import { createInterface } from "node:readline/promises";
import { stdin, stdout } from "node:process";
import { info, logged } from "./log";

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

  logged(() => cli.prompt(true));
  cli.on("line", (input) => {
    handle(input);
    cli.prompt();
  });
  cli.on("close", () => {
    /// TODO: emit global close event!
  });

  cli.prompt();
}

export { interactive };
