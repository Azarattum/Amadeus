import type { Unsubscribable } from "@trpc/server/observable";
import { debounce } from "@amadeus-music/util/async";
import { get, writable } from "svelte/store";

function stream<I, T, U>(from: Subscription<I, Stream<T, U>>, next: Next) {
  let unsubscribe = () => {};
  let pages: T[][] = [];
  let id = 0;

  const { subscribe, set } = writable<(T[] & { detail?: U }) | undefined>(
    undefined,
    () => () => unsubscribe()
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

  return { subscribe, update, next: () => next.mutate(id) };
}

function multistream<T extends Record<string, Subscription>>(
  from: T,
  next: Next,
  initial: keyof T
) {
  let unsubscribe = () => {};
  let current = null as null | (typeof streams)[keyof T];
  let last = null as null | Parameters<T[keyof T]["subscribe"]>[0];

  const streams = Object.fromEntries(
    Object.entries(from).map(([key, val]) => [key, stream(val, next)])
  ) as Record<keyof T, ReturnType<typeof stream>>;

  const { subscribe, set } = writable<Multistream<typeof from>>(
    { type: initial, data: undefined } as any,
    () => () => unsubscribe()
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

  return { subscribe, update, choose, next: () => current?.next() };
}

type Multistream<T extends Record<string, Subscription<any, any>>> = {
  [K in keyof T]: T[K] extends Subscription<any, Stream<infer T, infer U>>
    ? { type: K; data: (T[] & { detail?: U }) | undefined }
    : never;
}[keyof T];

type Stream<T, U = undefined> = {
  id: number;
  detail?: U;
  results: T[];
  page: number;
  progress: number;
};

type Subscription<I = any, T = any> = {
  subscribe(
    input: I,
    options: { onData(value: T): void; onError(error: unknown): void }
  ): Unsubscribable;
};

type Next = { mutate: (id: number) => void };

export { stream, multistream };
