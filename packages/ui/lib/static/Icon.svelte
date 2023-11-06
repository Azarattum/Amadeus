<script context="module" lang="ts">
  const icons = import.meta.glob("../icons/*.svg", { eager: true, as: "raw" });
</script>

<script lang="ts">
  import type { Either } from "../../internal/types";

  type $$Props = { of: string } & Either<
    "xxl" | "xs" | "sm" | "md" | "lg" | "xl"
  >;

  export let of: string;
  export let xs = false;
  export let sm = false;
  export let md = false;
  export let lg = false;
  export let xl = false;
  export let xxl = false;

  $: size = xxl ? 104 : xl ? 44 : lg ? 32 : sm ? 21 : xs ? 16 : md ? 28 : 24;
  $: source = icons[`../icons/${of}.svg`];
</script>

{#if source}
  <div
    class="inline-block shrink-0"
    aria-hidden="true"
    style:height="{size}px"
    style:width="{size}px"
  >
    {@html source}
  </div>
{/if}
