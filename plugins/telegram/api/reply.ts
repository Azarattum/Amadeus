import { async, first, map, take } from "@amadeus-music/core";
import { bright, reset } from "@amadeus-music/util/color";
import type { TrackInfo } from "@amadeus-music/protocol";
import { desource, fetch, info, pool } from "../plugin";
import { Sent } from "../types/core";

type Replier = (message: Message) => number;
type Reply = ReturnType<typeof replier>;
type Edit = ReturnType<typeof editor>;
interface Message {
  text?: string;
  mode?: string;
  markup?: string;
  audio?: { url: string; performer?: string; title?: string; thumb?: string };
}

function paramify(params: Message) {
  return {
    ...(params.text ? { text: params.text } : {}),
    ...(params.mode ? { parse_mode: params.mode } : {}),
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

  return function* (message: Message | TrackInfo[]) {
    if (Array.isArray(message)) {
      const promises: Promise<any>[] = [];
      for (const { album, artists, title, source } of message) {
        const url = yield* async(first(desource(source)));
        const performer = artists.map((x: any) => x.title).join(", ");
        const song = `${performer} - ${title}`;
        info(`Sending "${song}" to ${bright}${name}${reset}...`);
        promises.push(
          take(
            target({
              audio: { url, performer, title: title, thumb: album.art },
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
