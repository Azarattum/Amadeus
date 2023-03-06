import { normalize, trackDetails } from "@amadeus-music/protocol";
import stringSimilarity from "string-similarity-js";
import { batch } from "@amadeus-music/util/object";
import { clean } from "@amadeus-music/util/string";
import { persistence } from "../data/persistence";
import { cancel } from "libfun/utils/async";
import { pages } from "../data/pagination";
import { inferTrack } from "../data/infer";
import { merge, take } from "libfun/pool";
import { array, is } from "superstruct";
import { wrn } from "../status/log";

async function* aggregate(
  generators: AsyncGenerator<any>[],
  args: [string, any, number?],
  {
    id,
    groups,
    controller,
  }: { id: string; groups: (string | undefined)[]; controller: AbortController }
) {
  generators = generators.map(batch);

  const compare =
    id === "search"
      ? match(typeof args[1] === "string" ? args[1] : args[1].title)
      : undefined;
  const page = pages<any>(groups as string[], {
    page: args[2] || 8,
    controller,
    compare,
  });
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
    if (is(state.items, array(trackDetails))) cache.push(state.items);
    /// TODO: cache other media types
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
