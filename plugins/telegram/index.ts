import {
  init,
  stop,
  state,
  wrn,
  info,
  fetch,
  message,
  command,
  mention,
  voice,
  post,
  invite,
  callback,
} from "./plugin";
import { bright, reset } from "@amadeus-music/util/color";
import { http } from "@amadeus-music/core";
import { secret, update } from "./update";
import { Me } from "./types";

init(function* (config) {
  const { token, webhook } = config.telegram;
  if (!token) return wrn("Plugin disabled! No token found!");
  state.request.baseURL = `https://api.telegram.org/bot${token}/`;
  state.users = Object.fromEntries(
    Object.entries(config.users).map(([name, user]) => [name, user.telegram])
  );

  if (!webhook) return wrn("Plugin disabled! Please set a webhook URL!");
  const url = new URL("/telegram", webhook);
  info("Setting up a webhook...");
  yield* fetch("setWebhook", {
    params: { url: url.toString(), secret_token: secret },
  }).json();

  state.me = (yield* fetch("getMe").as(Me)).result;
  info(`Logged in as ${bright}@${state.me.username}${reset}!`);

  http().on("request", update);
});

stop(() => {
  Object.assign(state, { me: {}, users: {}, options: {} });
  http().off("request", update);
});

message((text) => {
  info("message", text);
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
