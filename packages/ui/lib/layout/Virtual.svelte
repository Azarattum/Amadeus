<script context="module" lang="ts">
  import { writable } from "svelte/store";

  export type EditEvent<T> = CustomEvent<{
    action: "rearrange" | "purge" | "push";
    after: T | undefined;
    index: number;
    item: T;
  }>;

  type Transfer<T = any, K = any> = {
    group: HTMLElement | string;
    owner: HTMLElement;
    offset: DOMRect;
    back?: DOMRect;
    data: T;
    key: K;
  };
  let transfer = writable<Transfer | null>(null);
</script>

<script lang="ts">
  import { createEventDispatcher, onMount, tick } from "svelte";
  import { getScrollParent } from "../../internal/util";
  import { minmax } from "@amadeus-music/util/math";
  import { position } from "../../internal/pointer";
  import { resize, drag, hold } from "../../action";
  import { Portal } from "../../component";
  type T = $$Generic;
  type K = $$Generic;
  type P = $$Generic<number>;
  type Prerender = P & (P extends 0 ? never : NonNullable<unknown>);
  type $$Slots = { default: { index: number; item: T } };

  const dispatch = createEventDispatcher<{
    edit: EditEvent<T>["detail"];
    end: void;
  }>();

  export let gap = 0;
  export let items: T[];
  export let move = false;
  export let fixed = false;
  export let columns: number | string = 1;
  export let key = (x: T) => x as any as K;
  export let animate: boolean | number = false;
  export let sortable: boolean | string = false;
  export let container: HTMLElement | undefined = undefined;

  export let batch = 1;
  export let overscan = 1;
  export let prerender = 1 as Prerender;

  /* === Virtual Logic === */
  let wrapper: HTMLElement | null = null;
  let scroll = { x: 0, y: 0 };
  let outer = new DOMRect();
  let inner = new DOMRect();
  let ended = false;
  let rowHeight = 1;
  let perRow = 0;
  let offset = 0;

  $: rows = Math.ceil(outer.height / rowHeight) + overscan * 2;
  $: length = outer.height ? rows * perRow : prerender;

  $: pageHeight = rowHeight * batch;
  $: pageOffset = offset - pageHeight / 2;
  $: page = ~~((scroll.y - pageOffset) / pageHeight);
  $: totalHeight = Math.ceil(items.length / perRow) * rowHeight - gap;

  $: start = (page * batch - overscan) * perRow;
  $: from = Math.max(start, 0);
  $: to = Math.min(start + length, items.length);

  $: duration = animate === true ? 300 : animate || 0;
  $: order = Array.from({ length }).map((_, i) => i);
  $: index = reindex(items);

  $: gridRows = `repeat(${rows},${rowHeight <= 1 ? "auto" : rowHeight - gap + "px"})`;
  $: gridCols = Number.isInteger(columns)
    ? `repeat(${columns},1fr)`
    : `repeat(auto-fill,minmax(min(100%,${columns}),1fr))`;

  $: if (Number.isFinite(totalHeight)) {
    requestAnimationFrame(measure);
    ended = false;
  }
  $: if (!ended && to >= items.length - length / 2) {
    dispatch("end");
    ended = true;
  }

  function reindex(items: T[]) {
    if (!index && items.length) tick().then(measure);
    const reindexed = new Map<K, number>();
    const reordered = Array.from<number>({ length });
    const unused = new Set(order);

    for (let i = 0; i < items.length; i++) {
      const id = key(items[i]);
      if (id == null) continue;
      reindexed.set(id, i);

      if (i < from || i >= to) continue;
      const before = index?.get(id);

      if (before == null || before < from || before >= to) continue;
      reordered[i % length] = order[before % length];
      unused.delete(order[before % length]);

      if (before === i || !animate) continue;
      if ($transfer?.owner === wrapper && id === $transfer?.key) continue;
      const y = ~~(before / perRow) - ~~(i / perRow);
      const x = ~~(before % perRow) - ~~(i % perRow);
      transform(before, x, y);
    }
    const unusedArray = [...unused];
    order = reordered.map((x) => x ?? unusedArray.shift());
    return reindexed;
  }

  function transform(id: number, x: number, y: number) {
    const target = wrapper?.children.item(id - from);
    const transform = [
      `translate3d(${x * 100}%,${y * 100}%,0)`,
      `translate3d(0,0,0)`,
    ];
    target?.animate(
      { zIndex: ["100", "100"], transform },
      { composite: "accumulate", easing: "ease", duration },
    );
  }

  function measure() {
    if (!container || !wrapper) return;
    inner = wrapper.parentElement?.getBoundingClientRect() as DOMRect;
    outer = container.getBoundingClientRect();
    inner.y += scroll.y;
    offset = inner.y - outer.y;
    inner.width += gap;
    const target = wrapper.firstElementChild;
    if (!target) return;
    const { height, width } = target.getBoundingClientRect();
    if (!width || !height) return;
    perRow = ~~(inner.width / (width + gap));
    rowHeight = height + gap;
  }

  /* === Sortable Logic === */
  let rollback: number | undefined;
  let original: number | undefined;
  let cursor = { x: 0, y: 0 };

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
      tick().then(() => (items = items));
    }
    if (!passive && wrapper) $transfer.owner = wrapper;
  }

  async function retract() {
    if (!sortable || !$transfer || original == null) return;
    const index = items.findIndex((x) => key(x) === $transfer?.key);
    if ($transfer.owner === wrapper) {
      if (~index) {
        const target = wrapper.children.item(index - from) as HTMLElement;
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
    function scroller(event: Event) {
      const target = event.currentTarget as HTMLElement;
      scroll.x = target.scrollLeft;
      scroll.y = target.scrollTop;
    }

    if (!container) container = getScrollParent(wrapper);
    const unsubscribe = sortable && position.subscribe((x) => (cursor = x));
    container.addEventListener("scroll", scroller, { passive: true });
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

<div class="shrink-0 contain-layout" style:height="{totalHeight}px">
  <div
    class="grid *:will-change-transform *:[overflow-anchor:none]"
    style:transform="translate3d(0,{Math.ceil(from / perRow) * rowHeight}px,0)"
    style:contain={Number.isFinite(totalHeight) ? "layout size" : "layout"}
    class:pointer-events-none={!!$transfer}
    style:grid-template-columns={gridCols}
    style:grid-template-rows={gridRows}
    style:gap="{gap}px"
    bind:this={wrapper}
    use:drag={"hold"}
    use:hold
  >
    {#each { length: Math.max(to - from, 0) } as _, i (order[(from + i) % length] ?? i)}
      {@const index = from + i}
      {@const item = items[index]}
      {@const id = key(item)}
      <div
        draggable={sortable && id != null ? "true" : undefined}
        class:invisible={$transfer?.owner === wrapper && $transfer?.key === id}
      >
        <slot {index} {item} />
      </div>
    {/each}
  </div>
  {#if sortable}
    <Portal to="overlay">
      {#if $transfer?.owner === wrapper}
        <div
          class="absolute will-change-transform contain-[size_layout]"
          style:transform="translate3d(
          {$transfer.back
            ? $transfer.back.x
            : cursor.x +
              Math.max($transfer.offset.x, -inner.width / perRow + gap)}px,
          {$transfer.back
            ? $transfer.back.y
            : cursor.y + Math.max($transfer.offset.y, -rowHeight + gap)}px, 0)"
          style:width="{inner.width / perRow - gap}px"
          class:transition-transform={$transfer.back}
          style:height="{rowHeight - gap}px"
        >
          <slot item={$transfer.data} index={NaN} />
        </div>
      {/if}
    </Portal>
  {/if}
</div>

<svelte:window on:dragend={retract} on:dragstart={grab} />
