import { Infer, map } from "@amadeus-music/core";
import { fetch, pool } from "../plugin";
import { Sent } from "../types/core";

type Replier = (message: Message) => Infer<typeof Sent>["result"];
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
  }).as(Sent)).result;
}

function replier(chat: number, group = true) {
  const target = pool<Replier>(`upload/${chat}`, {
    rate: group ? 20 : 60,
    concurrency: 3,
  });
  if (!target.status().listeners.size) target(reply.bind(null, chat));

  return function* (message: Message) {
    const [result] = yield* map(target(message), function* (x) {
      return x;
    });
    return result;
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
