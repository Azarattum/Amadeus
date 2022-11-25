import { string, defaulted, object, register } from "@amadeus-music/core";
import { name, version } from "./package.json";

export const { info, err, wrn, init, search, pool, command } = register({
  name,
  version,
  config: {
    yandex: defaulted(
      object({
        token: defaulted(string(), ""),
      }),
      {}
    ),
  },
});
