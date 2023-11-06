import {
  persistence,
  recommend,
  command,
  users,
  stop,
  init,
  info,
} from "./plugin";
import { bright, async, reset, Feed, arg } from "@amadeus-music/core";
import { delay } from "@amadeus-music/util/async";
import { suggest } from "./recommendation";

init(function* ({ feed: { recommendations, chunk } }) {
  const interval = day / (recommendations / chunk);
  const from = new Date();
  from.setMinutes(0, 0, 0);

  this.preferences.interval = interval;
  this.preferences.chunk = chunk;

  // Register recommendations update time for each user
  for (const user of Object.keys(yield* async(users()))) {
    const pool = recommend.schedule({ absolute: +from, interval })(user, chunk);
    cleanup.add(pool.executor.controller);
    pool.then();
  }
});

stop(function* () {
  cleanup.forEach((x) => x.abort());
  cleanup.clear();
});

command("register", [arg.text])(function* (user) {
  user = user?.toLowerCase() || "";
  yield* async(delay(5));
  if (!(yield* async(users()))[user]) return;

  const { interval, chunk } = this.preferences;
  const from = new Date();
  from.setMinutes(0, 0, 0);

  const pool = recommend.schedule({ absolute: +from, interval })(user, chunk);
  cleanup.add(pool.executor.controller);
  pool.then();
});

recommend(function* (user, count) {
  const db = persistence(user);
  const sample = yield* db.library.sample(3, 100);
  const novel = (ids: number[]) => db.library.has(ids).then();
  const name =
    bright + (yield* db.settings.extract("name", "settings")) + reset;

  for (const reference of sample) {
    const recommendations = yield* suggest(reference, count, novel);
    if (recommendations.length) {
      yield* db.library.push(recommendations, Feed.Recommended);
      info(`Recommended a chunk of ${recommendations.length} to ${name}...`);
      break;
    }
  }

  yield* db.feed.clear(Feed.Recommended, (Date.now() - day + minute) / 1000);
});

const minute = 1000 * 60;
const day = minute * 60 * 24;

const cleanup = new Set<AbortController>();
