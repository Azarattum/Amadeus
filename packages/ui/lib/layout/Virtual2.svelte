<script lang="ts">
  import { intersection, resize } from "../../action";
  import { lock } from "@amadeus-music/util/async";
  import { onMount, tick } from "svelte";
  type T = $$Generic;

  export let items: T[];
  export let overthrow = 1;
  export let columns: number | string = 1;
  export let key = <R>(x: T) => x as any as R;
  export let container: HTMLElement | undefined = undefined;

  let wrapper: HTMLElement;
  let rowHeight = 1;
  let perRow = 0;
  let active = 0;

  $: start = Math.max(active - overthrow, 0);
  $: height = Math.ceil(items.length / perRow) * rowHeight;
  $: perView = Math.ceil((container?.offsetHeight || 0) / rowHeight) * perRow;
  $: viewHeight = (perView / perRow) * rowHeight;
  $: template = Number.isInteger(columns)
    ? `repeat(${columns},1fr)`
    : `repeat(auto-fill,minmax(min(100%,${columns}),1fr))`;
  $: chunks = perView
    ? Array.from({ length: Math.ceil(items.length / perView) }).map((_, i) =>
        items.slice(i * perView, (i + 1) * perView)
      )
    : items.length
    ? (tick().then(measure), [[items[0]]])
    : [];

  async function reflow(rect: DOMRect) {
    if (!viewHeight) return;
    active -= Math.round(rect.y / viewHeight);

    const trigger = wrapper.firstElementChild;
    if (!trigger) return;
    const { resolve, wait } = lock<boolean>();
    const ok = () => resolve(false);
    requestAnimationFrame(() => requestAnimationFrame(() => resolve(true)));
    trigger.addEventListener("viewenter", ok, { once: true });
    if (await wait()) reflow(trigger.getBoundingClientRect());
    trigger.removeEventListener("viewenter", ok);
  }

  function measure() {
    const target = wrapper?.firstElementChild?.nextElementSibling;
    if (!target) return;
    const { width, height } = target.getBoundingClientRect();
    if (!width || !height) return;
    perRow = ~~((container?.offsetWidth || 0) / width);
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

<div class="contain-[size_layout]" style:height="{height}px">
  <div
    class="grid auto-rows-max will-change-transform contain-content"
    style:transform="translate3d(0,{start * viewHeight}px,0)"
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
    {#each chunks.slice(start, active + overthrow + 1) as chunk, i (start + i)}
      {#each chunk as item, j (key(item))}
        <slot {item} index={(start + i) * perView + j} />
      {/each}
    {/each}
  </div>
</div>
