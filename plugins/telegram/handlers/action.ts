import { callback, info, invite, mention } from "../plugin";
import { aggregator, is } from "@amadeus-music/core";
import { Close, Next, Prev } from "../types/action";

callback(function* (action, message, chat) {
  if (is(action, Next)) aggregator(action.next).next();
  if (is(action, Prev)) aggregator(action.prev).prev();
  if (is(action, Close)) aggregator(action.close).close();

  // else if (Download.is(action)) {
  /// Fetch from db
  // info(`Sourcing ${request} for ${this.name}...`);
  // const { url } = yield* async(first(desource(action.download)));
  // info(url);
  // yield* fetch("sendAudio", {
  //   params: {
  //     chat_id: this.chat,
  //     audio: url,
  //     performer: "test",
  //     title: "hello",
  //   },
  // }).flush();
  // }
});

invite((chat, title) => {
  info("invite", chat, title);
});

mention((chat) => {
  info("mention", chat);
});
