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
  expand,
  users,
  init,
  stop,
  info,
  pool,
} = register({
  config: {
    feed: defaulted(
      object({
        recommendations: defaulted(integer(), 48),
        chunk: defaulted(number(), 4),
      }),
      {},
    ),
  },
  context: { preferences: { interval: 1000 * 60 * 60, chunk: 0 } },
  version,
  name,
});

export const recommend = pool<(user: string, count: number) => void>(
  "recommend",
  { concurrency: 1 },
);
