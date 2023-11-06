<script lang="ts">
  import { type Classes, tw } from "../../internal/tailwind";
  import { getContext, setContext } from "svelte";
  import { uuid } from "../../internal/util";
  import { writable } from "svelte/store";

  let classes: Classes = "";
  export { classes as class };
  export let size: number;
  export let value = 0;

  const id = uuid();
  const selected = writable(value);
  const panel = !!getContext("panel");
  $: value = $selected;
  $: selected.set(value);
  setContext("group", { value: selected, size, i: 0, id });

  const style = Array.from({ length: size })
    .map(
      (_, i) =>
        `#${id} :has([name="${id}"]:checked):nth-last-of-type(${i + 1})` +
        `~div:last-child{transform:translateX(calc(` +
        `${(size - i - 1) * 100}% + ${(size - i - 1) * 8}px` +
        `));}`,
    )
    .join("");
</script>

<div
  class={tw`relative z-10 grid min-w-max grow touch-manipulation justify-around justify-items-center gap-2 rounded-lg p-0.5 outline-2 outline-offset-2 outline-primary-600 [&:has(input:focus-visible)]:outline
    ${!panel && "bg-highlight"} ${classes}`}
  {id}
  style:grid-template-columns="repeat({size}, minmax(0, 1fr))"
>
  <slot />
  <div
    class="pointer-events-none absolute left-0.5 top-0.5 -z-10 rounded-md bg-primary-600 transition-transform"
    style:width="calc(({100}% - {0.5 * (size - 1) + 0.25}rem) / {size})"
    style:height="calc({100}% - 0.25rem)"
  />
</div>

<svelte:head>
  <svelte:element this="style">{style}</svelte:element>
</svelte:head>
