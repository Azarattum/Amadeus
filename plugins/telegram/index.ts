import { bright, reset } from "@amadeus-music/util/color";
import { init, stop, info, fetch } from "./plugin";
import { secret, request } from "./api/update";
import { http } from "@amadeus-music/core";
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

import.meta.glob("./handlers/*", { eager: true });
