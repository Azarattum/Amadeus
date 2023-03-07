import { command, persistence, pool, temp } from "../plugin";
import { icon, replies } from "../api/markup";

command(function* (command) {
  if (command === "start") {
    const [message] = yield* this.reply({ text: "👋" });
    temp.get(this.chat)?.add(message);
  }
  if (command === "cancel") {
    pool(`queue/${this.chat}`).drain();
    pool(`upload/${this.chat}`).drain();
  }
  if (command === "history") {
    const entries = yield* persistence(this.user).history.get();
    const last = entries.map((x) => x.query).slice(0, 5);
    const [message] = yield* this.reply({
      text: icon.history,
      markup: replies(last),
    });
    temp.get(this.chat)?.add(message);
  }
});
