<script lang="ts">
  import type { Readable, Writable } from "svelte/store";
  import { getContext, onDestroy } from "svelte";
  import { uuid } from "../../internal/util";

  type Group = {
    value: Writable<string>;
    size: number;
    id: string;
    i: number;
  } | null;

  const panel = !!getContext("panel");
  const group = getContext<Group>("group");
  const index = group ? group.i++ % group.size : undefined;
  const value = group?.value;

  export let href: Readable<string> | string | undefined = undefined;
  export let id: string | undefined = undefined;
  export let to: string | undefined = undefined;
  export let stretch = !!group;
  export let disabled = false;
  export let primary = false;
  export let compact = false;
  export let square = false;
  export let round = false;
  export let slim = false;
  export let air = !!group;

  let url: string | undefined;
  $: if (!href || typeof href === "string") url = href;
  else onDestroy(href.subscribe((x) => (url = x)));

  $: tag = (group || to ? "label" : href ? "a" : "button") as
    | "button"
    | "label"
    | "a";
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

  $: target =
    typeof href === "string" && href.includes("#") ? href.split("#").pop() : to;
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
  class="relative flex min-w-max cursor-pointer touch-manipulation select-none items-center outline-2 outline-offset-2 outline-primary-600 transition-paint focus-visible:outline active:scale-95 [&:has(input:checked)]:bg-transparent [&:has(input:checked)]:text-white {text} {background}
  {slim ? '' : 'h-11'}
  {compact ? 'flex-col text-2xs' : 'gap-[0.625rem]'}
  {round ? 'rounded-full' : 'rounded-lg'}
  "
  for={to || undefined}
  draggable="false"
  role="button"
  tabindex="0"
  href={url}
  {disabled}
  id={uid}
  class:justify-center={stretch || compact || panel}
  class:px-[0.625rem]={!air || group}
  class:aspect-square={square}
  class:shrink-0={!stretch}
  class:w-full={stretch}
  on:click
>
  {#if group}
    <input
      class="sibling peer absolute appearance-none"
      checked={$value === index?.toString()}
      name={group.id}
      value={index}
      type="radio"
      {id}
      bind:group={$value}
    />
  {/if}
  <slot />
</svelte:element>

<svelte:head>
  {#if style}
    <svelte:element this="style">{style}</svelte:element>
  {/if}
</svelte:head>
