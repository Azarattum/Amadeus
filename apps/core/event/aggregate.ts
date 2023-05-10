import {
  normalize,
  albumDetails,
  trackDetails,
  artistDetails,
} from "@amadeus-music/protocol";
import stringSimilarity from "string-similarity-js";
import { batch } from "@amadeus-music/util/object";
import { clean } from "@amadeus-music/util/string";
import { cancel } from "libfun/utils/async";
import { persistence } from "./persistence";
import { pages } from "../data/pagination";
import { inferTrack } from "../data/infer";
import { merge, take } from "libfun/pool";
import { array, is } from "superstruct";
import { wrn } from "../status/log";
import type { Task } from "libfun";

async function* aggregate(
  generators: AsyncGenerator<any>[],
  { args, id, tasks, controller }: Task<[...any[], number]>
) {
  generators = generators.map(batch);
  const groups = tasks.map((x) => x.group as string).filter((x) => x);
  const compare =
    id === "search"
      ? match(typeof args[1] === "string" ? args[1] : args[1].title)
      : undefined;

  const last = args[args.length - 1];
  const limit = Number.isInteger(+last) ? +last : 10;
  const page = pages<any>(groups, { page: limit, controller, compare });
  controller.signal.addEventListener("abort", page.close, { once: true });
  const curated = generators.map((generator, id) => {
    return (async function* () {
      let empty = true;
      for await (const batch of generator) {
        if (batch.length) empty = false;
        try {
          await cancel(page.append(id, batch), controller.signal);
        } catch {
          return page.close();
        }
      }
      page.complete(id);
      if (empty) wrn.bind({ group: groups[id] })("No results aggregated!");
    })();
  });

  take(merge(curated));
  const cache = persistence();
  for await (const state of page.values()) {
    if (is(state.items, array(trackDetails))) {
      await cache.library.push(state.items);
    } else if (is(state.items, array(albumDetails))) {
      await cache.albums.push(state.items);
    } else if (is(state.items, array(artistDetails))) {
      await cache.artists.push(state.items);
    }
    yield state;
  }
}

function match(query: string) {
  const track = normalize(inferTrack(query));
  query = clean(query);

  type Media = Partial<Record<keyof typeof track, any>>;
  const compare = (x: Media, key: keyof typeof track) => {
    const target = x[key]?.toString();
    const source = track[key]?.toString();
    if (!target) return 0;
    const withQuery = stringSimilarity(target, query);
    if (!source) return withQuery;
    return Math.max(withQuery, stringSimilarity(target, source));
  };

  return (a: Media, b: Media) => {
    a = normalize(a);
    b = normalize(b);

    const keys = ["title", "artists", "album"] as const;
    const weights = [4, 2, 1];

    const scores = keys.map((key) => [compare(a, key), compare(b, key)]);
    if (scores.find((x) => x[0] === x[1] && x[0] === 1)) return 0;
    return scores.reduce((acc, [a, b], i) => acc + (b - a) * weights[i], 0);
  };
}

export { aggregate };
