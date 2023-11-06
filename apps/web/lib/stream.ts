import type { Unsubscribable } from "@trpc/server/observable";
import { debounce } from "@amadeus-music/util/async";
import { writable, get } from "svelte/store";

function stream<I, T, U>(from: Subscription<I, Stream<T, U>>, next: Next) {
  let unsubscribe = () => {};
  let pages: T[][] = [];
  let id = 0;

  const { subscribe, set } = writable<(T[] & { detail?: U }) | undefined>(
    undefined,
    () => () => unsubscribe(),
  );

  const resubscribe = debounce((input: I) => {
    unsubscribe = from.subscribe(input, {
      onData(data) {
        id = data.id;
        if (!data.results.length && data.progress < 1) return;
        pages[data.page] = data.results;
        set(Object.assign(pages.flat(), { detail: data.detail }));
      },
      onError(err) {
        console.error(err);
      },
    }).unsubscribe;
  });

  function update(input: I | null) {
    if (import.meta.env.SSR) return;
    if (get({ subscribe })) set(undefined);
    pages = [];
    unsubscribe();
    if (input) resubscribe(input);
  }

  return { next: () => next.mutate(id), subscribe, update };
}

function multistream<T extends Record<string, Subscription>>(
  from: T,
  next: Next,
  initial: keyof T,
) {
  let unsubscribe = () => {};
  let current = null as (typeof streams)[keyof T] | null;
  let last = null as Parameters<T[keyof T]["subscribe"]>[0] | null;

  const streams = Object.fromEntries(
    Object.entries(from).map(([key, val]) => [key, stream(val, next)]),
  ) as Record<keyof T, ReturnType<typeof stream>>;

  const { subscribe, set } = writable<Multistream<typeof from>>(
    { data: undefined, type: initial } as any,
    () => () => unsubscribe(),
  );

  function update(input: typeof last) {
    current?.update(input);
    last = input;
  }

  function choose(stream: keyof T) {
    unsubscribe();
    current = streams[stream];
    unsubscribe =
      current?.subscribe((data) => set({ type: stream, data } as any)) ||
      (() => {});
    if (last) current.update(last);
  }

  choose(initial);

  return { next: () => current?.next(), subscribe, update, choose };
}

type Multistream<T extends Record<string, Subscription<any, any>>> = {
  [K in keyof T]: T[K] extends Subscription<any, Stream<infer T, infer U>>
    ? { data: (T[] & { detail?: U }) | undefined; type: K }
    : never;
}[keyof T];

type Stream<T, U = undefined> = {
  progress: number;
  results: T[];
  page: number;
  id: number;
  detail?: U;
};

type Subscription<I = any, T = any> = {
  subscribe(
    input: I,
    options: { onError(error: unknown): void; onData(value: T): void },
  ): Unsubscribable;
};

type Next = { mutate: (id: number) => void };

export { multistream, stream };
