import {
  persistence,
  recognize,
  message,
  search,
  lookup,
  scrape,
  voice,
  fetch,
  info,
  post,
  wrn,
} from "../plugin";
import { format } from "@amadeus-music/protocol";
import { map } from "@amadeus-music/core";
import { icon } from "../api/markup";
import { pages } from "../api/pages";

message(function* (text) {
  info(`${this.name} is searching for "${format(text)}"...`);
  if (typeof text !== "string") {
    const track = yield* lookup("track", text);
    if (!track) return wrn(`Unable to lookup track "${format(text)}"!`);
    yield* this.reply([track]);
    return;
  }
  yield* persistence(this.user).history.log(text);

  const [id] = yield* this.reply({ page: text, icon: icon.search });
  const page = pages.get(id);
  if (!page) return;

  if (text.match(/^https?:\/\//)) {
    const reply = this.reply.bind(this);
    yield* map(scrape(text, 8), function* (state) {
      if (state.completed && state.items.length === 1) {
        page.close();
        state.close();
        yield* reply(state.items);
      } else {
        yield* page.update(state);
      }
    });
    return;
  }

  this.signal.addEventListener("abort", page.close, { once: true });
  yield* map(search("track", text, 8), function* (state) {
    yield* page.update(state);
  });
});

post(function* (meta, chat) {
  const storage = persistence(this.user);
  const track = yield* lookup("track", meta);
  if (!track) return wrn(`Unable to lookup track "${format(meta)}"!`);
  const playlist = +(yield* storage.settings.lookup(chat));
  yield* storage.library.push([track], playlist);
  info(`${this.name} added "${format(track)}" to "${playlist}".`);
});

voice(function* (url) {
  info(`${this.name} requested an audio recognition...`);
  const [id] = yield* this.reply({ page: "Recognition", icon: icon.recognize });
  const page = pages.get(id);
  if (!page) return;
  this.signal.addEventListener("abort", page.close, { once: true });

  const { response } = yield* fetch(url, { baseURL: "" }).flush();
  if (!response.body) throw new Error("Could not load voice file!");

  let stream = response.body;
  const restream = () => {
    const streams = stream.tee();
    stream = streams[0];
    return streams[1];
  };

  yield* map(recognize(restream, 8), function* (state) {
    yield* page.update(state);
  });
});
