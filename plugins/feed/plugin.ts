import {
  defaulted,
  register,
  integer,
  number,
  object,
} from "@amadeus-music/core";
import { version, name } from "./package.json";

export const {
  persistence,
  command,
  relate,
  lookup,
  users,
  init,
  stop,
  info,
  pool,
  ok,
} = register({
  config: {
    feed: defaulted(
      object({
        recommendations: defaulted(integer(), 50),
        hour: defaulted(number(), 6),
      }),
      {},
    ),
  },
  context: { preferences: { recommendations: 0, time: 0 } },
  version,
  name,
});

export const recommend = pool<(user: string) => void>("recommend", {
  concurrency: 1,
});
