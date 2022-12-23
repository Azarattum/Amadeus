import { command } from "../plugin";

command(function* (command) {
  if (command === "start") {
    yield* this.reply({ text: "👋" });
    /// Add to temp messages
  }
});
