<script context="module" lang="ts">
  const icons = import.meta.glob("../icons/*.svg", { eager: true, as: "raw" });
</script>

<script lang="ts">
  import { type Classes, tw } from "../../internal/tailwind";
  import type { Either } from "../../internal/types";

  type $$Props = { class?: Classes; of: string } & Either<
    "xxl" | "xs" | "sm" | "md" | "lg" | "xl"
  >;

  let classes: Classes = "";
  export { classes as class };
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
    class={tw`inline-block shrink-0 ${classes}`}
    aria-hidden="true"
    style:height="{size}px"
    style:width="{size}px"
  >
    {@html source}
  </div>
{/if}
