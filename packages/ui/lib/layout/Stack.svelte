<script lang="ts">
  import type { Either, HTMLProps } from "../../internal/types";
  import { tw } from "../../internal/tailwind";
  import { setContext } from "svelte";

  type $$Props = {
    class?: string;
  } & (Either<"x" | "z"> & HTMLProps["div"]);

  let classes = "";
  export { classes as class };
  export let x = false;
  export let z = false;

  setContext("stack", x ? "x" : z ? "z" : "y");
</script>

<div
  {...$$restProps}
  class={tw`flex grow flex-col 
  ${x && "flex-row"}
  ${z && "grid max-h-max max-w-max [&>*]:col-start-1 [&>*]:row-start-1"}
  ${classes}`}
>
  <slot />
</div>
