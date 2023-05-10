<script lang="ts">
  import type { Either } from "../../internal/types";
  type $$Props = Either<"sm" | "lg" | "xl"> & {
    loading?: boolean;
    center?: boolean;
    indent?: boolean;
    id?: string;
  };

  export let id: string | undefined = undefined;
  export let loading = false;
  export let center = false;
  export let indent = false;
  export let sm = false;
  export let lg = false;
  export let xl = false;

  const tag = sm ? "h5" : lg ? "h3" : xl ? "h2" : "h4";
</script>

<div aria-hidden class="h-11" class:hidden={!xl} />
<svelte:element
  this={tag}
  {id}
  class="relative box-content line-clamp-3 max-w-full rounded-md
  {center ? 'text-center' : 'text-left'}
  {sm ? 'light py-2 text-xs uppercase text-content-200' : ''}
  {!sm && !lg && !xl ? 'text-lg' : ''}
  {lg ? 'text-xl' : ''}
  {xl ? 'h-11 text-2xl' : ''}
  {loading ? 'animate-pulse bg-highlight text-transparent' : 'bg-transparent'}
  "
  class:ml-4={indent}
>
  {#if id}
    <a href="#{id}"><slot /></a>
  {:else}
    <slot />
  {/if}
  <div class="absolute right-4 top-1/2 -translate-y-1/2">
    <slot name="after" />
  </div>
</svelte:element>
