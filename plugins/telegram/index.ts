import {
  init,
  stop,
  info,
  fetch,
  message,
  command,
  mention,
  voice,
  post,
  invite,
  callback,
  search,
} from "./plugin";
import { aggregate, aggregator, http, is, match } from "@amadeus-music/core";
import { bright, reset } from "@amadeus-music/util/color";
import { Close, Next, Prev } from "./types/action";
import { escape, markdown, pager } from "./markup";
import { secret, request } from "./update";
import { paramify } from "./reply";
import { Me } from "./types/core";

init(function* (config) {
  const { token, webhook } = config.telegram;
  if (!token) throw "Please set a bot token!";
  this.fetch.baseURL = `https://api.telegram.org/bot${token}/`;
  this.state.users = Object.fromEntries(
    Object.entries(config.users)
      .filter((x) => x[1].telegram !== -1)
      .map(([name, user]) => [name, user.telegram])
  );

  if (!webhook) throw "Please set a webhook URL!";
  const url = new URL("/telegram", webhook);
  info("Setting up a webhook...");
  yield* fetch("setWebhook", {
    params: { url: url.toString(), secret_token: secret },
  }).json();

  this.state.me = (yield* fetch("getMe").as(Me)).result;
  info(`Logged in as ${bright}@${this.state.me.username}${reset}!`);

  http().on("request", request);
});

stop(() => {
  http(false).off("request", request);
});

message(function* (text) {
  info(`${this.name} is searching for "${text}"...`);
  const chat = this.chat;

  const { message_id: message } = yield* this.reply({ text: "⏳" });
  const id = aggregate(search, ["track", text] as const)({
    update(tracks, progress, page) {
      const buttons = tracks.map((x) => ({
        text: `${x.artists.join(", ")} - ${x.title}`,
        callback: { download: x.id },
      }));

      const params = {
        mode: markdown(),
        text:
          progress < 1
            ? `${Math.round(progress * 100)}% ⏳ ${escape(text)}`
            : `🔎 *${escape(text)}*`,
        markup: pager(id, page, buttons),
      };

      fetch("editMessageText", {
        params: {
          chat_id: chat.toString(),
          message_id: message.toString(),
          ...paramify(params),
        },
      });
    },
    invalidate() {
      fetch("deleteMessage", {
        params: {
          message_id: message.toString(),
          chat_id: chat.toString(),
        },
      }).flush();
    },
    compare: match(text),
    page: 8,
  });
});

command(function* (command) {
  if (command === "start") {
    yield* this.reply({ text: "👋" });
    /// Add to temp messages
  }
});

mention((chat) => {
  info("mention", chat);
});

voice((file) => {
  info("voice", file);
});

post((file, chat) => {
  info("post", file, chat);
});

invite((chat, title) => {
  info("invite", chat, title);
});

callback(function* (action, message, chat) {
  if (is(action, Next)) aggregator(action.next).next();
  if (is(action, Prev)) aggregator(action.prev).prev();
  if (is(action, Close)) aggregator(action.close).close();

  // else if (Download.is(action)) {
  /// Fetch from db
  // info(`Sourcing ${request} for ${this.name}...`);
  // const { url } = yield* async(first(desource(action.download)));
  // info(url);
  // yield* fetch("sendAudio", {
  //   params: {
  //     chat_id: this.chat,
  //     audio: url,
  //     performer: "test",
  //     title: "hello",
  //   },
  // }).flush();
  // }
});
