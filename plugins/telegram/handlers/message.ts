import { message, search, voice, info, post, persistence } from "../plugin";
import { bright, reset } from "@amadeus-music/util/color";
import { map } from "@amadeus-music/core";
import { icon } from "../api/markup";
import { pages } from "../api/pages";

message(function* (text) {
  info(`${bright}${this.name}${reset} is searching for "${text}"...`);
  yield* persistence(this.user).history.log(text);

  const [id] = yield* this.reply({ page: text, icon: icon.search });
  const page = pages.get(id);
  if (!page) return;

  this.signal.addEventListener("abort", page.close, { once: true });
  yield* map(search("track", text, 8), function* (state) {
    yield* page.update(state);
  });
});

voice((file) => {
  info("voice", file);
});

post((file, chat) => {
  info("post", file, chat);
});
