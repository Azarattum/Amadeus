<script lang="ts">
  export let sm = false;
  export let flat = false;
  export let interactive = false;
</script>

<svelte:element
  this={interactive ? "button" : "article"}
  on:click
  class="group relative z-10 flex w-full min-w-max items-center gap-4 overflow-hidden px-4
  {interactive
    ? 'cursor-pointer touch-manipulation select-none outline-2 outline-primary-600 transition-transform focus-visible:z-50 focus-visible:outline'
    : ''}
  {sm ? 'rounded-lg py-1' : 'rounded-2xl py-4'}
  {flat
    ? 'bg-surface'
    : 'bg-surface-100 shadow-2xl active:scale-95 dark:shadow-none'}
  "
>
  <div
    aria-hidden
    class="pointer-events-none absolute inset-0 z-0 bg-highlight opacity-0 group-hover:opacity-30 {flat
      ? 'dark:group-hover:opacity-50'
      : 'dark:group-hover:opacity-10'}"
  />
  {#if $$slots.before}
    <div class="z-10 flex aspect-square h-full items-center">
      <slot name="before" />
    </div>
  {/if}
  <div
    class="z-10 box-content flex grow flex-col justify-center gap-2
    {sm ? '' : 'items-center'}
    "
  >
    <slot />
    {#if flat && sm}
      <hr
        aria-hidden
        class="absolute bottom-0 h-[1px] w-full border-none bg-content-300 group-last-of-type:opacity-0"
      />
    {/if}
  </div>
  {#if $$slots.after}
    <div class="z-10 flex aspect-square h-full items-center">
      <slot name="after" />
    </div>
  {/if}
</svelte:element>
