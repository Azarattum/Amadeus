import type { TransitionConfig } from "svelte/transition";
import type { SvelteHTMLElements } from "svelte/elements";

type TransitionTuple<T> =
  | [(node: Element, options: T) => TransitionConfig, T]
  | [(node: Element, options?: undefined) => TransitionConfig];

export type Transition<T, U> =
  | { transition?: TransitionTuple<T> }
  | { in?: TransitionTuple<T>; out?: TransitionTuple<U> };

export type HTMLProps = {
  [K in keyof SvelteHTMLElements]: Omit<
    SvelteHTMLElements[K],
    `on:${string}` | `bind:${string}`
  >;
};

export type Either<T extends string> = {
  [K in T]: {
    [U in T]?: U extends K ? true : false;
  };
}[T];
