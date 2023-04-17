import { string, defaulted, object, register } from "@amadeus-music/core";
import { name, version } from "./package.json";

export const { info, err, wrn, init, fetch, connect, recognize } = register({
  name,
  version,
  config: {
    audd: defaulted(object({ token: defaulted(string(), "") }), {}),
  },
});
