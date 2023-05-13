import {
  persistence,
  command,
  context,
  users,
  hash,
  init,
  ok,
  wrn,
} from "./plugin";
import { wss, arg, async, usage, bright, reset } from "@amadeus-music/core";
import { applyWSSHandler } from "@trpc/server/adapters/ws";
import { app } from "./routes";

init(function* () {
  yield* async(new Promise((r) => setTimeout(r, 100)));
  applyWSSHandler({ wss: wss("/trpc"), router: app, createContext: context });
});

command(
  "password",
  arg.user,
  arg.text
)(function* (user, password) {
  const all = yield* async(users());
  if (!user || !password) return usage("password");
  if (!Object.keys(all).includes(user)) return wrn(`No such user "${user}"!`);
  const token = yield* async(hash(password).then(hash));
  yield* persistence(user).settings.store("password", token, "settings");
  ok(`New password for ${bright}${user}${reset} has been set!`);
});
