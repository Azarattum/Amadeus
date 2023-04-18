import { defaulted, string, register } from "@amadeus-music/core";
import { name, version } from "./package.json";

export const { wrn, ok, info, init, stop, persistence, users, command } =
  register({
    name,
    version,
    settings: { password: defaulted(string(), "") },
  });

export const hash = (text: string) =>
  crypto.subtle
    .digest("SHA-1", new TextEncoder().encode(text))
    .then((x) => Array.from(new Uint8Array(x)))
    .then((x) => x.map((y) => y.toString(16).padStart(2, "0")).join(""));
