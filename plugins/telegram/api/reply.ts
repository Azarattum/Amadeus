import { async, first, map, take } from "@amadeus-music/core";
import type { TrackDetails } from "@amadeus-music/protocol";
import { bright, reset } from "@amadeus-music/util/color";
import { desource, fetch, info, pool } from "../plugin";
import { pretty } from "@amadeus-music/util/object";
import { details, markdown } from "./markup";
import { Sent } from "../types/core";

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

function* reply(chat: number, params: Message) {
  yield (yield* fetch(params.audio ? "sendAudio" : "sendMessage", {
    params: {
      chat_id: chat.toString(),
      ...paramify(params),
    },
  }).as(Sent)).result.message_id;
}

function replier(name: string, chat: number, group = true) {
  const target = pool<Replier>(`upload/${chat}`, {
    rate: group ? 20 : 60,
    concurrency: 3,
  });
  if (!target.status().listeners.size) target(reply.bind(null, chat));

  return function* (message: Message | TrackDetails[]) {
    if (Array.isArray(message)) {
      const promises: Promise<any>[] = [];
      for (const { id, album, artists, title, source } of message) {
        const url = yield* async(first(desource("track", source)));
        const performer = artists.map((x: any) => x.title).join(", ");
        const song = `${performer} - ${title}`;
        info(`Sending "${song}" to ${bright}${name}${reset}...`);
        promises.push(
          take(
            target({
              audio: { url, performer, title: title, thumb: album.art },
              markup: details(id),
              mode: markdown(),
            })
          )
        );
      }
      return yield* async(
        Promise.allSettled(promises).then((x) =>
          x.map((x) => (x.status === "rejected" ? 0 : +x.value))
        )
      );
    }
    const ids = yield* map(target(message), function* (x) {
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

export { replier, editor, paramify, type Reply, type Edit };
