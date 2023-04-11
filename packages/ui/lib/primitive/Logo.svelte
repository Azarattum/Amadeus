<script lang="ts">
  import { Icon } from "../../component";
  export let sm: boolean | "auto" = false;
</script>

<div class="flex items-center py-8 text-content-200">
  <Icon name="amadeus" xl />
  <span
    class="h-11 select-none text-2xl font-light"
    class:hidden={sm}
    class:xl:block={sm === "auto"}>madeus</span
  >
</div>
