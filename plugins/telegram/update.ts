import {
  wrn,
  message,
  command,
  voice,
  post,
  mention,
  callback,
  invite,
  update,
} from "./plugin";
import { Text, Audio, Voice, Post, Callback, Invite, Sender } from "./types";
import { map, take, fetch } from "@amadeus-music/core";
import { IncomingMessage, ServerResponse } from "http";

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
  update.context(yield* verify.bind(this)(data));
  yield* map(handle.bind(this)(data));
});

function* verify(update: unknown) {
  const sender = Sender.create(update);
  const from =
    sender.callback_query?.from ||
    sender.my_chat_member?.from ||
    sender.message?.from;
  const chat =
    sender.callback_query?.message.chat.id ||
    sender.channel_post?.chat.id ||
    sender.message?.chat.id ||
    sender.my_chat_member?.chat.id;
  const message = sender.message?.message_id || sender.channel_post?.message_id;

  if (Post.is(update)) {
    /// TODO: Verify channel posts
    //    Look for channel id in user's playlists
    return { chat: chat?.toString() };
  }

  if (!from) throw "The update does not have a sender!";
  const entry = Object.entries(this.state.users).find((x) => x[1] === from.id);
  if (!entry) throw `Unauthorized access from @${from.username} (${from.id})!`;

  if (message && chat) {
    fetch("deleteMessage", {
      params: {
        chat_id: chat?.toString(),
        message_id: message.toString(),
      },
    }).flush();
  }

  return { chat: chat?.toString(), name: entry[0] };
}

async function* handle(update: unknown) {
  if (Voice.is(update)) yield* voice(update.message.voice.file_id);
  if (Text.is(update)) {
    const { text, reply_to_message } = update.message;
    if (!text.startsWith("/")) yield* message(text);
    else yield* command(text.slice(1), reply_to_message?.message_id);
  }
  if (Audio.is(update)) {
    const { performer, title } = update.message.audio;
    const text = [performer, title].filter((x) => x).join(" - ");
    if (text) yield* message(text);
  }
  if (Post.is(update)) {
    const { chat, audio, text } = update.channel_post;
    if (text?.includes(`@${this.state.me.username}`)) yield* mention(chat.id);
    if (audio) yield* post(audio.file_id, chat.id);
  }
  if (Callback.is(update)) {
    const { data, from, message } = update.callback_query;
    const action = JSON.parse(data);
    yield* callback(action, message.message_id, from.id);
  }
  if (Invite.is(update)) {
    const { chat } = update.my_chat_member;
    yield* invite(chat.id, chat.title);
  }
}

export { request, secret };
