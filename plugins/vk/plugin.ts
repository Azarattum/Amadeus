import {
  defaulted,
  register,
  string,
  object,
  array,
} from "@amadeus-music/core";
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
    vk: defaulted(object({ tokens: defaulted(array(string()), []) }), {}),
  },
  version,
  name,
});
