<script lang="ts">
  import { createEventDispatcher, onDestroy } from "svelte";
  import { rigid, select } from "$lib/util/haptic";
  import draggable from "$lib/action/draggable";
  import { position } from "$lib/store/pointer";
  import { minmax } from "$lib/util/math";
  import hold from "$lib/action/hold";

  import Virtual from "$lib/layout/Virtual.svelte";

  export let items: any[];
  export let animation = 0;
  export let dragging = false;
  export let container: HTMLElement | null = null;
  export let attributes: Record<string, string> = {};

  export let scroll = 0;
  export let offset = 0;
  export let height = 0;
  export let wrapper: HTMLElement | null = null;

  let destroy = () => {};
  let bounds: { top: number; bottom: number } | undefined;
  const dispatch = createEventDispatcher<{ sort: any[] }>();

  $: bounds = dragging ? container?.getBoundingClientRect() : undefined;
  $: pointer = bounds ? minmax($position.y, bounds.top, bounds?.bottom) : NaN;
  $: location = bounds ? pointer - bounds.top - offset + scroll : NaN;
  $: hovering = minmax(Math.floor(location / height), 0, items.length - 1);
  $: if (Number.isInteger(hovering)) swap();
  $: previous = hovering;
  $: if (wrapper) {
    destroy();
    const target = wrapper;

    const holdAction = hold(target);
    const dragAction = draggable(target, {
      duration: animation,
      mode: "children",
      trigger: "hold",
    });

    const enable = () => (dragging = true) || rigid();
    const disable = () => (dragging = false) || dispatch("sort", items);
    target.addEventListener("dragend", disable);
    target.addEventListener("dragstart", enable);

    destroy = () => {
      dragAction.destroy();
      holdAction.destroy();
      target.removeEventListener("dragend", disable);
      target.removeEventListener("dragstart", enable);
    };
  }

  function swap() {
    if (Number.isNaN(previous)) return;
    const [item] = items.splice(previous, 1);
    items.splice(hovering, 0, item);
    requestAnimationFrame(() => (items = items));
    select();
  }

  onDestroy(destroy);
</script>

<Virtual
  {items}
  {animation}
  attributes={{ ...attributes, draggable: "true" }}
  bind:container
  bind:wrapper
  bind:scroll
  bind:offset
  bind:height
  let:index
  let:item
  let:key
>
  <slot {item} {index} {key} />
</Virtual>
