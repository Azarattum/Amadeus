<script lang="ts">
  import { intersection, type IntersectionEvent } from "../../action";

  export let title: string;
  export let stuck = false;

  let trigger: HTMLDivElement | undefined;

  const scrollUp = () => trigger?.scrollIntoView({ behavior: "smooth" });

  function scrolled({ detail }: IntersectionEvent) {
    const rect = detail.boundingClientRect;
    const root = detail.rootBounds;
    if (rect.x < detail.intersectionRect.x - 1) return;
    const right = (root?.x || 0) + (root?.width || 0);
    if (rect.x + rect.width - right > 5) return;
    stuck = detail.intersectionRatio < 0.8;
  }
</script>

<aside class="absolute left-0 top-0">
  <button
    tabindex="-1"
    on:click={scrollUp}
    class="fixed z-50 flex h-11 w-full origin-top scale-y-0 transform-gpu touch-manipulation select-none items-center justify-center border-b border-highlight bg-gradient-to-t from-surface/70 to-surface font-semibold opacity-0 backdrop-blur-md transition-composite will-change-transform sm:bg-inherit"
    class:scale-y-100={stuck}
    class:opacity-100={stuck}
  >
    <h2>{title}</h2>
  </button>
</aside>

<div
  bind:this={trigger}
  use:intersection={0.8}
  on:intersect={scrolled}
  class:opacity-0={stuck}
  class="transition-composite"
>
  <slot />
</div>

<style>
  /* Safari 15 fix for `position: fixed;` */
  @supports (-webkit-appearance: none) and (stroke-color: transparent) {
    @media not all and (min-resolution: 0.001dpcm) {
      .fixed {
        left: 0;
      }
    }
  }
</style>
