import type { TransitionConfig } from "svelte/transition";
import type { SvelteHTMLElements } from "svelte/elements";

type TransitionTuple<T> =
  | [(node: Element, options?: undefined) => TransitionConfig]
  | [(node: Element, options: T) => TransitionConfig, T];

export type Transition<T, U> =
  | { out?: TransitionTuple<U>; in?: TransitionTuple<T> }
  | { transition?: TransitionTuple<T> };

export type HTMLProps = {
  [K in keyof SvelteHTMLElements]: Omit<
    SvelteHTMLElements[K],
    `bind:${string}` | `on:${string}`
  >;
};

export type Either<T extends string> = {
  [K in T]: {
    [U in T]?: U extends K ? true : false;
  };
}[T];
