import {
  defaulted,
  register,
  string,
  object,
  array,
} from "@amadeus-music/core";
import { name, version } from "./package.json";

export const {
  ok,
  wrn,
  init,
  pool,
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
    vk: defaulted(object({ tokens: defaulted(array(string()), []) }), {}),
  },
});
