import { aggregate, desource, fetch, info, persistence, pool } from "../plugin";
import type { TrackDetails, TrackInfo } from "@amadeus-music/protocol";
import { async, first, map, Pool, take } from "@amadeus-music/core";
import { menu, markdown, icon, escape, pager } from "./markup";
import { bright, reset } from "@amadeus-music/util/color";
import { pretty } from "@amadeus-music/util/object";
import { format } from "@amadeus-music/protocol";
import { sent } from "../types/core";

type Queue = (tracks: TrackDetails[]) => number;
type Replier = (message: Message) => number;
type Reply = ReturnType<typeof replier>;
type Edit = ReturnType<typeof editor>;
interface Message {
  text?: string;
  mode?: string;
  markup?: string;
  caption?: string;
  audio?: { url: string; performer?: string; title?: string; thumb?: string };
}

function paramify(params: Message) {
  return {
    ...(params.text ? { text: params.text } : {}),
    ...(params.mode ? { parse_mode: params.mode } : {}),
    ...(params.caption ? { caption: params.caption } : {}),
    ...(params.markup ? { reply_markup: params.markup } : {}),
    ...(params.audio?.url ? { audio: params.audio.url } : {}),
    ...(params.audio?.title ? { title: params.audio.title } : {}),
    ...(params.audio?.thumb ? { title: params.audio.thumb } : {}),
    ...(params.audio?.performer ? { performer: params.audio.performer } : {}),
  };
}

function* queue(
  pool: Pool<Replier, any>,
  name: string,
  tracks: TrackDetails[]
) {
  const promises: Promise<any>[] = [];
  for (const track of tracks) {
    const url = yield* async(first(desource("track", track.source)));
    info(`Sending "${format(track)}" to ${bright}${name}${reset}...`);
    promises.push(
      take(
        pool({
          audio: {
            url,
            title: track.title,
            thumb: track.album.art,
            performer: track.artists.map((x: any) => x.title).join(", "),
          },
          markup: menu(track.id),
          mode: markdown(),
        })
      )
    );
  }
  yield* yield* async(
    Promise.allSettled(promises).then((x) =>
      x.map((x) => (x.status === "rejected" ? 0 : +x.value))
    )
  );
}

function* reply(chat: number, params: Message) {
  yield (yield* fetch(params.audio ? "sendAudio" : "sendMessage", {
    params: {
      chat_id: chat.toString(),
      ...paramify(params),
    },
  }).as(sent)).result.message_id;
}

function replier(chat: number, name: string, group = true) {
  const target = pool<Replier>(`upload/${chat}`, {
    rate: group ? 20 : 60,
    concurrency: 3,
  });
  if (!target.status().listeners.size) target(reply.bind(null, chat));

  return function* (message: Message | TrackDetails[]) {
    let ids: number[] = [];
    if (Array.isArray(message)) {
      const send = pool<Queue>(`queue/${chat}`, { concurrency: 1 });
      if (!send.status().listeners.size) send(queue.bind(null, target, name));
      return yield* map(send(message), function* (x) {
        return x;
      });
    }

    ids = yield* map(target(message), function* (x) {
      return x;
    });
    if (!ids.length) {
      throw new Error(`Failed to send message: ${pretty(message)}`);
    }
    return ids;
  };
}

function* edit(chat: number, message: number, params: Message) {
  yield* fetch("editMessageCaption", {
    params: {
      chat_id: chat.toString(),
      message_id: message.toString(),
      ...paramify(params),
    },
  }).flush();
}

function editor(chat: number) {
  return function* (message: number, params: Message) {
    yield* edit(chat, message, params);
  };
}

function paginate<T extends (..._: any) => TrackInfo>(
  from: [Pool<T, any>, Parameters<Extract<T, (..._: any) => TrackInfo>>],
  options: {
    icon: string;
    chat: number;
    header: string;
    track?: number;
    message: number;
    compare?: (a: TrackInfo, b: TrackInfo) => number;
  }
) {
  const target = {
    chat_id: options.chat.toString(),
    message_id: options.message.toString(),
  };

  const cache = persistence();
  const id = aggregate(...from, {
    async update(tracks, progress, page) {
      await cache.push(tracks);
      const buttons = tracks.map((x) => ({
        text: format(x),
        callback: { download: x.id },
      }));

      const data = options.track ? "caption" : "text";
      const loaded = Math.round(progress * 100);
      const title = escape(options.header);
      const state = `${loaded}% ${icon.load} *${title}*`;
      const header = progress < 1 ? state : `${options.icon} *${title}*`;
      const completed = progress >= 1 && tracks.length >= this.page;

      fetch(options.track ? "editMessageCaption" : "editMessageText", {
        params: {
          ...target,
          ...paramify({
            mode: markdown(),
            markup: pager(id, page, buttons, completed),
            [data]: header,
          }),
        },
      });
    },
    invalidate() {
      fetch(options.track ? "editMessageCaption" : "deleteMessage", {
        params: {
          ...target,
          ...(options.track
            ? paramify({ mode: markdown(), markup: menu(options.track) })
            : {}),
        },
      }).flush();
    },
    compare: options.compare,
    page: 8,
  });
}

export type { Reply, Edit, Message };
export { replier, editor, paramify, paginate };
