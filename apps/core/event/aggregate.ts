import {
  normalize,
  format,
  stringify,
  identify,
  track,
  album,
  artist,
  type MediaInfo,
  type Media,
} from "@amadeus-music/protocol";
import type { Meta, FromType, MediaType } from "@amadeus-music/protocol";
import { pages, type Page } from "../data/pagination";
import stringSimilarity from "string-similarity-js";
import { batch } from "@amadeus-music/util/object";
import { clean } from "@amadeus-music/util/string";
import type { Context } from "../plugin/types";
import { map, merge, take } from "libfun/pool";
import { cancel } from "libfun/utils/async";
import { persistence } from "./persistence";
import { inferTrack } from "../data/infer";
import { array, is } from "superstruct";
import { wrn } from "../status/log";
import type { Task } from "libfun";
import { search } from "./pool";

async function* aggregate(
  generators: AsyncGenerator<any>[],
  { args, id, tasks, controller }: Task<[...any[], number]>,
) {
  generators = generators.map(batch);
  const groups = tasks.map((x) => x.group as string).filter((x) => x);
  const compare =
    id === "search"
      ? match(typeof args[1] === "string" ? args[1] : args[1].title)
      : id === "relate"
        ? () => Math.random() - 0.5
        : undefined;

  const last = args[args.length - 1];
  const limit = Number.isInteger(+last) ? +last : 10;
  const page = pages<any>(groups, { page: limit, controller, compare });
  controller.signal.addEventListener("abort", page.close, { once: true });
  const curated = generators.map((generator, i) => {
    return (async function* () {
      let empty = true;
      for await (const batch of generator) {
        if (batch.length) empty = false;
        try {
          await cancel(page.append(i, batch), controller.signal);
        } catch {
          return page.close();
        }
      }
      page.complete(i);
      if (empty) wrn.bind({ group: groups[i] })(`No ${id} results aggregated!`);
    })();
  });

  take(merge(curated));
  const cache = persistence();
  for await (const state of page.values()) {
    if (is(state.items, array(track))) {
      await cache.library.push(state.items);
    } else if (is(state.items, array(album))) {
      await cache.albums.push(state.items);
    } else if (is(state.items, array(artist))) {
      await cache.artists.push(state.items);
    }
    yield state;
  }
}

function* lookup<T extends MediaType>(
  this: Context,
  type: T,
  query: string | Meta,
  filter?: string,
) {
  const find = filter ? search.bind(this).where(filter) : search.bind(this);
  if (typeof query === "object") query = { ...query, album: undefined };
  const results = find(type as any, format(query), 1) as AsyncGenerator<
    Page<FromType<T>>
  >;

  const items = yield* map(results, function* (x) {
    if (x.progress >= 1) x.close();
    return x.items.filter(verify)[0];
  });
  return items.pop();

  function equal(a: any, b: any) {
    const clean = (text: string) =>
      text.replace(/[.,/#!$%^&*;:{}=_`~()]/g, "").replace(/\s{2,}/g, " ");
    return clean(stringify(a)) === clean(stringify(b));
  }

  function verify(item: FromType<T>) {
    if (typeof query === "string") return true;
    item = { ...item, album: undefined };
    if (identify(item) === identify(query)) return true;
    if (equal(item, query)) return true;
    const inferredItem = inferTrack(stringify(item));
    const inferredQuery = inferTrack(stringify(query));
    if (equal(inferredItem, inferredQuery)) return true;
    return false;
  }
}

function match(query: string) {
  const track = normalize(inferTrack(query));
  query = clean(query);

  const compare = (x: MediaInfo, key: keyof typeof track) => {
    const target = (x as any)[key]?.toString();
    const source = track[key]?.toString();
    if (!target) return 0;
    const withQuery = stringSimilarity(target, query);
    if (!source) return withQuery;
    return Math.max(withQuery, stringSimilarity(target, source));
  };

  return (a: Media, b: Media) => {
    // Perform query comparison
    a = normalize(a);
    b = normalize(b);
    const keys = ["title", "artists", "album"] as const;
    const weights = [4, 2, 1];
    const scores = keys.map((key) => [compare(a, key), compare(b, key)]);
    return (
      scores.reduce((acc, [a, b], i) => acc + (b - a) * weights[i], 0) ||
      b.id - a.id
    );
  };
}

export { aggregate, lookup };
