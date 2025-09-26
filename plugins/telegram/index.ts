import { deleteMessage, getMe, setMyCommands, setWebhook } from "./api/methods";
import { cli, init, stop, info, temp, users, persistence } from "./plugin";
import { bright, reset } from "@amadeus-music/util/color";
import { arg, async, http } from "@amadeus-music/core";
import { handleChanges } from "./handlers/database";
import { delay } from "@amadeus-music/util/async";
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
  try {
    http(false).off("request", request);
  } catch {}
});

cli("register", [arg.text])(function* (user) {
  user = user?.toLowerCase() || "";
  yield* async(delay(5));
  if (!(yield* async(users()))[user]) return;
  yield* persistence(user).subscribe(["library"], handleChanges(user));
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
