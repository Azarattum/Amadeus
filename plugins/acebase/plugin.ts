import { boolean, defaulted, object, register } from "@amadeus-music/core";
import { AceBaseServer } from "acebase-server";
import { name, version } from "./package.json";

export const { info, err, wrn, init, stop, pool, command } = register({
  name,
  version,
  config: {
    acebase: defaulted(
      object({
        sponsor: defaulted(boolean(), false),
      }),
      {}
    ),
  },
  context: {
    server: undefined as any as AceBaseServer,
    db: undefined as any as AceBaseServer["db"],
  },
});
