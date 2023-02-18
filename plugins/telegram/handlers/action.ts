import {
  aggregate,
  callback,
  info,
  invite,
  mention,
  ok,
  persistence,
  wrn,
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
import { bright, reset } from "@amadeus-music/util/color";
import { shuffle } from "@amadeus-music/util/object";
import { TrackInfo } from "@amadeus-music/protocol";
import { async, is } from "@amadeus-music/core";

callback(function* (action) {
  const report = (result: number[], type: string) => {
    const errors = result.filter((x) => !x).length;
    const op = `${type} download for ${bright}${this.name}${reset}`;
    const failures = `${bright}${errors}${reset}/${result.length}`;
    if (!errors) ok(`${op} has successfully completed!`);
    else wrn(`${op} failed to send ${failures} items!`);
  };

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
    report(yield* this.reply(page.items), "Page");
  } else if (is(action, All)) {
    info(`${this.name} requested a mass download...`);
    const all = aggregate<TrackInfo>(action.all).pages;
    report(yield* this.reply(all.flatMap((x) => x.items)), "Mass");
  } else if (is(action, Shuffle)) {
    info(`${this.name} requested a random download...`);
    const all = aggregate<TrackInfo>(action.shuffle).pages;
    const shuffled = shuffle(all.flatMap((x) => x.items)).slice(0, 10);
    report(yield* this.reply(shuffled), "Random");
  }
});

invite((chat, title) => {
  info("invite", chat, title);
});

mention((chat) => {
  info("mention", chat);
});
