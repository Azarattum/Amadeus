<script lang="ts">
  import type { Either } from "../../internal/types";
  type $$Props = Either<"sm" | "lg" | "xl">;

  export let sm = false;
  export let lg = false;
  export let xl = false;

  const tag = sm ? "h5" : lg ? "h3" : xl ? "h2" : "h4";
</script>

<svelte:element
  this={tag}
  class="
  {sm ? 'light py-2 text-xs uppercase text-content-200' : ''}
  {!sm && !lg && !xl ? 'text-lg' : ''}
  {lg ? 'text-xl' : ''}
  {xl ? 'h-11 text-2xl' : ''}
  "
>
  <slot />
</svelte:element>
