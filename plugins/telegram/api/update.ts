import {
  wrn,
  users,
  message,
  command,
  voice,
  post,
  mention,
  callback,
  invite,
  update,
  fetch,
} from "../plugin";
import { async, map, take } from "@amadeus-music/core";
import { IncomingMessage, ServerResponse } from "http";
import { replier, editor } from "./reply";
import { sender } from "../types/sender";
import * as type from "../types/core";

const secret = crypto.randomUUID();

function request(req: IncomingMessage, res: ServerResponse) {
  if (req.url !== "/telegram") return;
  const token = req.headers["x-telegram-bot-api-secret-token"];
  if (token !== secret) {
    wrn(`An invalid webhook request with secret "${token}"!`);
    return res.writeHead(403).end();
  }

  let body = "";
  req.on("readable", () => (body += req.read() || ""));
  req.on("end", () => {
    take(update(body));
    res.writeHead(200).end();
  });
}

update(function* (body) {
  const data = JSON.parse(body);
  update.context(yield* verify(data));
  yield* map(handle.bind(this)(data));
});

function* verify(update: unknown) {
  const data = sender.create(update);
  const from =
    data.callback_query?.from ||
    data.my_chat_member?.from ||
    data.message?.from;
  const chat =
    data.callback_query?.message.chat ||
    data.channel_post?.chat ||
    data.message?.chat ||
    data.my_chat_member?.chat;
  const message = data.message?.message_id || data.channel_post?.message_id;
  if (!chat) throw "Failed to get a chat from update!";

  if (type.post.is(update)) {
    /// TODO: Verify channel posts
    //    Look for channel id in user's playlists
    return { chat: chat.id };
  }

  if (!from) throw "The update does not have a sender!";

  const user = Object.entries(yield* async(users())).find(
    (x) => x[1].telegram === from.id
  );
  if (!user) throw `Unauthorized access from @${from.username} (${from.id})!`;

  if (message) {
    fetch("deleteMessage", {
      params: {
        chat_id: chat?.id.toString(),
        message_id: message.toString(),
      },
    })
      .request.text()
      .catch(() => {});
  }

  return {
    chat: chat.id,
    user: user[0],
    name: user[1].name,
    edit: editor(chat.id),
    reply: replier(chat.id, user[1].name, chat.type !== "private"),
  };
}

async function* handle(
  this: { state: { me: { username: string } } },
  update: unknown
) {
  if (type.voice.is(update)) yield* voice(update.message.voice.file_id);
  if (type.text.is(update)) {
    const { text, reply_to_message } = update.message;
    if (!text.startsWith("/")) yield* message(text);
    else yield* command(text.slice(1), reply_to_message?.message_id);
  }
  if (type.audio.is(update)) {
    const { performer, title } = update.message.audio;
    const text = [performer, title].filter((x) => x).join(" - ");
    if (text) yield* message(text);
  }
  if (type.post.is(update)) {
    const { chat, audio, text } = update.channel_post;
    if (text?.includes(`@${this.state.me.username}`)) yield* mention(chat.id);
    if (audio) yield* post(audio.file_id, chat.id);
  }
  if (type.callback.is(update)) {
    const { data, from, message } = update.callback_query;
    const action = JSON.parse(data);
    yield* callback(action, message.message_id, from.id);
  }
  if (type.invite.is(update)) {
    const { chat } = update.my_chat_member;
    yield* invite(chat.id, chat.title);
  }
}

export { request, secret };
