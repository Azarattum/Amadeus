import {
  defaulted,
  register,
  string,
  object,
  array,
} from "@amadeus-music/core";
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
  lookup,
  command,
  connect,
  desource,
  recognize,
  transcribe,
} = register({
  name,
  version,
  config: {
    yandex: defaulted(object({ tokens: defaulted(array(string()), []) }), {}),
  },
});
