import {
  intersection,
  optional,
  number,
  string,
  type,
} from "@amadeus-music/core";
import { chat } from "./core";

const fromUser = type({
  message_id: optional(number()),
  from: type({
    id: number(),
    username: optional(string()),
  }),
});

const fromChat = type({
  message_id: optional(number()),
  chat,
});

const sender = type({
  message: optional(intersection([fromUser, fromChat])),
  my_chat_member: optional(intersection([fromUser, fromChat])),
  callback_query: optional(
    intersection([fromUser, type({ message: fromChat })])
  ),
  channel_post: optional(fromChat),
});

export { sender };
