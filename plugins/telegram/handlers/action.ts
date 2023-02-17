import {
  aggregate,
  callback,
  desource,
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
import { bright, reset } from "@amadeus-music/util/color";
import { async, first, is } from "@amadeus-music/core";
import { shuffle } from "@amadeus-music/util/object";

callback(function* (action) {
  if (is(action, Next)) aggregate(action.next).next();
  if (is(action, Prev)) aggregate(action.prev).prev();
  if (is(action, Close)) aggregate(action.close).close();
  /// TODO: Abstract into track upload function/pool, error handle each upload
  else if (is(action, Download)) {
    const track = yield* async(persistence().track(action.download));
    const url = yield* async(first(desource(track.source)));

    const performer = track.artists.map((x) => x.title).join(", ");
    const song = `${performer} - ${track.title}`;
    info(`Sending "${song}" to ${bright}${this.name}${reset}...`);
    yield* this.reply({
      audio: { url, performer, title: track.title, thumb: track.album.art },
    });
  } else if (is(action, Page)) {
    info(`${this.name} requested a page download...`);
    const page = aggregate(action.page).current;
    yield* async(page.loaded);
    for (const item of page.items) {
      const url = yield* async(first(desource(item.source as string)));
      const performer = item.artists.map((x: any) => x.title).join(", ");
      const song = `${performer} - ${item.title}`;
      info(`Sending "${song}" to ${bright}${this.name}${reset}...`);
      yield* this.reply({
        audio: { url, performer, title: item.title, thumb: item.album.art },
      });
    }
    ok(`Page download for ${this.name} has completed!`);
  } else if (is(action, All)) {
    info(`${this.name} requested a mass download...`);
    const all = aggregate(action.all).pages;
    for (const item of all.flatMap((x) => x.items)) {
      const url = yield* async(first(desource(item.source as string)));
      const performer = item.artists.map((x: any) => x.title).join(", ");
      const song = `${performer} - ${item.title}`;
      info(`Sending "${song}" to ${bright}${this.name}${reset}...`);
      yield* this.reply({
        audio: { url, performer, title: item.title, thumb: item.album.art },
      });
    }
    ok(`Mass download for ${this.name} has completed!`);
  } else if (is(action, Shuffle)) {
    info(`${this.name} requested a random download...`);
    const all = aggregate(action.shuffle).pages;
    for (const item of shuffle(all.flatMap((x) => x.items)).slice(0, 10)) {
      const url = yield* async(first(desource(item.source as string)));
      const performer = item.artists.map((x: any) => x.title).join(", ");
      const song = `${performer} - ${item.title}`;
      info(`Sending "${song}" to ${bright}${this.name}${reset}...`);
      yield* this.reply({
        audio: { url, performer, title: item.title, thumb: item.album.art },
      });
    }
    ok(`Random download for ${this.name} has completed!`);
  }
});

invite((chat, title) => {
  info("invite", chat, title);
});

mention((chat) => {
  info("mention", chat);
});
