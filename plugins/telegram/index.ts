import {
  init,
  stop,
  info,
  message,
  command,
  mention,
  voice,
  post,
  invite,
  callback,
} from "./plugin";
import {
  http,
  fetch,
  map,
  tracks,
  cache,
  identify,
  invalidate,
} from "@amadeus-music/core";
import { Download, Invalidate, Me, Page, Sent } from "./types";
import { bright, reset } from "@amadeus-music/util/color";
import { escape, markdown, pager } from "./markup";
import { secret, request } from "./update";

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
  const aggregator = tracks(text, 9);
  const id = identify(text);
  const chat = this.chat;

  const {
    result: { message_id },
  } = yield* fetch("sendMessage", {
    params: {
      ...markdown(),
      chat_id: chat,
      text: "⏳",
    },
  }).as(Sent);

  cache(id, aggregator, {
    invalidator: () => {
      /// This breaks badly (because not in the pool!)
      fetch("deleteMessage", {
        params: {
          chat_id: chat,
          message_id: message_id.toString(),
        },
      }).flush();
    },
  });

  /// Make this somewhat independent (from the parent pool (consider))
  yield* map(aggregator, function* ({ page, at }) {
    const buttons = page.map((x) => ({
      text: `${x.artists.join(", ")} - ${x.title}`,
      callback: { download: x.id },
    }));

    yield* fetch("editMessageText", {
      params: {
        message_id: message_id.toString(),
        chat_id: chat,

        text: `🔎 *${escape(text)}*`,
        ...pager(id, at, buttons),
        ...markdown(),
      },
    }).text();
  });
  /// Invalidate when nothing
});

command((command) => {
  info("command", command);
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
  if (Page.is(action)) {
    const aggregator = cache(action.page) as { page: (number: number) => void };
    if (!aggregator) return; /// Handle gracefully
    aggregator.page(action.number);
  } else if (Invalidate.is(action)) {
    invalidate(action.invalidate);
  } else if (Download.is(action)) {
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
  }
});
