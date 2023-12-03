<script lang="ts">
  import { type Classes, tw } from "../../component";

  let classes: Classes = "";
  export { classes as class };
  export let href: string | undefined = undefined;
  export let disabled = false;
  export let selected = false;
  export let big = false;
  export let fixed = big;

  $: bg = selected
    ? tw`bg-surface-highlight-200 
      ${!disabled && "hover:bg-surface-highlight-300"}`
    : big
    ? tw`bg-surface-100 ${!disabled && "hover:bg-surface-highlight-100"}`
    : tw`bg-surface ${!disabled && "hover:bg-surface-highlight"}`;
  $: rounded = big ? "rounded-2xl" : "rounded-lg";
  $: container = big
    ? tw`gap-y-2 py-4 shadow-[0_0_20px_-4px] shadow-black/20 dark:shadow-none`
    : tw`gap-y-0.5 py-1`;
  $: content = tw`contain-inline-size overflow-hidden
    ${big && "place-items-center"}`;
</script>

<svelte:element
  this={disabled ? "article" : href ? "a" : "button"}
  class={tw`group relative grid w-full touch-manipulation select-none grid-flow-col grid-cols-[auto_1fr_auto] px-4 outline-2 -outline-offset-2 outline-primary-600 contain-inline-size focus-visible:outline [&>div]:row-start-1
  ${container} ${rounded} ${bg} 
  ${!disabled && big && "transition-transform active:scale-95"} ${classes}`}
  role={href ? "link" : "button"}
  draggable="false"
  tabindex="0"
  {href}
  on:contextmenu
  on:click
>
  <div class={tw`col-start-1 self-center ${$$slots.before && "mr-4"}`}>
    <slot name="before" />
  </div>
  <div
    class={tw`col-start-2 grid grid-cols-1 items-baseline self-center ${content}
      ${big ? "gap-2" : "gap-0.5"}
      ${!fixed && "lg:auto-cols-fr lg:grid-flow-col lg:gap-4"}`}
  >
    <slot />
  </div>
  <div class={tw`col-start-3 self-center ${$$slots.after && "ml-4"}`}>
    <slot name="after" />
  </div>
  {#if !big}
    <hr
      class={tw`relative top-1 col-start-2 col-end-4 row-start-1 h-[1px] w-[calc(100%+0.5rem)] self-end border-none group-last-of-type:opacity-0
    ${selected ? "bg-primary-900/10" : "bg-content/10"}`}
    />
  {/if}
</svelte:element>
