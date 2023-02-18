import {
  aggregate,
  callback,
  info,
  invite,
  mention,
  ok,
  persistence,
} from "../plugin";
import {
  All,
  Close,
  Download,
  Next,
  Page,
  Prev,
  Shuffle,
} from "../types/action";
import { shuffle } from "@amadeus-music/util/object";
import { TrackInfo } from "@amadeus-music/protocol";
import { async, is } from "@amadeus-music/core";

callback(function* (action) {
  if (is(action, Next)) aggregate(action.next).next();
  if (is(action, Prev)) aggregate(action.prev).prev();
  if (is(action, Close)) aggregate(action.close).close();
  else if (is(action, Download)) {
    const track = yield* async(persistence().track(action.download));
    yield* this.reply([track]);
  } else if (is(action, Page)) {
    info(`${this.name} requested a page download...`);
    const page = aggregate<TrackInfo>(action.page).current;
    yield* async(page.loaded);
    yield* this.reply(page.items);
    ok(`Page download for ${this.name} has completed!`);
  } else if (is(action, All)) {
    info(`${this.name} requested a mass download...`);
    const all = aggregate<TrackInfo>(action.all).pages;
    yield* this.reply(all.flatMap((x) => x.items));
    ok(`Mass download for ${this.name} has completed!`);
  } else if (is(action, Shuffle)) {
    info(`${this.name} requested a random download...`);
    const all = aggregate<TrackInfo>(action.shuffle).pages;
    yield* this.reply(shuffle(all.flatMap((x) => x.items)).slice(0, 10));
    ok(`Random download for ${this.name} has completed!`);
  }
});

invite((chat, title) => {
  info("invite", chat, title);
});

mention((chat) => {
  info("mention", chat);
});
