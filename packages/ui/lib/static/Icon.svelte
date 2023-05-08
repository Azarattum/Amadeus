<script lang="ts" context="module">
  const icons = import.meta.glob("../icons/*.svg", { eager: true, as: "raw" });
</script>

<script lang="ts">
  import type { Either } from "../../internal/types";

  type $$Props = { name: string } & Either<
    "xs" | "sm" | "md" | "lg" | "xl" | "xxl"
  >;

  export let name: string;
  export let xs = false;
  export let sm = false;
  export let md = false;
  export let lg = false;
  export let xl = false;
  export let xxl = false;

  $: size = xxl ? 104 : xl ? 44 : lg ? 32 : sm ? 21 : xs ? 16 : md ? 28 : 24;
  $: source = icons[`../icons/${name}.svg`];
</script>

{#if source}
  <div
    style:width="{size}px"
    style:height="{size}px"
    class="inline-block shrink-0"
    aria-hidden="true"
  >
    {@html source}
  </div>
{/if}
