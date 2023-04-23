<script lang="ts">
  import { intersection, resize, type IntersectionEvent } from "../../action";
  import { onMount, tick } from "svelte";
  type T = $$Generic;

  export let items: T[];
  export let overthrow = 1;
  export let columns: number | string = 1;
  export let key = <R>(x: T) => x as any as R;
  export let container: HTMLElement | undefined = undefined;

  let chunks: T[][] = [];
  let wrapper: HTMLElement;
  let active = 0;
  let perRow = 0;
  let rowHeight = 0;

  $: start = Math.max(active - overthrow, 0);
  $: height = Math.ceil(items.length / perRow) * rowHeight;
  $: perView = Math.ceil((container?.offsetHeight || 0) / rowHeight) * perRow;
  $: viewHeight = (perView / perRow) * rowHeight;
  $: template = Number.isInteger(columns)
    ? `repeat(${columns},1fr)`
    : `repeat(auto-fill,minmax(min(100%,${columns}),1fr))`;

  function update({ detail }: IntersectionEvent) {
    active += Math.round(
      (detail.intersectionRect.y - detail.boundingClientRect.y) / viewHeight
    );
  }

  async function measure() {
    if (!container || !wrapper) return;
    chunks = [[]];
    rowHeight = 0;
    active = 0;
    let i = 0;
    do {
      chunks[0].push(items[i++]);
      chunks = chunks;
      await tick();
      if (!rowHeight) rowHeight = wrapper.offsetHeight;
    } while (wrapper.offsetHeight <= rowHeight && items[i]);
    perRow = i - 1;
    await tick();
    for (let i = 0; i < Math.ceil(items.length / perView); i++) {
      chunks[i] = items.slice(i * perView, (i + 1) * perView);
    }
  }

  onMount(() => {
    if (!container) container = wrapper.parentElement?.parentElement as any;
    if (!container) throw new Error("Virtual list needs a container!");
    if (typeof columns === "string") {
      container.addEventListener("resize", measure);
      const { destroy } = resize(container);
      return () => {
        container?.removeEventListener("resize", measure);
        destroy();
      };
    } else measure();
  });
</script>

<div class="contain-[size_layout]" style:height="{height}px">
  <div
    class="grid auto-rows-max will-change-transform contain-content"
    style:transform="translate3d(0,{start * viewHeight}px,0)"
    style:grid-template-columns={template}
    bind:this={wrapper}
  >
    <div
      style:transform="translateY({+!!active * overthrow * 100}%)"
      style:height="{viewHeight}px"
      on:viewleave={update}
      use:intersection
      class="absolute"
      aria-hidden
    />
    {#each chunks.slice(start, active + overthrow + 1) as chunk, i (start + i)}
      {#each chunk as item, j (key(item))}
        <slot {item} index={(start + i) * perView + j} />
      {/each}
    {/each}
  </div>
</div>
