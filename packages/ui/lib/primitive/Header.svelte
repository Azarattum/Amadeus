<script lang="ts">
  import type { Either } from "../../internal/types";
  type $$Props = Either<"lg" | "xl">;

  export let lg = false;
  export let xl = false;

  const tag = xl ? "h1" : lg ? "h2" : "h3";
</script>

<svelte:element
  this={tag}
  class:h-11={xl}
  class:text-xl={xl}
  class:text-lg={lg}
  class:py-2={!xl && !lg}
  class:light={!xl && !lg}
  class:text-xs={!xl && !lg}
  class:uppercase={!xl && !lg}
  class:text-content-200={!xl && !lg}
>
  <slot />
</svelte:element>
