<script lang="ts" context="module">
  import { writable, type Writable } from "svelte/store";
  export type Tabs = {
    container: Writable<{ width: number; height: number }>;
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

  const container = writable({ height: 0, width: 0, scroll: 0 });
  setContext<Tabs>("tabs", {
    align: { gap, target: 0, count: 0 },
    container,
  });
</script>

<div
  bind:clientHeight={$container.height}
  bind:clientWidth={$container.width}
  class="grid min-h-full w-full snap-x snap-mandatory overflow-y-hidden overflow-x-scroll scroll-smooth"
  style="grid: 100% / auto-flow 100%; perspective: 1px;"
>
  <slot />
</div>
