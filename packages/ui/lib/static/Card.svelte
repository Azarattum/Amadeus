<script lang="ts">
  export let sm = false;
  export let flat = false;
  export let flow = false;
  export let interactive = false;
  export let href: string | undefined = undefined;
</script>

<svelte:element
  this={interactive ? (href ? "a" : "button") : "article"}
  {href}
  style:contain="inline-size"
  on:click
  class="group relative z-10 flex h-full w-full items-center gap-4 overflow-hidden px-4 outline-2 outline-primary-600 focus-visible:outline
  {interactive
    ? 'cursor-pointer touch-manipulation select-none ' +
      (!flat ? 'transition-transform active:scale-95' : '')
    : ''}
  {sm ? 'rounded-lg py-1 focus-visible:z-50' : 'rounded-2xl py-4'}
  {flat ? 'bg-surface' : 'bg-surface-100 shadow-2xl  dark:shadow-none'}
  "
>
  <div
    aria-hidden
    class="pointer-events-none absolute inset-0 z-0 bg-highlight opacity-0
    {interactive
      ? 'group-hover:opacity-30 ' +
        (flat ? 'dark:group-hover:opacity-50' : 'dark:group-hover:opacity-10')
      : ''}"
  />
  {#if $$slots.before}
    <div class="z-10 flex items-center">
      <slot name="before" />
    </div>
  {/if}
  <div
    style:contain="inline-size"
    class="z-10 grid w-full
    {sm ? 'justify-start gap-0.5' : 'justify-center gap-2'}
    {sm && flow ? 'lg:auto-cols-fr lg:grid-flow-col' : ''}
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
    <div class="z-10 flex items-center">
      <slot name="after" />
    </div>
  {/if}
</svelte:element>
