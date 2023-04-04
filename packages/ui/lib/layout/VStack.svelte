<script lang="ts">
  import { setContext } from "svelte";
  setContext("stack", "vertical");

  export let gap: boolean | "sm" | "lg" | "xl" = false;
  export let center = false;
  export let grow = false;
  export let p = false;
</script>

<div
  class="flex flex-col"
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
