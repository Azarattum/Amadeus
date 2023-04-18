import { wss, arg, async, usage, bright, reset } from "@amadeus-music/core";
import { command, hash, init, ok, persistence, users, wrn } from "./plugin";
import { applyWSSHandler } from "@trpc/server/adapters/ws";
import { createContext } from "./context";
import { app } from "./routes";

init(() => {
  applyWSSHandler({ wss: wss("/trpc"), router: app, createContext });
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
