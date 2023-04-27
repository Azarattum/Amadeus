<script lang="ts">
  import type { Either } from "../../internal/types";
  type $$Props = Either<"sm" | "lg" | "xl"> & {
    center?: boolean;
    id?: string;
  };

  export let id: string | undefined = undefined;
  export let center = false;
  export let sm = false;
  export let lg = false;
  export let xl = false;

  const tag = sm ? "h5" : lg ? "h3" : xl ? "h2" : "h4";
</script>

<svelte:element
  this={tag}
  {id}
  class="
  {center ? 'text-center' : 'text-left'} transition-colors
  {sm ? 'light py-2 text-xs uppercase text-content-200' : ''}
  {!sm && !lg && !xl ? 'text-lg' : ''}
  {lg ? 'text-xl' : ''}
  {xl ? 'h-11 text-2xl' : ''}
  "
>
  {#if id}
    <a href="#{id}"><slot /></a>
  {:else}
    <slot />
  {/if}
</svelte:element>
