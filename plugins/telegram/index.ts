import { deleteMessage, setMyCommands, setWebhook, getMe } from "./api/methods";
import { persistence, users, init, stop, info, temp, cli } from "./plugin";
import { bright, reset } from "@amadeus-music/util/color";
import { async, http, arg } from "@amadeus-music/core";
import { handleChanges } from "./handlers/database";
import { delay } from "@amadeus-music/util/async";
import { request, secret } from "./api/update";
import { icon } from "./api/markup";

init(function* ({ telegram: { webhook, token } }) {
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

  for (const user of Object.keys(yield* async(users()))) {
    yield* persistence(user).subscribe(["library"], handleChanges(user));
  }
});

stop(function* () {
  const promises = [...temp.entries()]
    .flatMap(([chat, set]) => [...set].map((x) => [chat, x]))
    .map(([chat, message]) => deleteMessage(chat, message));
  yield* async(Promise.allSettled(promises));
  temp.clear();
  http(false).off("request", request);
});

cli("register", [arg.text])(function* (user) {
  user = user?.toLowerCase() || "";
  yield* async(delay(5));
  if (!(yield* async(users()))[user]) return;
  yield* persistence(user).subscribe(["library"], handleChanges(user));
});

const commands = [
  {
    description: `${icon.cancel} Stop pending uploads`,
    command: "cancel",
  },
  {
    description: `${icon.history} Show search history`,
    command: "history",
  },
];

import.meta.glob("./handlers/*", { eager: true });
