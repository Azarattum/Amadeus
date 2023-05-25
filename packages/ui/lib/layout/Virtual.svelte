<script lang="ts" context="module">
  import { writable } from "svelte/store";

  export type EditEvent<T> = CustomEvent<{
    action: "push" | "purge" | "rearrange";
    after: T | undefined;
    index: number;
    item: T;
  }>;

  type Transfer<T = any, K = any> = {
    group: string | HTMLElement;
    owner: HTMLElement;
    offset: DOMRect;
    back?: DOMRect;
    data: T;
    key: K;
  };
  let transfer = writable<Transfer | null>(null);
</script>

<script lang="ts">
  import { drag, hold, intersection, resize } from "../../action";
  import { createEventDispatcher, onMount, tick } from "svelte";
  import { getScrollParent } from "../../internal/util";
  import { debounce } from "@amadeus-music/util/async";
  import { minmax } from "@amadeus-music/util/math";
  import { position } from "../../internal/pointer";
  import { Portal } from "../../component";
  type T = $$Generic;
  type K = $$Generic;
  type P = $$Generic<number>;
  type Prerender = P & (P extends 0 ? never : NonNullable<unknown>);
  type $$Slots = { default: { item: T; index: number } };

  const dispatch = createEventDispatcher<{
    edit: EditEvent<T>["detail"];
    end: void;
  }>();

  export let gap = 0;
  export let items: T[];
  export let move = false;
  export let fixed = false;
  export let overthrow = 1;
  export let prerender = 1 as Prerender;
  export let columns: number | string = 1;
  export let key = (x: T) => x as any as K;
  export let animate: number | boolean = false;
  export let sortable: boolean | string = false;
  export let container: HTMLElement | undefined = undefined;

  /* === Virtual Logic === */
  let wrapper: HTMLElement | null = null;
  let outer = new DOMRect();
  let inner = new DOMRect();
  let visible = false;
  let ended = false;
  let rowHeight = 1;
  let perRow = 0;
  let active = 0;

  $: perView = Math.ceil(outer.height / rowHeight) * perRow;
  $: from = Math.max(active - overthrow, 0) * perView;
  $: to = Math.max((active + overthrow + 1) * perView, prerender);
  $: max = ~~(items.length / perView);
  $: slice = items.slice(from, to);
  $: index = reindex(items);

  $: duration = animate === true ? 300 : animate || 0;
  $: totalHeight = Math.ceil(items.length / perRow) * rowHeight - gap;
  $: viewHeight = (perView / perRow) * rowHeight;
  $: template = Number.isInteger(columns)
    ? `repeat(${columns},1fr)`
    : `repeat(auto-fill,minmax(min(100%,${columns}),1fr))`;
  $: if (Number.isFinite(totalHeight)) tick().then(measure), (ended = false);

  function reflow(rect = wrapper?.firstElementChild?.getBoundingClientRect()) {
    if (!viewHeight || !rect) return;
    active -= Math.round((rect.y - outer.y) / viewHeight);
    if (!ended && active >= max - 1) dispatch("end"), (ended = true);
  }

  function reindex(items: T[]) {
    if (!index && items.length) tick().then(measure);
    if (!animate || !items.length) return;
    const reindexed = new Map<K, number>();

    for (let i = 0; i < items.length; i++) {
      const id = key(items[i]);
      if (id == null) continue;
      reindexed.set(id, i);

      if ($transfer?.owner === wrapper && id === $transfer?.key) continue;
      if (i < from || i >= to) continue;
      const before = index?.get(id);
      if (before == null) continue;
      const y = ~~(before / perRow) - ~~(i / perRow);
      const x = ~~(before % perRow) - ~~(i % perRow);
      if (y || x) transform(before, x, y);
    }
    return reindexed;
  }

  function transform(id: number, x: number, y: number) {
    const target = wrapper?.children.item(id - from + 1) as HTMLElement;
    if (!target || target.style.visibility === "hidden") return;
    const transform = [
      `translate3d(${x * 100}%,${y * 100}%,0)`,
      `translate3d(0,0,0)`,
    ];
    target.animate(
      { transform, zIndex: ["100", "100"] },
      { easing: "ease", composite: "accumulate", duration }
    );
  }

  function measure() {
    if (!container || !wrapper) return;
    inner = wrapper.parentElement?.getBoundingClientRect() as DOMRect;
    outer = container.getBoundingClientRect();
    inner.y += container.scrollTop;
    inner.width += gap;
    const target = wrapper.firstElementChild?.nextElementSibling;
    if (!target) return;
    const { width, height } = target.getBoundingClientRect();
    if (!width || !height) return;
    perRow = ~~(inner.width / (width + gap));
    rowHeight = height + gap;
  }

  /* === Sortable Logic === */
  let rollback: number | undefined;
  let original: number | undefined;
  let cursor = { x: 0, y: 0 };
  let scroll = { x: 0, y: 0 };

  $: id = sortable === true ? wrapper : sortable;
  $: pointerY =
    minmax(cursor.y + gap / 2, outer.top, outer.bottom, NaN) +
    scroll.y -
    inner.y;
  $: pointerX =
    minmax(cursor.x + gap / 2, inner.left, inner.right - gap - 1, NaN) +
    scroll.x -
    inner.x;
  $: hoveringY = Math.floor(pointerY / rowHeight);
  $: hoveringX = Math.floor(pointerX / (inner.width / perRow));
  $: hovering = minmax(hoveringY * perRow + hoveringX, 0, items.length - 1);
  $: if ($transfer?.group === id) claim(hovering);

  async function grab({ target }: DragEvent) {
    measure(); // Remeasure in case elements moved
    await tick();
    if (!sortable || !wrapper || !target || $transfer) return;
    if ((target as HTMLElement).parentElement !== wrapper) return;
    if (items[hovering] == null || key(items[hovering]) == null) return;
    original = hovering;
    rollback = move ? -1 : original;
    const offset = (target as Element).getBoundingClientRect();
    offset.x -= cursor.x;
    offset.y -= cursor.y;
    $transfer = {
      group: sortable === true ? wrapper : sortable,
      key: key(items[hovering]),
      data: items[hovering],
      owner: wrapper,
      offset,
    };
  }

  function claim(position: number, passive = false) {
    if (!sortable || !$transfer || fixed) return;
    if (key(items[position]) == null) return;
    if (!Number.isInteger(position)) {
      if (rollback != null && $transfer.owner !== wrapper) {
        claim(rollback, true);
        rollback = undefined;
      }
      return;
    }
    if (key(items[position]) === $transfer.key) return;
    if (position < 0 && !items.length) position = 0;

    const index = items.findIndex((x) => key(x) === $transfer?.key);
    if (index !== position) {
      if (!passive && rollback == null) (rollback = index), (original = index);
      if (~index) items.splice(index, 1);
      if (~position) items.splice(position, 0, $transfer.data);
      requestAnimationFrame(() => (items = items));
    }
    if (!passive && wrapper) $transfer.owner = wrapper;
  }

  async function retract() {
    if (!sortable || !$transfer || original == null) return;
    const index = items.findIndex((x) => key(x) === $transfer?.key);
    if ($transfer.owner === wrapper) {
      if (~index) {
        const target = wrapper.children.item(index - from + 1) as HTMLElement;
        if (target) {
          $transfer.back = target.getBoundingClientRect();
          $transfer.group = Math.random().toString();
          await new Promise((r) => setTimeout(r, 150));
        }
      }
    }
    if (original !== index) {
      const item = $transfer.data;
      const after = items[index - 1];
      const flag = (+!!~original << 1) + +!!~index;
      const action = ([undefined, "push", "purge", "rearrange"] as const)[flag];
      if (action) dispatch("edit", { action, index, after, item });
    }
    original = undefined;
    rollback = undefined;
    if ($transfer.owner === wrapper) $transfer = null;
  }

  onMount(() => {
    const fixFlow = debounce(() => visible || reflow(), 100);
    function scroller() {
      fixFlow();
      if (!sortable) return;
      scroll.x = container?.scrollLeft || 0;
      scroll.y = container?.scrollTop || 0;
    }

    if (!container) container = getScrollParent(wrapper);
    const unsubscribe = sortable && position.subscribe((x) => (cursor = x));
    container.addEventListener("scroll", scroller);
    container.addEventListener("resize", measure);
    const { destroy } = resize(container);
    return () => {
      container?.removeEventListener("scroll", scroller);
      container?.removeEventListener("resize", measure);
      if (unsubscribe) unsubscribe();
      destroy();
    };
  });
</script>

<div class="shrink-0 contain-[size_layout]" style:height="{totalHeight}px">
  <div
    class="grid auto-rows-max will-change-transform contain-layout"
    style:transform="translate3d(0,{Math.ceil(from / perRow) * rowHeight}px,0)"
    style:grid-template-columns={template}
    style:gap="{gap}px"
    class:pointer-events-none={!!$transfer}
    bind:this={wrapper}
    use:drag={"hold"}
    use:hold
  >
    <div
      style:transform="translateY({+!!active * overthrow * 100}%)"
      on:intersect={(x) => (visible = x.detail.isIntersecting)}
      on:viewleave={(x) => reflow(x.detail.boundingClientRect)}
      style:height="{viewHeight}px"
      use:intersection
      class="absolute z-50 w-0.5"
      aria-hidden
    />
    {#each slice as item, i (key(item) == null ? i : key(item))}
      <div
        class:invisible={$transfer?.owner === wrapper &&
          $transfer?.key === key(item)}
        draggable={sortable && key(item) != null ? "true" : undefined}
        style="overflow-anchor: none;"
      >
        <slot {item} index={from + i} />
      </div>
    {/each}
  </div>
  {#if sortable}
    <Portal to="overlay">
      {#if $transfer?.owner === wrapper}
        <div
          class="absolute will-change-transform contain-[size_layout]"
          class:transition-transform={$transfer.back}
          style:transform="translate3d(
          {$transfer.back
            ? $transfer.back.x
            : cursor.x +
              Math.max($transfer.offset.x, -inner.width / perRow + gap)}px,
          {$transfer.back
            ? $transfer.back.y
            : cursor.y + Math.max($transfer.offset.y, -rowHeight + gap)}px, 0)"
          style:width="{inner.width / perRow - gap}px"
          style:height="{rowHeight - gap}px"
        >
          <slot item={$transfer.data} index={NaN} />
        </div>
      {/if}
    </Portal>
  {/if}
</div>

<svelte:window on:dragstart={grab} on:dragend={retract} />
