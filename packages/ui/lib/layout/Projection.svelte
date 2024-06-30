<script lang="ts">
  import { active as getActive, route as makeRoute } from "./Hologram.svelte";
  import type { Transition, HTMLProps } from "../../internal/types";
  import { tw } from "../../internal/tailwind";

  type In = $$Generic;
  type Out = $$Generic;
  type $$Props = {
    class?: ((active: boolean) => string) | string;
    ephemeral?: boolean;
    default?: boolean;
    title?: string;
    at: string;
  } & (Transition<In, Out> & HTMLProps["div"]);

  export let at: string;
  export let title = "";
  export let ephemeral = false;
  const {
    transition = [() => null, {}],
    out: [outFunc, outOpts] = transition,
    in: [inFunc, inOpts] = transition,
    default: fallback,
    class: classes,
    ...props
  } = $$restProps;

  const { parent, route } = makeRoute(at);
  const current = getActive();

  $: inDOM = keep($current);
  $: visible = $current === $route || (!!fallback && $current === $parent);
  $: active =
    $current.startsWith($route) || (!!fallback && $current === $parent);

  /**
   * Defer removing page from DOM when switched to a sibling branch.
   * Always keep non-ephemeral pages in DOM.
   */
  function keep(next: string): boolean {
    if (!ephemeral) return true;
    if (active && !next.startsWith($route) && !$route.startsWith(next)) {
      return true;
    }
    if (next.startsWith($route) || $route.startsWith(next)) {
      return false;
    }
    return !!inDOM;
  }
</script>

{#if inDOM || active}
  <div
    {...props}
    class={tw`absolute inset-0
      ${!active ? "-z-10 opacity-0 [&_*]:!overflow-hidden [&_*]:!will-change-auto" : "z-10"}
      ${typeof classes === "string" && classes}
      ${typeof classes === "function" && classes(active)}
    `}
    out:outFunc={outOpts}
    in:inFunc={inOpts}
  >
    <slot {visible} {active} />
  </div>
{/if}

<svelte:head>
  {#if visible && title}
    {#key title}
      <title>{title}</title>
    {/key}
  {/if}
</svelte:head>
