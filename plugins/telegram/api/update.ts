import {
  wrn,
  users,
  message,
  command,
  voice,
  post,
  mention,
  callback,
  fetch,
  invite,
  update,
  temp,
  persistence,
} from "../plugin";
import { async, inferArtists, map } from "@amadeus-music/core";
import { answerCallbackQuery, deleteMessage } from "./methods";
import { bright, reset } from "@amadeus-music/util/color";
import { IncomingMessage, ServerResponse } from "http";
import { pick } from "@amadeus-music/util/object";
import { replier, editor } from "./reply";
import { sender } from "../types/sender";
import * as type from "../types/core";

const secret = crypto.randomUUID();

update(function* (body) {
  const data = JSON.parse(body);
  const me = this.state.me.username;
  update.context(yield* verify(data, me));
  yield* map(handle(data, me, pick(this.fetch.baseURL)));
});

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
    update(body).then();
    res.writeHead(200).end();
  });
}

function* verify(update: unknown, me: string) {
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
  let message = data.message?.message_id || data.channel_post?.message_id;
  if (!chat) throw "Failed to get a chat from update!";

  const all = yield* async(users());
  let user: [string, { name: string }] | undefined;
  if (type.post.is(data)) {
    const candidates = yield* async(
      Promise.all(
        Object.entries(all).map((user) =>
          persistence(user[0])
            .settings.lookup(chat.id)
            .then(
              () => user,
              () => undefined
            )
        )
      ).then((x) => x.filter((x) => x))
    );
    user = candidates[0]; /// TODO: consider multi-user events support
    if (!user) throw `Unauthorized post to "${chat.title}" (${chat.id})!`;
    if (!data.channel_post.audio && !data.channel_post.text?.includes(me)) {
      message = undefined;
    }
  } else {
    if (!from) throw "The update does not have a sender!";
    user = Object.entries(all).find((x) => x[1].telegram === from.id);
    if (!user) throw `Unauthorized access from @${from.username} (${from.id})!`;
  }

  if (!temp.has(chat.id)) temp.set(chat.id, new Set());
  if (message) temp.get(chat.id)?.add(message);
  temp.get(chat.id)?.forEach((x) => deleteMessage(chat?.id, x).catch(() => {}));
  temp.get(chat.id)?.clear();
  return {
    chat: chat.id,
    user: user[0],
    name: `${bright}${user[1].name}${reset}`,
    edit: editor(chat.id),
    reply: replier(chat.id, user[1].name, chat.type !== "private"),
  };
}

async function* handle(update: unknown, me: string, url?: string) {
  if (type.voice.is(update) && url) {
    const id = update.message.voice.file_id;
    const { data } = await fetch("getFile", {
      params: { file_id: id },
    }).request.json();
    if (!type.responseOf(type.file).is(data)) {
      throw "Unable to get voice file data!";
    }
    yield* voice(
      new URL(
        data.result.file_path,
        url.replace("/bot", "/file/bot")
      ).toString()
    );
  }
  if (type.text.is(update)) {
    const { text, reply_to_message } = update.message;
    if (!text.startsWith("/")) yield* message(text);
    else yield* command(text.slice(1), reply_to_message?.message_id);
  }
  if (type.audio.is(update)) {
    const { performer, title } = update.message.audio;
    yield* message({
      artists: inferArtists(performer).map((x) => ({ title: x })),
      title,
    });
  }
  if (type.post.is(update)) {
    const { chat, audio, text } = update.channel_post;
    if (text?.includes(`@${me}`)) yield* mention(chat.id);
    if (audio) {
      const meta = {
        artists: inferArtists(audio.performer).map((x) => ({ title: x })),
        title: audio.title,
      };
      yield* post(meta, chat.id);
    }
  }
  if (type.callback.is(update)) {
    const { id, data, from, message } = update.callback_query;
    const action = JSON.parse(data);
    yield* callback(action, message.message_id, from.id);
    answerCallbackQuery(id);
  }
  if (type.invite.is(update)) {
    const { chat } = update.my_chat_member;
    yield* invite(chat.id, chat.title);
  }
}

export { request, secret };
