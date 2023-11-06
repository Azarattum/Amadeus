<script lang="ts">
  import { type Classes, Button, Icon, tw } from "../../component";
  import type { HTMLProps } from "../../internal/types";
  import { getContext } from "svelte";

  type $$Props = {
    resettable?: boolean;
    class?: Classes;
    value?: string;
  } & Omit<HTMLProps["input"], "class">;

  let classes: Classes = "";
  export { classes as class };
  export let resettable = false;
  export let value = "";

  const panel = !!getContext("panel");
</script>

<label
  class={tw`relative flex cursor-text touch-manipulation items-center gap-3 px-3 text-content-200
  ${
    panel
      ? "rounded-lg focus-within:bg-content/5 hover:bg-content/5"
      : "rounded-xl bg-highlight focus-within:bg-highlight-100 hover:bg-highlight-100"
  } ${classes}`}
>
  <slot />
  <input
    class="h-11 w-full touch-manipulation bg-transparent py-3 text-md text-content outline-none placeholder:text-content-200"
    type="text"
    {...$$restProps}
    bind:value
  />
  {#if resettable}
    <div
      class="opacity-0 transition-opacity"
      class:pointer-events-none={!value}
      class:opacity-100={value}
    >
      <Button air disabled={!value} on:click={() => (value = "")}>
        <Icon of="close" sm />
      </Button>
    </div>
  {/if}
</label>
