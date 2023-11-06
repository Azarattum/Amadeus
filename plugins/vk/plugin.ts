import { defaulted, register, string, object } from "@amadeus-music/core";
import { version, name } from "./package.json";

export const {
  transcribe,
  desource,
  search,
  relate,
  expand,
  lookup,
  fetch,
  init,
  pool,
  wrn,
  ok,
} = register({
  config: {
    vk: defaulted(object({ token: defaulted(string(), "") }), {}),
  },
  version,
  name,
});
