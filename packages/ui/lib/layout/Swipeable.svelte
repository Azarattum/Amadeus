<script lang="ts">
  import { type IntersectionEvent, intersection } from "../../action";
  import { type Classes, tw } from "../../internal/tailwind";
  import { createEventDispatcher } from "svelte";

  let classes: Classes = "";
  export { classes as class };

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
  class={tw`grid grow snap-x snap-mandatory grid-cols-[auto_100%_auto] overflow-x-scroll rounded-lg transition-colors duration-300 ease-linear will-change-transform ${classes}`}
  on:wheel|passive={({ deltaX }) => (wheel = deltaX)}
  class:bg-primary-600={active[0] || active[1]}
  on:touchend={finish}
>
  <div
    class="flex items-center px-4 text-content-200 transition-colors contain-paint"
    on:intersect={intersected(0)}
    class:text-white={active[0]}
    use:intersection={0.5}
  >
    <slot name="before" />
  </div>
  <div class="snap-center snap-always"><slot /></div>
  <div
    class="flex items-center px-4 text-content-200 transition-colors contain-paint"
    on:intersect={intersected(1)}
    class:text-white={active[1]}
    use:intersection={0.5}
  >
    <slot name="after" />
  </div>
</div>

<style>
  .grid::-webkit-scrollbar {
    display: none;
  }
  .grid {
    scrollbar-width: none;
  }
</style>
