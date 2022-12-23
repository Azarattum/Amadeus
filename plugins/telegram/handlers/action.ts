import { aggregate, callback, info, invite, mention } from "../plugin";
import { Close, Next, Prev } from "../types/action";
import { is } from "@amadeus-music/core";

callback(function* (action, message, chat) {
  if (is(action, Next)) aggregate(action.next).next();
  if (is(action, Prev)) aggregate(action.prev).prev();
  if (is(action, Close)) aggregate(action.close).close();

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
