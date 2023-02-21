import { command, persistence, pool } from "../plugin";
import { icon, replies } from "../api/markup";
import { async } from "@amadeus-music/core";

command(function* (command) {
  if (command === "start") {
    yield* this.reply({ text: "👋" });
  }
  if (command === "cancel") {
    pool(`queue/${this.chat}`).drain();
    pool(`upload/${this.chat}`).drain();
  }
  if (command === "history") {
    const entries = yield* async(persistence(this.user).history());
    const last = entries.map((x) => x.query).slice(0, 5);
    yield* this.reply({
      text: icon.history,
      markup: replies(last),
    });
  }
});
