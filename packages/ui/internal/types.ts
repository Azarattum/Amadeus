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

export type Either<T extends Record<string, unknown>> = {
  [K in keyof T]: {
    [U in keyof T]?: U extends K ? T[U] : undefined;
  };
}[keyof T];
