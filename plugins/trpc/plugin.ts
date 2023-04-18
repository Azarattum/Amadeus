import { defaulted, string, register, Page } from "@amadeus-music/core";
import { name, version } from "./package.json";

export const {
  ok,
  wrn,
  info,
  init,
  stop,
  search,
  users,
  command,
  persistence,
} = register({
  name,
  version,
  settings: { password: defaulted(string(), "") },
});

export const loaders = new Map<number, () => void>();
export const hash = (text: string) =>
  crypto.subtle
    .digest("SHA-1", new TextEncoder().encode(text))
    .then((x) => Array.from(new Uint8Array(x)))
    .then((x) => x.map((y) => y.toString(16).padStart(2, "0")).join(""));
