import {
  defaulted,
  integer,
  number,
  object,
  register,
} from "@amadeus-music/core";
import { name, version } from "./package.json";

export const {
  ok,
  init,
  info,
  pool,
  users,
  relate,
  lookup,
  command,
  persistence,
} = register({
  name,
  version,
  config: {
    feed: defaulted(
      object({
        recommendations: defaulted(integer(), 50),
        hour: defaulted(number(), 6),
      }),
      {}
    ),
  },
  context: { preferences: { recommendations: 0, time: 0 } },
});

export const recommend = pool<(user: string) => void>("recommend", {
  concurrency: 1,
});
