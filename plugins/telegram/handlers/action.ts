import {
  aggregate,
  callback,
  desource,
  info,
  invite,
  mention,
  persistence,
} from "../plugin";
import { Close, Download, Next, Prev } from "../types/action";
import { bright, reset } from "@amadeus-music/util/color";
import { async, first, is } from "@amadeus-music/core";

callback(function* (action) {
  if (is(action, Next)) aggregate(action.next).next();
  if (is(action, Prev)) aggregate(action.prev).prev();
  if (is(action, Close)) aggregate(action.close).close();
  else if (is(action, Download)) {
    const track = yield* async(persistence().track(action.download));
    const url = yield* async(first(desource(track.source)));

    const performer = track.artists.map((x) => x.title).join(", ");
    const song = `${performer} - ${track.title}`;
    info(`Sending "${song}" to ${bright}${this.name}${reset}...`);
    yield* this.reply({
      audio: { url, performer, title: track.title, thumb: track.album.art },
    });
  }
});

invite((chat, title) => {
  info("invite", chat, title);
});

mention((chat) => {
  info("mention", chat);
});
