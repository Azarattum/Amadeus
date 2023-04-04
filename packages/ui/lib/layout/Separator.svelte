<script lang="ts">
  import { getContext } from "svelte";

  export let vertical = getContext("stack") === "horizontal";
</script>

<hr class="border-highlight {vertical ? 'h-full w-0 border-r' : 'w-full'}" />
