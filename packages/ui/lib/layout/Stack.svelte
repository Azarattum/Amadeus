<script lang="ts">
  import type { HTMLProps, Either } from "../../internal/types";
  import { type Classes, tw } from "../../internal/tailwind";
  import { setContext } from "svelte";

  type $$Props = Either<{ x: boolean; z: boolean }> &
    Omit<HTMLProps["div"], "class"> & { class?: Classes };

  let classes: Classes = "";
  export { classes as class };
  export let x = false;
  export let z = false;

  setContext("stack", x ? "x" : z ? "z" : "y");
</script>

<div
  {...$$restProps}
  class={tw`flex grow flex-col 
  ${x && "flex-row"}
  ${z && "grid max-h-max max-w-max *:col-start-1 *:row-start-1"}
  ${classes}`}
>
  <slot />
</div>
