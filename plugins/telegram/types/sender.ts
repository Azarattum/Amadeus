import {
  intersection,
  optional,
  number,
  string,
  type,
} from "@amadeus-music/core";

const From = type({
  message_id: optional(number()),
  from: type({
    id: number(),
    username: optional(string()),
  }),
});

const Chat = type({
  message_id: optional(number()),
  chat: type({
    id: number(),
    type: string(),
  }),
});

const Sender = type({
  message: optional(intersection([From, Chat])),
  my_chat_member: optional(intersection([From, Chat])),
  callback_query: optional(intersection([From, type({ message: Chat })])),
  channel_post: optional(Chat),
});

export { Sender };
