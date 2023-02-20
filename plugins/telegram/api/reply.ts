import type { TrackDetails, TrackInfo } from "@amadeus-music/protocol";
import { async, first, map, take } from "@amadeus-music/core";
import { bright, reset } from "@amadeus-music/util/color";
import { desource, fetch, info, pool } from "../plugin";
import { details, markdown } from "./markup";
import { Sent } from "../types/core";

type Replier = (message: Message) => number;
type Reply = ReturnType<typeof replier>;
type Edit = ReturnType<typeof editor>;
interface Message {
  text?: string;
  mode?: string;
  markup?: string;
  photo?: string;
  caption?: string;
  audio?: { url: string; performer?: string; title?: string; thumb?: string };
}

function paramify(params: Message) {
  return {
    ...(params.caption ? { caption: params.caption } : {}),
    ...(params.text && !params.photo ? { text: params.text } : {}),
    ...(params.mode ? { parse_mode: params.mode } : {}),
    ...(params.markup ? { reply_markup: params.markup } : {}),
    ...(params.audio?.url ? { audio: params.audio.url } : {}),
    ...(params.audio?.title ? { title: params.audio.title } : {}),
    ...(params.audio?.thumb ? { title: params.audio.thumb } : {}),
    ...(params.audio?.performer ? { performer: params.audio.performer } : {}),
    ...(params.text && params.photo ? { caption: params.text } : {}),
    ...(params.photo ? { photo: params.photo } : {}),
  };
}

function* reply(chat: number, params: Message) {
  const method = params.audio
    ? "sendAudio"
    : params.photo
    ? "sendPhoto"
    : "sendMessage";
  yield (yield* fetch(method, {
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
    return yield* map(target(message), function* (x) {
      return x;
    });
  };
}

function* edit(chat: number, message: number, params: Message) {
  yield* fetch("editMessageText", {
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
