import type {
  Track,
  Media,
  Unique,
  Artist,
  Album,
} from "@amadeus-music/protocol";
import { batch, combine } from "@amadeus-music/util/object";
import { stringSimilarity } from "string-similarity-js";
import { lock } from "@amadeus-music/util/throttle";
import { clean } from "@amadeus-music/util/string";
import { identify, normalize } from "./identity";
import { merge as parallel } from "libfun/pool";
import { search } from "../event/pool";
import { inferTrack } from "./infer";

/// Probably should be a pool, consider aborts, consider status graph...
function aggregate<T extends Media>(
  type: "track" | "artist" | "album",
  query: string,
  page = 10
) {
  const providers = [
    ...search
      .split()(type as any, query)
      .values(),
  ].map((x: any) => batch<T>(x));

  const map = new Map<string, Unique<T>>();
  const aggregated: Unique<T>[] = [];
  const compare = match(query);
  const convert = (x: T) => {
    const unique = { ...x, id: identify(x) };
    if ("artists" in unique) unique.artists.sort();
    return unique;
  };

  const pages = { shown: 0, current: 0, last: 0 };
  const state = () => {
    const start = pages.current * page;
    const end = start + page;
    return {
      page: aggregated.slice(start, end),
      all: aggregated,
      at: pages.current,
    };
  };

  const { resolve, wait } = lock();
  const options = { compare, map, merge, identify, convert };
  const curated = providers.map((generator) => {
    return (async function* () {
      let loaded = 0;
      for await (const batch of generator) {
        /// Consider page consistency...
        combine(aggregated, batch, options);
        loaded += batch.length;
        yield state();
        while (loaded >= (pages.last + 1) * page) {
          await wait();
          if (pages.shown !== pages.current) {
            pages.shown = pages.current;
            yield state();
          }
        }
      }
      /// Warn on empty
      providers.splice(providers.indexOf(generator), 1);
    })();
  });

  return Object.assign(parallel(...curated), {
    page(number: number) {
      pages.last = Math.max(pages.current, number);
      pages.current = number;
      resolve();
    },
  });
}

function merge<T extends Media>(target: Unique<T>, source: T) {
  const upperLetters = (text: string) => {
    let count = 0;
    const lower = text.toLowerCase();
    for (let i = 0; i < text.length; i++) {
      if (lower[i] !== text[i]) count++;
    }
    return count;
  };
  const better = (a: string, b: string) =>
    upperLetters(a) > upperLetters(b) ? a : b;

  target.title = better(target.title, source.title);

  if (source.art) target.art.push(...source.art);
  if (source.source) target.source.push(...source.source);
  if ("year" in target && "year" in source) target.year ||= source.year;
  if ("length" in target && "length" in source) target.length ||= source.length;
  if ("name" in target && "name" in source) {
    target.title = better(target.title, source.title);
  }
  if ("artists" in target && "artists" in source) {
    source.artists.sort();
    target.artists = target.artists.map((x, i) => better(x, source.artists[i]));
  }
  if ("album" in target && "album" in source) {
    if (
      target.album.toLowerCase() === target.title.toLowerCase() &&
      source.album.toLowerCase() !== target.title.toLowerCase()
    ) {
      target.album = source.album;
    } else target.album = better(target.album, source.album);
  }
}

function match<T extends Media>(query: string) {
  const track = normalize(inferTrack(query));
  query = clean(query);

  const compare = (x: T, key: string) => {
    const target = (x as any)[key]?.toString();
    const source = (track as any)[key]?.toString();
    if (!target) return 0;
    const withQuery = stringSimilarity(target, query);
    if (!source) return withQuery;
    return Math.max(withQuery, stringSimilarity(target, source));
  };

  return (a: T, b: T) => {
    a = normalize(a) as T;
    b = normalize(b) as T;

    const keys = ["title", "artists", "album"];
    const weights = [4, 2, 1];

    const scores = keys.map((key) => [compare(a, key), compare(b, key)]);
    if (scores.find((x) => x[0] === x[1] && x[0] === 1)) return 0;
    return scores.reduce((acc, [a, b], i) => acc + (b - a) * weights[i], 0);
  };
}

const tracks = (query: string, page = 10) =>
  aggregate<Track>("track", query, page);
const artists = (query: string, page = 10) =>
  aggregate<Artist>("artist", query, page);
const albums = (query: string, page = 10) =>
  aggregate<Album>("album", query, page);

export { tracks, artists, albums };
