import {
  command,
  info,
  init,
  lookup,
  ok,
  persistence,
  recommend,
  relate,
  users,
} from "./plugin";
import {
  Feed,
  arg,
  async,
  bright,
  map,
  reset,
  type Track,
} from "@amadeus-music/core";
import { shuffle } from "@amadeus-music/util/object";
import { delay } from "@amadeus-music/util/async";
import { minmax } from "@amadeus-music/util/math";

const day = 1000 * 60 * 60 * 24;

init(function* ({ feed }) {
  const date = new Date();
  date.setHours(feed.hour, 0, 0);

  this.preferences.recommendations = feed.recommendations;
  this.preferences.time = +date;

  // Register recommendations update time for each user
  for (const user of Object.keys(yield* async(users()))) {
    recommend.schedule({ absolute: +date, interval: day })(user).then();
  }
});

command("register", [arg.text])(function* (user) {
  user = user?.toLowerCase() || "";
  yield* async(delay(5));
  if (!(yield* async(users()))[user]) return;
  const absolute = this.preferences.time;
  recommend.schedule({ absolute, interval: day })(user).then();
});

recommend(function* (user) {
  const db = persistence(user);
  const count = this.preferences.recommendations;
  const sample = yield* db.library.sample(100);
  const banned = new Set(yield* db.library.banned());
  const name =
    bright + (yield* db.settings.extract("name", "settings")) + reset;

  info(`Assembling recommendations for ${name}...`);

  const recommendations: Track[] = [];
  for (let i = 0; i < sample.length; i++) {
    // Find the number of recommendations per track (biased towards newer)
    const track = sample[i];
    const bias = 3 * Math.exp(-1 * ((1 / Math.sqrt(count)) * i)) + 3;
    const left = sample.length - i;
    const pick = minmax(
      Math.ceil(((count - recommendations.length) / left) * bias),
      0,
      count,
    );

    // Search for similar tracks
    const similar: (Track | undefined)[] | undefined = (yield* map(
      relate("track", track, pick * 5),
      function* (x) {
        if (x.progress >= 1) x.close();
        return shuffle(x.items.filter((x) => !banned.has(x.id))).slice(0, pick);
      },
    )).pop();
    if (!similar) continue;

    /// TODO: search for similar artists
    /// TODO: search for similar albums

    // Look up tracks without sources
    for (let i = 0; i < similar.length; i++) {
      const track = similar[i];
      if (!track || track.sources.length) continue;
      similar[i] = yield* lookup("track", track);
    }

    // Save recommendations
    recommendations.push(
      ...similar
        .filter(<T>(x: T): x is NonNullable<T> => !!x)
        .filter((x) => !banned.has(x.id))
        .slice(0, left),
    );
    if (recommendations.length >= count) break;
  }

  yield* db.feed.clear(Feed.Recommended);
  yield* db.library.push(shuffle(recommendations), Feed.Recommended);
  ok(`Successfully assembled recommendations for ${name}...`);
});
