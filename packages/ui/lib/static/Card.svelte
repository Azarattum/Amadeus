<script lang="ts">
  import type { Either } from "../../internal/types";
  import { Icon } from "../../component";
  type $$Props = Either<"xs" | "sm"> & {
    selected?: boolean | "passive";
    href?: string | undefined;
    interactive?: boolean;
    flat?: boolean;
    flow?: boolean;
  };

  export let xs = false;
  export let sm = false;
  export let flat = false;
  export let flow = false;
  export let interactive = false;
  export let href: string | undefined = undefined;
  export let selected: boolean | "passive" = false;
</script>

<svelte:element
  this={interactive ? (href ? "a" : "button") : "article"}
  {href}
  on:click
  on:contextmenu
  draggable="false"
  class="group relative z-10 flex w-full items-center gap-4 overflow-hidden px-4 outline-2 -outline-offset-2 outline-primary-600 contain-inline-size focus-visible:outline
  {interactive
    ? 'cursor-pointer touch-manipulation select-none ' +
      (!flat ? 'transition-transform active:scale-95' : '')
    : ''}
  {xs
    ? 'focus-visible:z-50'
    : sm
    ? 'rounded-lg py-1 focus-visible:z-50'
    : 'rounded-2xl py-4'}
  {flat ? 'bg-surface' : 'bg-surface-100 shadow-2xl  dark:shadow-none'}
  "
>
  <div
    aria-hidden
    class:opacity-100={selected === true}
    class="pointer-events-none absolute inset-0 -z-10 bg-primary-200/30 opacity-0 transition-opacity"
  />
  <div
    aria-hidden
    class="pointer-events-none absolute inset-0 z-0 bg-highlight opacity-0
    {interactive
      ? 'group-hover:opacity-30 ' +
        (flat ? 'dark:group-hover:opacity-50' : 'dark:group-hover:opacity-10')
      : ''}"
  />
  {#if $$slots.before}
    <div class="z-20 flex items-center">
      <slot name="before" />
    </div>
  {/if}
  <div
    class="z-10 grid w-full grid-cols-1 items-baseline overflow-hidden contain-inline-size
    {sm || xs
      ? 'justify-start gap-0.5'
      : 'place-items-center justify-center gap-2'}
    {(sm || xs) && flow ? 'lg:auto-cols-fr lg:grid-flow-col lg:gap-4' : ''}
  "
  >
    <slot />
    {#if flat && (sm || xs)}
      <hr
        aria-hidden
        class="absolute bottom-0 h-[1px] w-full border-none bg-content/10 group-last-of-type:opacity-0"
      />
    {/if}
  </div>
  <div class="z-20 grid items-center [&>*]:col-start-1 [&>*]:row-start-1">
    <div class="opacity-0 transition-opacity" class:opacity-100={!selected}>
      <slot name="after" />
    </div>
    <div
      class="flex justify-center text-primary-600 opacity-0 transition-opacity"
      class:opacity-100={selected}
    >
      <Icon name="circle" />
    </div>
    <div
      class="flex scale-0 justify-center text-primary-600 transition-transform"
      class:scale-100={selected === true}
    >
      <Icon name="target" />
    </div>
  </div>
</svelte:element>
