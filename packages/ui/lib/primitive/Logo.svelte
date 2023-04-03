<script lang="ts">
  import Icon from "./Icon.svelte";
  export let sm: boolean | "auto" = false;
</script>

<div class="flex items-center p-8 text-content-200">
  <Icon name="amadeus" xl />
  <span
    class="select-none text-2xl font-light"
    class:hidden={sm}
    class:xl:block={sm === "auto"}>madeus</span
  >
</div>
