import {
  callback,
  info,
  invite,
  mention,
  ok,
  persistence,
  wrn,
  relate,
  transcribe,
  temp,
  expand,
} from "../plugin";
import { markdown, menu, keyboard, icon, escape } from "../api/markup";
import { format, identify } from "@amadeus-music/protocol";
import { bright, reset } from "@amadeus-music/util/color";
import { artist, action as type } from "../types/action";
import { async, first, map } from "@amadeus-music/core";
import { shuffle } from "@amadeus-music/util/object";
import { pages } from "../api/pages";

callback(function* (action, message) {
  const { tracks, artists } = persistence();
  const report = (result: number[], type: string) => {
    const errors = result.filter((x) => !x).length;
    const op = `${type} download for ${this.name}`;
    const failures = `${bright}${errors}${reset}/${result.length}`;
    if (!errors) ok(`${op} has successfully completed!`);
    else wrn(`${op} failed to send ${failures} items!`);
  };

  if (type("next").is(action)) pages.get(action.next)?.next();
  if (type("prev").is(action)) pages.get(action.prev)?.prev();
  if (type("close").is(action)) pages.get(action.close)?.close();
  if (type("reset").is(action)) {
    const track = yield* tracks.get(action.reset);
    yield* this.edit(message, {
      mode: markdown(),
      markup: menu(track.id),
    });
  }
  if (type("download").is(action)) {
    const track = yield* tracks.get(action.download);
    yield* this.reply([track]);
  }
  if (type("page").is(action)) {
    info(`${this.name} requested a page download...`);
    const page = pages.get(action.page);
    const loaded = page?.loaded;
    if (!loaded) return;

    yield* async(loaded);
    report(yield* this.reply(page.items), "Page");
  }
  if (type("all").is(action)) {
    info(`${this.name} requested a mass download...`);
    report(yield* this.reply(pages.get(action.all)?.all || []), "Mass");
  }
  if (type("shuffle").is(action)) {
    info(`${this.name} requested a random download...`);
    const shuffled = shuffle(pages.get(action.shuffle)?.all || []).slice(0, 10);
    report(yield* this.reply(shuffled), "Random");
  }
  if (type("lyrics").is(action)) {
    const track = yield* tracks.get(action.lyrics);
    info(`${this.name} requested lyrics for "${format(track)}".`);
    const fallback =
      `No lyrics found\\. [Try searching the web\\.](https://www.google.com/` +
      `search?q=lyrics+${format(track).replace(/\s+/g, "+")})`;
    const lyrics = yield* async(first(transcribe(track)).catch(() => fallback));
    const header = `${icon.lyrics} *${escape(format(track))}*\n\n`;
    const limit = 1024 - header.length;
    if (lyrics.length > limit) {
      const [id] = yield* this.reply({
        text: lyrics,
        to: message.toString(),
      });
      temp.get(this.chat)?.add(id);
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
    const track = yield* tracks.get(action.album);
    info(`${this.name} requested an album of "${format(track)}".`);
    const [id] = yield* this.reply({
      page: track.album.title,
      icon: icon.album,
      reset: track.id,
      message,
    });
    const page = pages.get(id);
    if (!page) return;

    this.signal.addEventListener("abort", page.close, { once: true });
    yield* map(
      expand("album", { ...track.album, artists: track.artists }, 8),
      function* (state) {
        yield* page.update(state);
      }
    );
  }
  if (type("similar").is(action)) {
    const track = yield* tracks.get(action.similar);
    info(`${this.name} requested similar to "${format(track)}".`);
    const [id] = yield* this.reply({
      page: "Similar",
      icon: icon.similar,
      reset: track.id,
      message,
    });
    const page = pages.get(id);
    if (!page) return;

    this.signal.addEventListener("abort", page.close, { once: true });
    yield* map(relate("track", track, 8), function* (state) {
      yield* page.update(state);
    });
  }
  if (type("artists").is(action)) {
    const track = yield* tracks.get(action.artists);
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
    const artist = yield* artists.get(action.artist);
    info(`${this.name} requested tracks of artist "${artist.title}".`);
    const [id] = yield* this.reply({
      page: artist.title,
      icon: icon.artist,
      reset: action.track,
      message,
    });
    const page = pages.get(id);
    if (!page) return;

    this.signal.addEventListener("abort", page.close, { once: true });
    yield* map(expand("artist", artist, 8), function* (state) {
      yield* page.update(state);
    });
  }
});

invite(function* (chat, title) {
  const storage = persistence(this.user);
  yield* storage.playlists.create({ title });
  yield* storage.settings.store(identify(title).toString(), chat);
  info(`${this.name} registered playlist "${title}".`);
});

mention((chat) => {
  info("mention", chat);
});
