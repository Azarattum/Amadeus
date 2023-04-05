<script lang="ts">
  import type { Writable } from "svelte/store";
  import { getContext } from "svelte";

  type Group = {
    id: string;
    value: Writable<string>;
    i: number;
    size: number;
  } | null;
  const group = getContext<Group>("group");
  const index = group ? group.i++ % group.size : undefined;
  const value = group?.value;

  export let href: string | undefined = undefined;
  export let primary = false;
  export let compact = false;
  export let stretch = false;
  export let round = false;
  export let air = false;

  const tag = group ? "label" : href ? "a" : "button";
  const id = href ? href.split("#").pop() : undefined;

  $: background =
    air || group
      ? ""
      : primary
      ? "bg-primary-600 hover:bg-primary-700"
      : "bg-highlight hover:bg-highlight-100";
  $: text = air
    ? primary
      ? "text-primary-600 hover:text-primary-700"
      : "text-content-200 hover:text-content"
    : primary
    ? "text-white"
    : "text-content-100 hover:text-content";
  $: targeted = air
    ? "target:text-primary-600 target:hover:text-primary-700"
    : "target:text-white target:hover:text-white target:bg-primary-600 target:hover:bg-primary-700";
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
  class="transition-paint relative flex h-11 min-w-max cursor-pointer touch-manipulation select-none items-center outline-2 outline-offset-2 outline-primary-600 focus-visible:outline active:scale-95 [.sibling:checked+&]:text-white {text} {background} {targeted}
  {compact ? 'flex-col justify-center text-2xs' : 'gap-[0.625rem]'}
  {round ? 'rounded-full' : 'rounded-lg'}"
  class:px-[0.625rem]={!air || group}
  class:w-full={stretch}
>
  <slot />
</svelte:element>
