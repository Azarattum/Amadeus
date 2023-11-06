import { persistence, command, pool, temp } from "../plugin";
import { replies, icon } from "../api/markup";

command(function* (command) {
  if (command === "start") {
    yield* this.reply({ text: "👋" });
  }
  if (command === "cancel") {
    pool(`queue/${this.chat}`).drain();
    pool(`upload/${this.chat}`).drain();
  }
  if (command === "history") {
    const entries = yield* persistence(this.user).history.get();
    const last = entries.map((x) => x.query).slice(0, 5);
    const [message] = yield* this.reply({
      markup: replies(last),
      text: icon.history,
    });
    temp.get(this.chat)?.add(message);
  }
});
