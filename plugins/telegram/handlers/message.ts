import { message, search, voice, info, post, persistence } from "../plugin";
import { async, first, map } from "@amadeus-music/core";
import { format } from "@amadeus-music/protocol";
import { icon } from "../api/markup";
import { pages } from "../api/pages";

message(function* (text) {
  info(`${this.name} is searching for "${text}"...`);
  yield* persistence(this.user).history.log(text);

  const [id] = yield* this.reply({ page: text, icon: icon.search });
  const page = pages.get(id);
  if (!page) return;

  this.signal.addEventListener("abort", page.close, { once: true });
  yield* map(search("track", text, 8), function* (state) {
    yield* page.update(state);
  });
});

post(function* (text, chat) {
  const storage = persistence(this.user);
  const page = yield* async(first(search("track", text, 1)));
  yield* async(page.loaded);
  const track = page.items[0];
  const playlist = +(yield* storage.settings.lookup(chat));
  yield* storage.library.push([track], playlist);
  info(`${this.name} added "${format(track)}" to "${playlist}".`);
});

voice((file) => {
  info("voice", file);
});
