import {
  intersection,
  optional,
  number,
  string,
  type,
} from "@amadeus-music/core";
import { chat } from "./core";

const fromUser = type({
  from: type({
    username: optional(string()),
    id: number(),
  }),
  message_id: optional(number()),
});

const fromChat = type({
  message_id: optional(number()),
  chat,
});

const sender = type({
  callback_query: optional(
    intersection([fromUser, type({ message: fromChat })]),
  ),
  my_chat_member: optional(intersection([fromUser, fromChat])),
  message: optional(intersection([fromUser, fromChat])),
  channel_post: optional(fromChat),
});

export { sender };
