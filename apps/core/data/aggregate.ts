import type { Record, Track } from "@amadeus-music/protocol";
import { batch, combine } from "@amadeus-music/util/object";
import { stringSimilarity } from "string-similarity-js";
import { lock } from "@amadeus-music/util/throttle";
import { clean } from "@amadeus-music/util/string";
import { merge as parallel } from "libfun/pool";
import { identify, normalize } from "./track";
import { search } from "../event/pool";
import { inferTrack } from "./infer";
import { pipe } from "libfun";

/// Probably should be a pool, consider aborts, consider status graph...
function tracks(query: string, page = 10) {
  /// Consider source parsing
  const providers = pipe(search.status())(
    (x) => Array.from(x.listeners),
    (x) => x.map((x) => x.group),
    (x) => x.filter((x) => x) as string[],
    (x) => [...new Set(x)],
    /// Native libfun implementation for proper status reports
    (x) => x.map((x) => batch(search.where(x)("track", query)))
  );

  const map = new Map<string, Track>();
  const aggregated: Track[] = [];
  const compare = match(query);
  const convert = (x: Record) => ({
    ...x,
    id: identify(x),
    artists: x.artists.sort(),
    cover: x.cover ? [x.cover] : [],
    source: x.source ? [x.source] : [],
  });

  const pages = { shown: 0, current: 0, last: 0 };
  const state = () => {
    const start = pages.current * page;
    const end = start + page;
    return {
      page: aggregated.splice(start, end),
      all: aggregated,
    };
  };

  const { resolve, wait } = lock();
  const options = { compare, map, merge, identify, convert };
  const curated = providers.map((generator) => {
    return (async function* () {
      let loaded = 0;
      for await (const batch of generator) {
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

function merge(target: Track, source: Record) {
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

  if (source.source) target.source.push(source.source);
  if (source.cover) target.cover.push(source.cover);
  if (
    target.album.toLowerCase() === target.title.toLowerCase() &&
    source.album.toLowerCase() !== target.title.toLowerCase()
  ) {
    target.album = source.album;
  } else target.album = better(target.album, source.album);

  target.year ||= source.year;
  target.length ||= source.length;
  target.title = better(target.title, source.title);

  source.artists.sort();
  target.artists = target.artists.map((x, i) => better(x, source.artists[i]));
}

function match(query: string) {
  const trackQ = normalize(inferTrack(query));
  const cleanQ = clean(query);
  const compare = (x: typeof trackQ, key: keyof typeof trackQ) =>
    Math.max(
      stringSimilarity(x[key], trackQ[key]),
      stringSimilarity(x[key], cleanQ)
    );

  return (a: Track, b: Track) => {
    const trackA = normalize(a);
    const trackB = normalize(b);

    const titleA = compare(trackA, "title");
    const titleB = compare(trackB, "title");
    const artistsA = compare(trackA, "artists");
    const artistsB = compare(trackB, "artists");
    const albumA = compare(trackA, "album");
    const albumB = compare(trackB, "album");

    const title = titleA - titleB * 4;
    if (!title && titleA === 1) return 0;
    const artists = artistsA - artistsB * 2;
    if (!artists && artistsA === 1) return 0;
    const album = albumA - albumB;
    if (!album && albumA === 1) return 0;
    return -(title + artists + album);
  };
}

export { tracks };
