import { defaulted, register, string, object } from "@amadeus-music/core";
import { version, name } from "./package.json";

export const {
  transcribe,
  recognize,
  desource,
  command,
  connect,
  search,
  relate,
  expand,
  lookup,
  fetch,
  info,
  init,
  pool,
  err,
  wrn,
} = register({
  config: {
    yandex: defaulted(object({ token: defaulted(string(), "") }), {}),
  },
  version,
  name,
});
