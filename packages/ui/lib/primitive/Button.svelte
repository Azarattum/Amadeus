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
  const value = group?.value;
  const index = group ? group.i++ % group.size : undefined;

  export let primary = false;
  export let stretch = false;
  export let round = false;
  export let target = true;
  export let air = !!group;
  export let href = "";

  const tag = group ? "label" : href ? "a" : "button";
  const id = href && target ? href.split("#").pop() : undefined;
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
  class="relative flex h-11 min-w-max cursor-pointer items-center gap-[0.625rem] text-content-100 outline-2 outline-offset-2 outline-primary-600 transition-composite after:absolute after:right-2 after:h-6 after:w-0.5 after:rounded-full after:bg-primary-600 after:opacity-0 after:transition-opacity focus-visible:outline active:scale-95 [.sibling:checked+&]:text-white {round
    ? 'rounded-full'
    : 'rounded-lg'}"
  class:w-full={stretch}
  class:hover:text-content={!primary}
  class:bg-highlight={!primary}
  class:hover:bg-highlight-100={!primary}
  class:bg-primary-600={primary}
  class:hover:bg-primary-700={primary}
  class:text-white={primary}
  class:bg-transparent={air}
  class:text-content-200={air}
  class:hover:bg-transparent={air}
  class:target:text-primary-600={air}
  class:target:after:opacity-100={air}
  class:target:hover:text-primary-700={air}
  class:px-[0.625rem]={!air || group}
>
  <slot />
</svelte:element>
