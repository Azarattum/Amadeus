import { string, defaulted, object, register } from "@amadeus-music/core";
import { name, version } from "./package.json";

export const { init, connect, recognize } = register({
  name,
  version,
  config: {
    audd: defaulted(object({ token: defaulted(string(), "") }), {}),
  },
});
