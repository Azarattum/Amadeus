import { command, pool } from "../plugin";

command(function* (command) {
  if (command === "start") {
    yield* this.reply({ text: "👋" });
  }
  if (command === "cancel") {
    pool(`queue/${this.chat}`).drain();
    pool(`upload/${this.chat}`).drain();
  }
});
