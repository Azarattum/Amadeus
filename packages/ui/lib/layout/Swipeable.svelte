<script lang="ts">
  import { intersection, type IntersectionEvent } from "../../action";
  import { createEventDispatcher } from "svelte";

  const active = [false, false] as [boolean, boolean];
  const dispatch = createEventDispatcher<{
    before: undefined;
    after: undefined;
  }>();

  let wheel = 0;

  function finish() {
    if (active[0]) dispatch("before");
    if (active[1]) dispatch("after");
  }

  function intersected(id: 0 | 1) {
    return ({ detail }: IntersectionEvent) => {
      if (active[id] && ((!id && wheel < 0) || (id && wheel > 0))) finish();
      active[id] = detail.isIntersecting;
    };
  }
</script>

<div
  class="grid w-full snap-x snap-mandatory overflow-y-hidden overflow-x-scroll rounded-lg transition-colors duration-300 ease-linear will-change-transform"
  style="grid: auto / auto-flow {$$slots.before ? '1fr ' : ''}100%{$$slots.after
    ? ' 1fr'
    : ''};"
  class:bg-primary-600={active[0] || active[1]}
  on:wheel|passive={({ deltaX }) => (wheel = deltaX)}
  on:touchend={finish}
>
  {#if $$slots.before}
    <div
      use:intersection={0.5}
      on:intersect={intersected(0)}
      class="flex items-center px-4 text-content-200 transition-colors"
      style="scroll-snap-align: none;"
      class:text-white={active[0]}
    >
      <slot name="before" />
    </div>
  {/if}
  <div class="snap-center snap-always"><slot /></div>
  {#if $$slots.after}
    <div
      use:intersection={0.5}
      on:intersect={intersected(1)}
      class="flex items-center px-4 text-content-200 transition-colors"
      class:text-white={active[1]}
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
