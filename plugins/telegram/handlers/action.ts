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
} from "../plugin";
import {
  Album,
  All,
  Close,
  Download,
  Next,
  Page,
  Prev,
  Shuffle,
} from "../types/action";
import { markdown, escape, pager, details } from "../api/markup";
import { bright, reset } from "@amadeus-music/util/color";
import { TrackDetails } from "@amadeus-music/protocol";
import { shuffle } from "@amadeus-music/util/object";
import { async, is } from "@amadeus-music/core";
import { paramify } from "../api/reply";

callback(function* (action, message, chat) {
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
    const page = aggregate<TrackDetails>(action.page).current;
    yield* async(page.loaded);
    report(yield* this.reply(page.items), "Page");
  } else if (is(action, All)) {
    info(`${this.name} requested a mass download...`);
    const all = aggregate<TrackDetails>(action.all).pages;
    report(yield* this.reply(all.flatMap((x) => x.items)), "Mass");
  } else if (is(action, Shuffle)) {
    info(`${this.name} requested a random download...`);
    const all = aggregate<TrackDetails>(action.shuffle).pages;
    const shuffled = shuffle(all.flatMap((x) => x.items)).slice(0, 10);
    report(yield* this.reply(shuffled), "Random");
  } else if (is(action, Album)) {
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
          markup: pager(id, page, buttons, progress >= 1),
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
});

invite((chat, title) => {
  info("invite", chat, title);
});

mention((chat) => {
  info("mention", chat);
});
