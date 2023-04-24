<script lang="ts">
  import { intersection, resize } from "../../action";
  import { lock } from "@amadeus-music/util/async";
  import { onMount, tick } from "svelte";
  type T = $$Generic;
  type R = $$Generic;

  export let items: T[];
  export let overthrow = 1;
  export let columns: number | string = 1;
  export let key = (x: T) => x as any as R;
  export let animate: number | boolean = false;
  export let container: HTMLElement | undefined = undefined;

  let outer = new DOMRect();
  let inner = new DOMRect();
  let wrapper: HTMLElement;
  let rowHeight = 1;
  let perRow = 0;
  let active = 0;

  $: perView = Math.ceil(outer.height / rowHeight) * perRow;
  $: from = Math.max(active - overthrow, 0) * perView;
  $: to = Math.max((active + overthrow + 1) * perView, 1);
  $: max = ~~(items.length / perView);
  $: slice = items.slice(from, to);
  $: index = reindex(items);

  $: totalHeight = Math.ceil(items.length / perRow) * rowHeight;
  $: viewHeight = (perView / perRow) * rowHeight;
  $: template = Number.isInteger(columns)
    ? `repeat(${columns},1fr)`
    : `repeat(auto-fill,minmax(min(100%,${columns}),1fr))`;

  async function reflow(rect: DOMRect) {
    if (!viewHeight) return;
    active -= Math.round(rect.y / viewHeight);
    if (active < 0) return (active = 0);
    if (active > max) return (active = max);

    const trigger = wrapper?.firstElementChild;
    if (!trigger) return;
    const { resolve, wait } = lock<boolean>();
    const ok = () => resolve(false);
    requestAnimationFrame(() => requestAnimationFrame(() => resolve(true)));
    trigger.addEventListener("viewenter", ok, { once: true });
    if (await wait()) reflow(trigger.getBoundingClientRect());
    trigger.removeEventListener("viewenter", ok);
  }

  function reindex(items: T[]) {
    if (!index && items.length) tick().then(measure);
    if (!animate || !items.length) return;
    const reindexed = new Map<R, number>();

    for (let i = 0; i < items.length; i++) {
      const id = key(items[i]);
      reindexed.set(id, i);

      if (i < from || i >= to) continue;
      const before = index?.get(id);
      if (before == null) continue;
      const y = ~~(before / perRow) - ~~(i / perRow);
      const x = ~~(before % perRow) - ~~(i % perRow);
      if (y || x) transform(before - from, x, y);
    }
    return reindexed;
  }

  function transform(element: number, x: number, y: number) {
    const target = wrapper.children.item(element + 1) as HTMLElement;
    if (!target || target.style.visibility === "hidden") return;
    const transform = [
      `translate3d(${x * 100}%,${y * 100}%,0)`,
      `translate3d(0,0,0)`,
    ];
    target.animate(
      { transform },
      {
        easing: "ease",
        composite: "accumulate",
        duration: animate === true ? 300 : animate || 0,
      }
    );
  }

  function measure() {
    if (!container || !wrapper) return;
    outer = container.getBoundingClientRect();
    inner = wrapper.getBoundingClientRect();
    const target = wrapper.firstElementChild?.nextElementSibling;
    if (!target) return;
    const { width, height } = target.getBoundingClientRect();
    if (!width || !height) return;
    perRow = ~~(outer.width / width);
    rowHeight = height;
  }

  onMount(() => {
    if (!container) container = wrapper.parentElement?.parentElement as any;
    if (!container) throw new Error("Virtual list needs a container!");
    container.addEventListener("resize", measure);
    const { destroy } = resize(container);
    return () => (container?.removeEventListener("resize", measure), destroy());
  });
</script>

<div class="contain-[size_layout]" style:height="{totalHeight}px">
  <div
    class="grid auto-rows-max will-change-transform contain-content"
    style:transform="translate3d(0,{Math.ceil(from / perRow) * rowHeight}px,0)"
    style:grid-template-columns={template}
    bind:this={wrapper}
  >
    <div
      style:transform="translateY({+!!active * overthrow * 100}%)"
      on:viewleave={(x) => reflow(x.detail.boundingClientRect)}
      style:height="{viewHeight}px"
      use:intersection
      class="absolute"
      aria-hidden
    />
    {#each slice as item, i (key(item))}
      <div style="overflow-anchor: none;">
        <slot {item} index={from + i} />
      </div>
    {/each}
  </div>
</div>
