import { string, defaulted, object, register } from "@amadeus-music/core";
import { name, version } from "./package.json";

export const {
  info,
  err,
  wrn,
  init,
  pool,
  fetch,
  search,
  relate,
  expand,
  command,
  connect,
  desource,
  recognize,
  transcribe,
} = register({
  name,
  version,
  config: {
    vk: defaulted(object({ token: defaulted(string(), "") }), {}),
  },
});
