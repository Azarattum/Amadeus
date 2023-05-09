<script lang="ts">
  import type { Writable } from "svelte/store";
  import { uuid } from "../../internal/util";
  import { getContext } from "svelte";

  type Group = {
    id: string;
    value: Writable<string>;
    i: number;
    size: number;
  } | null;

  const panel = !!getContext("panel");
  const group = getContext<Group>("group");
  const index = group ? group.i++ % group.size : undefined;
  const value = group?.value;

  export let href: string | undefined = undefined;
  export let id: string | undefined = undefined;
  export let to: string | undefined = undefined;
  export let stretch = !!group;
  export let disabled = false;
  export let primary = false;
  export let compact = false;
  export let square = false;
  export let round = false;
  export let air = !!group;

  const tag = group || to ? "label" : href ? "a" : "button";
  const uid = group ? uuid() : id || uuid();

  $: background = air
    ? group
      ? "hover:bg-content/5"
      : ""
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

  $: target = href?.includes("#") ? href?.split("#").pop() : to;
  $: style = !target
    ? ""
    : `body:has(#${target}:is(:target,:checked)) #${uid}{` +
      (air
        ? "color:hsl(var(--color-primary-600));"
        : "color:white;background:hsl(var(--color-primary-600));") +
      "}" +
      `body:has(#${target}:id(:target,:checked)) #${uid}:hover{` +
      (air
        ? "color:hsl(var(--color-primary-700));"
        : "color:white;background:hsl(var(--color-primary-700));") +
      "}";
</script>

<svelte:element
  this={tag}
  for={to || undefined}
  draggable="false"
  {disabled}
  id={uid}
  {href}
  on:click
  class="relative flex h-11 min-w-max cursor-pointer touch-manipulation select-none items-center outline-2 outline-offset-2 outline-primary-600 transition-paint focus-visible:outline active:scale-95 [&:has(input:checked)]:bg-transparent [&:has(input:checked)]:text-white {text} {background}
  {compact ? 'flex-col text-2xs' : 'gap-[0.625rem]'}
  {round ? 'rounded-full' : 'rounded-lg'}
  "
  class:px-[0.625rem]={!air || group}
  class:justify-center={stretch || compact || panel}
  class:aspect-square={square}
  class:shrink-0={!stretch}
  class:w-full={stretch}
>
  {#if group}
    <input
      class="sibling peer absolute appearance-none"
      checked={$value === index?.toString()}
      bind:group={$value}
      name={group.id}
      value={index}
      type="radio"
      {id}
    />
  {/if}
  <slot />
</svelte:element>

<svelte:head>
  {#if style}
    <svelte:element this="style">{style}</svelte:element>
  {/if}
</svelte:head>
