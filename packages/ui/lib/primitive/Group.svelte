<script lang="ts">
  import Portal from "../layout/Portal.svelte";
  import { uuid } from "../../internal/util";
  import { writable } from "svelte/store";
  import { setContext } from "svelte";

  export let size: number;
  export let value = 0;

  const id = uuid();
  const selected = writable(value);
  $: value = $selected;
  $: selected.set(value);
  setContext("group", { id, size, value: selected, i: 0 });

  const style = Array.from({ length: size })
    .map(
      (_, i) =>
        `#${id}>input:checked:nth-last-of-type(${i + 1})` +
        ` ~ div:last-child { transform: translateX(calc(` +
        `${(size - i - 1) * 100}% + ${(size - i - 1) * 8}px` +
        `));}`
    )
    .join("");
</script>

<Portal before unique={id}>
  <svelte:element this="style">{style}</svelte:element>
</Portal>

<div
  {id}
  style:grid-template-columns="repeat({size}, minmax(0, 1fr))"
  class="relative z-10 grid w-max min-w-max touch-manipulation justify-around justify-items-center gap-2 rounded-lg bg-highlight p-0.5 outline-2 outline-offset-2 outline-primary-600 [&:has(input:focus-visible)]:outline"
>
  <slot />
  <div
    class="pointer-events-none absolute left-0.5 top-0.5 -z-10 rounded-md bg-primary-600 transition-transform"
    style:width="calc(({100}% - {0.5 * (size - 1) + 0.25}rem) / {size})"
    style:height="calc({100}% - 0.25rem)"
  />
</div>
