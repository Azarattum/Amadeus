<script lang="ts">
  import { Icon } from "../../component";
  export let sm: boolean | "auto" = false;
</script>

<div class="flex items-center py-8 text-content-200">
  <Icon of="amadeus" xl />
  <span
    class="h-11 select-none text-2xl font-light"
    class:xl:block={sm === "auto"}
    class:hidden={sm}>madeus</span
  >
</div>
