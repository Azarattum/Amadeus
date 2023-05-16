import { string, defaulted, object, register } from "@amadeus-music/core";
import { name, version } from "./package.json";

export const {
  ok,
  wrn,
  init,
  fetch,
  search,
  relate,
  expand,
  lookup,
  desource,
  transcribe,
} = register({
  name,
  version,
  config: {
    vk: defaulted(object({ token: defaulted(string(), "") }), {}),
  },
});
