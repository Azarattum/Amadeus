import { deleteMessage, getMe, setMyCommands, setWebhook } from "./api/methods";
import { init, stop, info, temp, persistence, users, changed } from "./plugin";
import { bright, reset } from "@amadeus-music/util/color";
import { parseChanges } from "./handlers/database";
import { async, http } from "@amadeus-music/core";
import { secret, request } from "./api/update";
import { editor, replier } from "./api/reply";
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

  // Listen to the database changes for each user
  for (const [user, { name }] of Object.entries(yield* async(users()))) {
    const storage = persistence(user);
    yield* storage.subscribe(["library", "feed"], (changes: any[]) =>
      parseChanges(changes).forEach(([entries, type], playlist) => {
        storage.settings.extract(playlist.toString()).then(
          (chat) => {
            changed.context({
              chat,
              user,
              reply: replier(chat, name, true),
              name: `${bright}${name}${reset}`,
              edit: editor(chat),
            });
            changed(type, [...entries]).then();
          },
          () => {}
        );
      })
    );
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
