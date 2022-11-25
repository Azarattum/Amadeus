import {
  init,
  stop,
  wrn,
  info,
  message,
  command,
  mention,
  voice,
  post,
  invite,
  callback,
  search,
} from "./plugin";
import { async, http, take, fetch } from "@amadeus-music/core";
import { bright, reset } from "@amadeus-music/util/color";
import { plural } from "@amadeus-music/util/string";
import { secret, request } from "./update";
import { Me } from "./types";

init(function* (config) {
  const { token, webhook } = config.telegram;
  if (!token) throw "Please set a bot token!";
  this.fetch.baseURL = `https://api.telegram.org/bot${token}/`;
  this.state.users = Object.fromEntries(
    Object.entries(config.users).map(([name, user]) => [name, user.telegram])
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
  http().off("request", request);
});

message(function* (text) {
  info(`${this.name} is searching for "${text}"...`);

  const tracks = yield* async(take(search("track", text), 10));
  const { length } = tracks;
  if (!length) wrn(`No results found for "${text}"!`);
  else info(`Found ${length} ${plural("result", length)} for "${text}"!`);

  /// Make an actual response! (with pages, etc)
  yield* fetch("sendMessage", {
    params: {
      chat_id: this.chat,
      text: tracks
        .map((x) => `${x.artists.join(", ")} - ${x.title}`)
        .join("\n"),
    },
  }).flush();
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

callback((request, message, chat) => {
  info("callback", request, message, chat);
});
