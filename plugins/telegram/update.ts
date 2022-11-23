import {
  wrn,
  message,
  command,
  voice,
  post,
  mention,
  callback,
  invite,
  state,
} from "./plugin";
import { Text, Audio, Voice, Post, Callback, Invite, Sender } from "./types";
import { fallback, pipe, take } from "@amadeus-music/core";
import { IncomingMessage, ServerResponse } from "http";

const secret = crypto.randomUUID();

function update(req: IncomingMessage, res: ServerResponse) {
  if (req.url !== "/telegram") return;
  const token = req.headers["x-telegram-bot-api-secret-token"];
  if (token !== secret) {
    wrn(
      "A suspicious webhook request " +
        `has been intercepted with secret "${token}"!`
    );
    res.statusCode = 403;
    res.end();
    return;
  }

  let body = "";
  req.on("readable", () => (body += req.read() || ""));
  req.on("end", () => {
    pipe(body)(
      JSON.parse,
      // (x) => (info("Update:", pretty(x)), x), // For debugging
      verify,
      handle,
      fallback((e) => wrn(e?.message || e))
    );
    res.statusCode = 200;
    res.end();
  });
}

function verify(update: unknown) {
  const sender = Sender.create(update);
  const from =
    sender.callback_query?.from ||
    sender.my_chat_member?.from ||
    sender.message?.from;

  if (Post.is(update)) {
    /// TODO: Verify channel posts
    //    Look for channel id in user's playlists
    return update;
  }

  if (!from) throw new Error("The update does not have a sender!");
  if (!Object.values(state.users).includes(from.id)) {
    throw new Error(`Unauthorized access from @${from.username} (${from.id})!`);
  }

  return update;
}

function handle(update: unknown) {
  if (Voice.is(update)) take(voice(update.message.voice.file_id));
  if (Text.is(update)) {
    const { text, reply_to_message } = update.message;
    if (!text.startsWith("/")) take(message(text));
    else take(command(text.slice(1), reply_to_message?.message_id));
  }
  if (Audio.is(update)) {
    const { performer, title } = update.message.audio;
    const text = [performer, title].filter((x) => x).join(" - ");
    if (text) take(message(text));
  }
  if (Post.is(update)) {
    const { chat, audio, text } = update.channel_post;
    if (text?.includes(`@${state.me.username}`)) take(mention(chat.id));
    if (audio) take(post(audio.file_id, chat.id));
  }
  if (Callback.is(update)) {
    const { data, from, message } = update.callback_query;
    take(callback(data, message.message_id, from.id));
  }
  if (Invite.is(update)) {
    const { chat } = update.my_chat_member;
    take(invite(chat.id, chat.title));
  }
}

export { update, secret };
