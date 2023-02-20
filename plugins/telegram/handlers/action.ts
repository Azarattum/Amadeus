import {
  aggregate,
  callback,
  desource,
  info,
  invite,
  mention,
  ok,
  persistence,
  fetch,
  wrn,
  relate,
} from "../plugin";
import { markdown, escape, pager, details, keyboard } from "../api/markup";
import { bright, reset } from "@amadeus-music/util/color";
import { artist, action as type } from "../types/action";
import { TrackDetails } from "@amadeus-music/protocol";
import { shuffle } from "@amadeus-music/util/object";
import { async } from "@amadeus-music/core";
import { paramify } from "../api/reply";

callback(function* (action, message, chat) {
  const report = (result: number[], type: string) => {
    const errors = result.filter((x) => !x).length;
    const op = `${type} download for ${bright}${this.name}${reset}`;
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
      markup: details(track.id),
    });
  }
  if (type("download").is(action)) {
    const track = yield* async(persistence().track(action.download));
    yield* this.reply([track]);
  }
  if (type("page").is(action)) {
    info(`${this.name} requested a page download...`);
    const page = aggregate<TrackDetails>(action.page).current;
    yield* async(page.loaded);
    report(yield* this.reply(page.items), "Page");
  }
  if (type("all").is(action)) {
    info(`${this.name} requested a mass download...`);
    const all = aggregate<TrackDetails>(action.all).pages;
    report(yield* this.reply(all.flatMap((x) => x.items)), "Mass");
  }
  if (type("shuffle").is(action)) {
    info(`${this.name} requested a random download...`);
    const all = aggregate<TrackDetails>(action.shuffle).pages;
    const shuffled = shuffle(all.flatMap((x) => x.items)).slice(0, 10);
    report(yield* this.reply(shuffled), "Random");
  }
  if (type("album").is(action)) {
    const track = yield* async(persistence().track(action.album));
    const cache = persistence();

    const id = aggregate(desource, ["album", track.album.source] as const, {
      async update(tracks, progress, page) {
        await cache.push(tracks);
        const buttons = tracks.map((x) => ({
          text: `${x.artists.map((x) => x.title).join(", ")} - ${x.title}`,
          callback: { download: x.id },
        }));

        const params = {
          mode: markdown(),
          caption:
            progress < 1
              ? `${Math.round(progress * 100)}% ⏳ ${escape(track.album.title)}`
              : `💿 *${escape(track.album.title)}*`,
          markup: pager(
            id,
            page,
            buttons,
            progress >= 1 && tracks.length >= this.page
          ),
        };

        fetch("editMessageCaption", {
          params: {
            chat_id: chat.toString(),
            message_id: message.toString(),
            ...paramify(params),
          },
        });
      },
      invalidate() {
        fetch("editMessageCaption", {
          params: {
            chat_id: chat.toString(),
            message_id: message.toString(),
            ...paramify({ mode: markdown(), markup: details(track.id) }),
          },
        });
      },
      page: 8,
    });
  }
  if (type("similar").is(action)) {
    const track = yield* async(persistence().track(action.similar));
    const cache = persistence();

    const id = aggregate(relate, ["track", track] as const, {
      async update(tracks, progress, page) {
        await cache.push(tracks);
        const buttons = tracks.map((x) => ({
          text: `${x.artists.map((x) => x.title).join(", ")} - ${x.title}`,
          callback: { download: x.id },
        }));

        const params = {
          mode: markdown(),
          caption:
            progress < 1
              ? `${Math.round(progress * 100)}% ⏳ *Similar*`
              : `📻 *Similar*`,
          markup: pager(
            id,
            page,
            buttons,
            progress >= 1 && tracks.length >= this.page
          ),
        };

        fetch("editMessageCaption", {
          params: {
            chat_id: chat.toString(),
            message_id: message.toString(),
            ...paramify(params),
          },
        });
      },
      invalidate() {
        fetch("editMessageCaption", {
          params: {
            chat_id: chat.toString(),
            message_id: message.toString(),
            ...paramify({ mode: markdown(), markup: details(track.id) }),
          },
        });
      },
      page: 8,
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
          [{ text: "👌", callback: { reset: track.id } }],
        ]),
      });
    }
  }
  if (artist.is(action)) {
    const artist = yield* async(persistence().artist(action.artist));
    const cache = persistence();
    const track = action.track;

    const id = aggregate(desource, ["artist", artist.source] as const, {
      async update(tracks, progress, page) {
        await cache.push(tracks);
        const buttons = tracks.map((x) => ({
          text: `${x.artists.map((x) => x.title).join(", ")} - ${x.title}`,
          callback: { download: x.id },
        }));

        const params = {
          mode: markdown(),
          caption:
            progress < 1
              ? `${Math.round(progress * 100)}% ⏳ ${escape(artist.title)}`
              : `👤 *${escape(artist.title)}*`,
          markup: pager(
            id,
            page,
            buttons,
            progress >= 1 && tracks.length >= this.page
          ),
        };

        fetch("editMessageCaption", {
          params: {
            chat_id: chat.toString(),
            message_id: message.toString(),
            ...paramify(params),
          },
        });
      },
      invalidate() {
        fetch("editMessageCaption", {
          params: {
            chat_id: chat.toString(),
            message_id: message.toString(),
            ...paramify({ mode: markdown(), markup: details(track) }),
          },
        });
      },
      page: 8,
    });
  }
});

invite((chat, title) => {
  info("invite", chat, title);
});

mention((chat) => {
  info("mention", chat);
});
