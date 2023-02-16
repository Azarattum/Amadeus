import { async, context, first, map, merge as parallel } from "libfun/pool";
import { pages, type PaginationOptions } from "./pagination";
import { stringSimilarity } from "string-similarity-js";
import type { Executor } from "libfun/pool/pool.types";
import { normalize } from "@amadeus-music/protocol";
import { clean } from "@amadeus-music/util/string";
import { batch } from "@amadeus-music/util/object";
import type { Context } from "../plugin/types";
import type { Fn } from "libfun/utils/types";
import { aggregate } from "../event/pool";
import { err, wrn } from "../status/log";
import { inferTrack } from "./infer";
import type { Pool } from "libfun";

aggregate(function* (from, args, options) {
  type Parts = Map<string, AsyncGenerator<any>>;
  const parts: Parts = (from.split() as Fn)(...args);
  const generators = [...parts.values()].map(batch);
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

  yield {
    next: data.next,
    prev: data.prev,
  };

  yield* map(parallel(...curated));
  // Don't end until aborted
  yield* async(
    new Promise((resolve) =>
      this.signal.addEventListener("abort", resolve, { once: true })
    )
  );
});

function aggregator(id: number): Controls;
function aggregator<T extends Fn, A extends Readonly<Parameters<T>>>(
  this: Context,
  from: Pool<T, any>,
  args: A,
  options: PaginationOptions<ReturnType<Extract<T, (..._: A) => any>>>
): number;
function aggregator(
  this: Context,
  source: number | Pool<any, any>,
  args: any[] = [],
  options: PaginationOptions<any> = { page: 10, compare: () => 0 }
) {
  if (typeof source === "number") {
    const controls = [...aggregate.status().executing.values()].find(
      (x: any) => x.controls === source
    ) as (Executor & Partial<Controls>) | undefined;

    return {
      next: () => !!controls?.next?.(),
      prev: () => !!controls?.prev?.(),
      close: () => controls?.controller.abort(),
    } as Controls;
  }

  const group = this?.group || context.group;
  const id = options.id || (Math.random() * 2 ** 32) >>> 0;
  async function invalidate() {
    try {
      await options.invalidate?.();
    } catch (error) {
      err.bind({ group })(
        "Error encountered during aggregator invalidation!",
        error
      );
    }
  }

  setTimeout(async () => {
    const generator = aggregate.bind({ group })(source, args, options);
    const { signal } = generator.executor.controller;
    signal.addEventListener("abort", invalidate, { once: true });
    const controls = await first(generator, false);
    Object.assign(generator.executor, { controls: id });
    Object.assign(generator.executor, controls);
  });

  return id;
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

type Controls = { next(): boolean; prev(): boolean; close(): void };

export { aggregator as aggregate, match, type Controls };
