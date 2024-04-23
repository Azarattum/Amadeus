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
  stop,
  info,
  pool,
  users,
  relate,
  expand,
  lookup,
  command,
  persistence,
} = register({
  name,
  version,
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
});

export const recommend = pool<(user: string, count: number) => void>(
  "recommend",
  { concurrency: 1 },
);
