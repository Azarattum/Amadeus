import {
  string,
  defaulted,
  object,
  register,
  number,
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
  command,
  desource,
  transcribe,
} = register({
  name,
  version,
  config: {
    yandex: defaulted(
      object({
        page: defaulted(number(), 30),
        token: defaulted(string(), ""),
      }),
      {}
    ),
  },
});
