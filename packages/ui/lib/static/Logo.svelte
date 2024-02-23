<script lang="ts">
  import Logo from "../../icons/amadeus.svg?raw";
  export let sm: boolean | "auto" = false;
</script>

<div class="flex items-center py-8 text-content-200">
  <div class="size-11">{@html Logo}</div>
  <span
    class="h-11 select-none text-2xl font-light"
    class:xl:block={sm === "auto"}
    class:hidden={sm}>madeus</span
  >
</div>
