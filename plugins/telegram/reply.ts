import { Infer, map } from "@amadeus-music/core";
import { fetch, pool } from "./plugin";
import { Sent } from "./types";

type Replier = (message: Message) => Infer<typeof Sent>["result"];
type Reply = ReturnType<typeof replier>;
type Edit = ReturnType<typeof editor>;
interface Message {
  text?: string;
  markup?: string;
  audio?: string;
  mode?: string;
}

function paramify(params: Message) {
  return {
    ...(params.text ? { text: params.text } : {}),
    ...(params.audio ? { audio: params.audio } : {}),
    ...(params.mode ? { parse_mode: params.mode } : {}),
    ...(params.markup ? { reply_markup: params.markup } : {}),
  };
}

function* reply(chat: number, params: Message) {
  if (params.audio) {
    /// Do audio stuff
  } else if (params.text) {
    yield (yield* fetch("sendMessage", {
      params: {
        chat_id: chat.toString(),
        ...paramify(params),
      },
    }).as(Sent)).result;
  }
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

function* edit<T>(
  chat: number,
  message: number,
  aggregator: AsyncGenerator<T>,
  convert: (item: T) => Message
) {
  yield* map(aggregator, function* (item) {
    yield* fetch("editMessageText", {
      params: {
        chat_id: chat.toString(),
        message_id: message.toString(),
        ...paramify(convert(item)),
      },
    }).flush();
  });
}

function editor(chat: number) {
  return function* <T>(
    message: number,
    aggregator: AsyncGenerator<T>,
    convert: (item: T) => Message
  ) {
    yield* edit(chat, message, aggregator, convert);
  };
}

export { replier, editor, type Reply, type Edit };