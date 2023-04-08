<script lang="ts" context="module">
  import { writable, type Writable } from "svelte/store";
  export type Tabs = {
    container: Writable<number>;
    align: {
      target: number;
      count: number;
      gap: number;
    };
  };
</script>

<script lang="ts">
  import { setContext } from "svelte";

  export let gap = 16;

  const container = writable(0);
  setContext<Tabs>("tabs", {
    align: { gap, target: 0, count: 0 },
    container,
  });
</script>

<div
  bind:clientWidth={$container}
  class="grid min-h-full w-full snap-x snap-mandatory overflow-y-hidden overflow-x-scroll scroll-smooth"
  style="grid: 100% / auto-flow 100%; perspective: 1px; perspective-origin: top left;"
>
  <slot />
</div>
