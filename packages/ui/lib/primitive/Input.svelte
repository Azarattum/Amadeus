<script lang="ts">
  import { uuid } from "../../internal/util";
  import Icon from "./Icon.svelte";

  export let label = "";
  export let value = "";
  export let icon = "";

  const id = uuid();
</script>

<div class="relative text-content-200">
  <div
    class="items pointer-events-none absolute flex aspect-square h-full content-center items-center justify-center"
  >
    <Icon name={icon} />
  </div>
  <input
    type="text"
    class="h-11 w-full rounded-xl bg-highlight p-3 text-md text-content outline-none placeholder:text-content-200 focus:bg-highlight-100"
    class:indent-8={icon}
    {id}
    bind:value
    placeholder={label}
  />
</div>
