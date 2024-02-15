<script lang="ts">
  import { getScrollParent } from "../../internal/util";
  import { onMount } from "svelte";

  export let stuck = false;
  export let title = "";

  let trigger: HTMLDivElement;

  const scrollUp = () => trigger.scrollIntoView({ behavior: "smooth" });

  onMount(() => {
    const observer = new IntersectionObserver(
      ([entry]) => (stuck = entry.intersectionRatio < 0.8),
      { root: getScrollParent(trigger), threshold: 0.8 },
    );
    observer.observe(trigger);
    return () => observer.disconnect();
  });
</script>

<aside class="absolute left-0 top-0">
  <button
    class="fixed z-20 flex h-11 w-full origin-top scale-y-0 touch-manipulation select-none items-center justify-center border-b border-highlight bg-gradient-to-t from-surface/70 to-surface font-semibold opacity-0 backdrop-blur-md transition-composite will-change-composite sm:bg-inherit"
    tabindex="-1"
    class:scale-y-100={stuck}
    class:opacity-100={stuck}
    on:click={scrollUp}
  >
    <h2>{title}</h2>
  </button>
</aside>

<div
  class="relative z-10 transition-composite will-change-opacity"
  class:opacity-0={stuck}
  bind:this={trigger}
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
