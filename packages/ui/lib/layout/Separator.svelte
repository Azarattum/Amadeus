<script lang="ts">
  import { getContext } from "svelte";

  export let vertical = getContext("stack") === "x";
</script>

<hr
  class="border-highlight {vertical ? 'h-full w-0 border-r' : 'w-full'}"
  aria-hidden="true"
/>
