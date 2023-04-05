<script lang="ts">
  import { setContext } from "svelte";

  export let gap: boolean | "sm" | "lg" | "xl" = false;
  export let baseline = false;
  export let center = false;
  export let grow = false;
  export let p = false;
  export let x = false;
  export let z = false;

  setContext("stack", x ? "x" : z ? "z" : "y");
</script>

<div
  class="flex"
  class:flex-col={!x && !z}
  class:items-baseline={baseline}
  class:items-center={center}
  class:gap-1={gap === "sm"}
  class:gap-2={gap === true}
  class:gap-4={gap === "lg"}
  class:gap-8={gap === "xl"}
  class:p-4={p === true}
  class:flex-grow={grow}
>
  <slot />
</div>
