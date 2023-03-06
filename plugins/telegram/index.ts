import { deleteMessage, getMe, setMyCommands, setWebhook } from "./api/methods";
import { bright, reset } from "@amadeus-music/util/color";
import { async, http } from "@amadeus-music/core";
import { init, stop, info, temp } from "./plugin";
import { secret, request } from "./api/update";
import { icon } from "./api/markup";

init(function* ({ telegram: { token, webhook } }) {
  if (!token) throw "Please set a bot token!";
  this.fetch.baseURL = `https://api.telegram.org/bot${token}/`;
  if (!webhook) throw "Please set a webhook URL!";
  const url = new URL("/telegram", webhook);
  info("Setting up a webhook...");
  yield* setWebhook(url, secret);
  info("Adjusting bot settings...");
  yield* setMyCommands(commands);

  this.state.me = (yield* getMe()).result;
  info(`Logged in as ${bright}@${this.state.me.username}${reset}!`);

  http().on("request", request);
});

stop(function* () {
  const promises = [...temp.entries()]
    .flatMap(([chat, set]) => [...set].map((x) => [chat, x]))
    .map(([chat, message]) => deleteMessage(chat, message));
  yield* async(Promise.allSettled(promises));
  temp.clear();
  http(false).off("request", request);
});

const commands = [
  {
    command: "cancel",
    description: `${icon.cancel} Stop pending uploads`,
  },
  {
    command: "history",
    description: `${icon.history} Show search history`,
  },
];

import.meta.glob("./handlers/*", { eager: true });
