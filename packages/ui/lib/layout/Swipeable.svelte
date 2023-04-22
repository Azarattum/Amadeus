<script lang="ts">
  import { createEventDispatcher, onMount } from "svelte";

  const dispatch = createEventDispatcher<{
    before: undefined;
    after: undefined;
  }>();

  let before: HTMLDivElement | undefined;
  let after: HTMLDivElement | undefined;
  let activeBefore = false;
  let activeAfter = false;
  let lastDelta = 0;

  function finish() {
    if (activeBefore) dispatch("before");
    if (activeAfter) dispatch("after");
  }

  onMount(() => {
    const observer = new IntersectionObserver(
      (entries) =>
        entries.forEach((entry) => {
          if (entry.target === before) {
            if (activeBefore && lastDelta < 0) finish();
            activeBefore = entry.isIntersecting;
          } else if (entry.target === after) {
            if (activeAfter && lastDelta > 0) finish();
            activeAfter = entry.isIntersecting;
          }
        }),
      { threshold: 0.5 }
    );
    if (before) observer.observe(before);
    if (after) observer.observe(after);
    return () => observer.disconnect();
  });
</script>

<div
  class="grid w-full snap-x snap-mandatory overflow-y-hidden overflow-x-scroll overscroll-none rounded-lg transition-colors duration-300 ease-linear"
  style="grid: auto / auto-flow 1fr 100% 1fr;"
  class:bg-primary-600={activeBefore || activeAfter}
  on:wheel={({ deltaX }) => (lastDelta = deltaX)}
  on:touchend={finish}
>
  {#if $$slots.before}
    <div
      bind:this={before}
      class="flex items-center px-4 text-content-200 transition-colors"
      style="scroll-snap-align: none;"
      class:text-white={activeBefore}
    >
      <slot name="before" />
    </div>
  {/if}
  <div class="snap-center snap-always"><slot /></div>
  {#if $$slots.after}
    <div
      bind:this={after}
      class="flex items-center px-4 text-content-200 transition-colors"
      class:text-white={activeAfter}
    >
      <slot name="after" />
    </div>
  {/if}
</div>

<style>
  .grid::-webkit-scrollbar {
    display: none;
  }
  .grid {
    scrollbar-width: none;
  }
</style>
