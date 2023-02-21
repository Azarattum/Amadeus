import {
  aggregate,
  callback,
  desource,
  info,
  invite,
  mention,
  ok,
  persistence,
  wrn,
  relate,
  transcribe,
} from "../plugin";
import { markdown, menu, keyboard, icon, escape } from "../api/markup";
import { format, TrackDetails } from "@amadeus-music/protocol";
import { bright, reset } from "@amadeus-music/util/color";
import { artist, action as type } from "../types/action";
import { shuffle } from "@amadeus-music/util/object";
import { async, first } from "@amadeus-music/core";
import { paginate } from "../api/reply";

callback(function* (action, message, chat) {
  const name = `${bright}${this.name}${reset}`;
  const report = (result: number[], type: string) => {
    const errors = result.filter((x) => !x).length;
    const op = `${type} download for ${name}`;
    const failures = `${bright}${errors}${reset}/${result.length}`;
    if (!errors) ok(`${op} has successfully completed!`);
    else wrn(`${op} failed to send ${failures} items!`);
  };

  if (type("next").is(action)) aggregate(action.next).next();
  if (type("prev").is(action)) aggregate(action.prev).prev();
  if (type("close").is(action)) aggregate(action.close).close();
  if (type("reset").is(action)) {
    const track = yield* async(persistence().track(action.reset));
    yield* this.edit(message, {
      mode: markdown(),
      markup: menu(track.id),
    });
  }
  if (type("download").is(action)) {
    const track = yield* async(persistence().track(action.download));
    yield* this.reply([track]);
  }
  if (type("page").is(action)) {
    info(`${name} requested a page download...`);
    const page = aggregate<TrackDetails>(action.page).current;
    yield* async(page.loaded);
    report(yield* this.reply(page.items), "Page");
  }
  if (type("all").is(action)) {
    info(`${name} requested a mass download...`);
    const all = aggregate<TrackDetails>(action.all).pages;
    report(yield* this.reply(all.flatMap((x) => x.items)), "Mass");
  }
  if (type("shuffle").is(action)) {
    info(`${name} requested a random download...`);
    const all = aggregate<TrackDetails>(action.shuffle).pages;
    const shuffled = shuffle(all.flatMap((x) => x.items)).slice(0, 10);
    report(yield* this.reply(shuffled), "Random");
  }
  if (type("lyrics").is(action)) {
    const track = yield* async(persistence().track(action.lyrics));
    const fallback =
      `No lyrics found\\. [Try searching the web\\.](https://www.google.com/` +
      `search?q=lyrics+${format(track).replace(/\s+/g, "+")})`;
    const lyrics = yield* async(first(transcribe(track)).catch(() => fallback));
    const header = `${icon.lyrics} *${escape(format(track))}*\n\n`;
    const limit = 1024 - header.length;
    if (lyrics.length > limit) {
      yield* this.reply({
        text: lyrics,
        to: message.toString(),
      });
      return;
    }
    yield* this.edit(message, {
      mode: markdown(),
      caption:
        `${icon.lyrics} *${escape(format(track))}*\n\n` +
        (lyrics === fallback ? fallback : escape(lyrics)),
      markup: keyboard([[{ text: icon.close, callback: { reset: track.id } }]]),
    });
  }
  if (type("album").is(action)) {
    const track = yield* async(persistence().track(action.album));
    info(`${name} requested an album of "${format(track)}".`);
    paginate([desource, ["album", track.album.source]], {
      header: track.album.title,
      icon: icon.album,
      track: track.id,
      message,
      chat,
    });
  }
  if (type("similar").is(action)) {
    const track = yield* async(persistence().track(action.similar));
    info(`${name} requested similar to "${format(track)}".`);
    paginate([relate, ["track", track]], {
      header: "Similar",
      icon: icon.similar,
      track: track.id,
      message,
      chat,
    });
  }
  if (type("artists").is(action)) {
    const track = yield* async(persistence().track(action.artists));
    if (track.artists.length === 1) {
      action = { artist: track.artists[0].id, track: track.id };
    } else {
      yield* this.edit(message, {
        mode: markdown(),
        markup: keyboard([
          ...track.artists.map((x) => [
            { text: x.title, callback: { artist: x.id, track: track.id } },
          ]),
          [{ text: icon.close, callback: { reset: track.id } }],
        ]),
      });
    }
  }
  if (artist.is(action)) {
    const artist = yield* async(persistence().artist(action.artist));
    info(`${name} requested tracks of artist "${artist.title}".`);
    paginate([desource, ["artist", artist.source]], {
      header: artist.title,
      icon: icon.artist,
      track: action.track,
      message,
      chat,
    });
  }
});

invite((chat, title) => {
  info("invite", chat, title);
});

mention((chat) => {
  info("mention", chat);
});
