<script lang="ts">
  import { getContext, onDestroy } from "svelte";
  import type { Writable } from "svelte/store";

  type Group = {
    id: string;
    value: Writable<string>;
    i: number;
    size: number;
  } | null;
  const group = getContext<Group>("group");
  const value = group?.value;
  const index = group ? group.i++ % group.size : undefined;

  export let compact = false;
  export let primary = false;
  export let stretch = false;
  export let round = false;
  export let target = true;
  export let air = false;
  export let href = "";
  export let active = href && globalThis.location?.hash === href;

  const tag = group ? "label" : href ? "a" : "button";
  const id = href && target ? href.split("#").pop() : undefined;

  const updateActive = () =>
    (active = href && globalThis.location?.hash === href);
  globalThis.addEventListener?.("hashchange", updateActive);
  onDestroy(() => globalThis.removeEventListener?.("hashchange", updateActive));
</script>

{#if group}
  <input
    class="sibling peer absolute appearance-none"
    type="radio"
    bind:group={$value}
    id="{group.id}{index}"
    checked={$value === index?.toString()}
    value={index}
    name={group.id}
  />
{/if}
<svelte:element
  this={tag}
  for={group ? group.id + index : undefined}
  {href}
  {id}
  on:click
  class="relative flex h-11 min-w-max cursor-pointer select-none items-center text-content-100 outline-2 outline-offset-2 outline-primary-600 transition-composite after:absolute after:right-0 after:h-6 after:w-0.5 after:rounded-full after:bg-primary-600 after:opacity-0 after:transition-opacity focus-visible:outline active:scale-95 [.sibling:checked+&]:text-white {round
    ? 'rounded-full'
    : 'rounded-lg'}"
  class:w-full={stretch}
  class:hover:text-content={!primary}
  class:bg-highlight={!primary}
  class:hover:bg-highlight-100={!primary && !group}
  class:bg-primary-600={primary}
  class:hover:bg-primary-700={primary}
  class:text-white={primary}
  class:bg-transparent={air || group}
  class:text-content-200={air}
  class:hover:bg-transparent={air}
  class:target:text-primary-600={air}
  class:target:after:opacity-100={air}
  class:target:hover:text-primary-700={air}
  class:text-primary-600={active && air}
  class:after:opacity-100={active && air && !compact}
  class:hover:text-primary-700={active && air}
  class:pl-[0.625rem]={!air || group}
  class:pr-[0.625rem]={!compact}
  class:gap-[0.625rem]={!compact}
  class:min-w-[2.75rem]={compact}
  class:justify-end={compact}
  class:flex-col={compact}
  class:text-2xs={compact}><slot /></svelte:element
>
