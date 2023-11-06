import { defaulted, register, string, object } from "@amadeus-music/core";
import { version, name } from "./package.json";

export const { recognize, connect, init } = register({
  config: {
    audd: defaulted(object({ token: defaulted(string(), "") }), {}),
  },
  version,
  name,
});
