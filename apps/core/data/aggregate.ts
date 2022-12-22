import { async, map, merge as parallel, take } from "libfun/pool";
import { pages, type PaginationOptions } from "./pagination";
import { stringSimilarity } from "string-similarity-js";
import { pool as makePool, pools } from "../event/pool";
import type { Media } from "@amadeus-music/protocol";
import { clean } from "@amadeus-music/util/string";
import { batch } from "@amadeus-music/util/object";
import type { Fn } from "libfun/utils/types";
import { normalize } from "./identity";
import { inferTrack } from "./infer";
import { wrn } from "../status/log";
import type { Pool } from "libfun";

/// This should be bound
function aggregate<T extends Record<string, any>, A extends any[]>(
  pool: Pool<(..._: A) => T>,
  options: PaginationOptions<T>
) {
  const id = Math.random().toString(36).slice(2);
  const timeout = 1000 * 60 * 60;
  const aggregator = makePool<(..._: A) => void>(`aggregate/${id}`, {
    timeout,
  });

  aggregator(function* (...args) {
    const parts = (pool.split() as Fn)(...args) as Map<string, AsyncGenerator>;
    const generators = [...parts.values()].map((x: any) => batch<T>(x));
    const groups = [...parts.keys()];

    const data = pages(groups, options);
    const curated = generators.map((generator, id) => {
      return (async function* () {
        let empty = true;
        for await (const batch of generator) {
          if (batch.length) empty = false;
          await data.append(id, batch);
        }
        data.complete(id);
        if (empty) wrn.bind({ group: groups[id] })("No results aggregated!");
      })();
    });

    Object.assign(aggregator.status(), {
      next: data.next,
      prev: data.prev,
    });

    yield* map(parallel(...curated));
    // Don't end until aborted
    yield* async(
      new Promise((resolve) =>
        this.signal.addEventListener("abort", resolve, { once: true })
      )
    );
  });

  return (...args: A) => {
    if (pools.status(`aggregate/${id}`).executing.size) return id;
    setTimeout(() => {
      const generator = aggregator(...args);
      generator.executor.controller.signal.addEventListener(
        "abort",
        () => {
          options.invalidate?.();
          aggregator.close();
        },
        { once: true }
      );
      take(generator);
    });
    return id;
  };
}

function aggregator(id: string) {
  const pool: any =
    pools.status().find((x) => x.id === `aggregate/${id}`) || {};
  return {
    next: (pool.next as () => void) || (() => {}),
    prev: (pool.prev as () => void) || (() => {}),
    close: () => pools.abort(`aggregate/${id}`),
  };
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

export { aggregate, aggregator, match };
