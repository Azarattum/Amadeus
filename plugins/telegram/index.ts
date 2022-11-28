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
  desource,
} from "./plugin";
import { async, http, take, fetch, first } from "@amadeus-music/core";
import { bright, reset } from "@amadeus-music/util/color";
import { keyboard, escape, markdown } from "./markup";
import { plural } from "@amadeus-music/util/string";
import { secret, request } from "./update";
import { Me } from "./types";

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
  http().off("request", request);
});

message(function* (text) {
  info(`${this.name} is searching for "${text}"...`);

  const tracks = yield* async(take(search("track", text), 10));
  const { length } = tracks;
  if (!length) wrn(`No results found for "${text}"!`);
  else info(`Found ${length} ${plural("result", length)} for "${text}"!`);

  const results = tracks.map((x) => `${x.artists.join(", ")} - ${x.title}`);
  const sources = tracks.map((x) => JSON.stringify(x.sources));

  /// Make an actual response! (with pages, etc)
  yield* fetch("sendMessage", {
    params: {
      ...markdown(),
      text: `🔎 *${escape(text)}*`,
      chat_id: this.chat,
      ...keyboard(results, sources),
    },
  }).text();
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

callback(function* (request, message, chat) {
  /// Handles more than source
  const sources = JSON.parse(request) as string[];
  info(`Sourcing ${request} for ${this.name}...`);
  const { url } = yield* async(first(desource(sources)));

  info(url);
  yield* fetch("sendAudio", {
    params: {
      chat_id: this.chat,
      audio: url,
      performer: "test",
      title: "hello",
    },
  }).flush();
});
