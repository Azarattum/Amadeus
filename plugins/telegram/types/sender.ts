import {
  intersection,
  optional,
  number,
  string,
  type,
} from "@amadeus-music/core";

const from = type({
  message_id: optional(number()),
  from: type({
    id: number(),
    username: optional(string()),
  }),
});

const chat = type({
  message_id: optional(number()),
  chat: type({
    id: number(),
    type: string(),
  }),
});

const sender = type({
  message: optional(intersection([from, chat])),
  my_chat_member: optional(intersection([from, chat])),
  callback_query: optional(intersection([from, type({ message: chat })])),
  channel_post: optional(chat),
});

export { sender };
