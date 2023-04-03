<script lang="ts">
  import Icon from "./Icon.svelte";

  export let label = "";
  export let value = "";
  export let icon = "";

  const id = Math.random().toString();
</script>

<div class="relative text-content-200">
  <div
    class="items pointer-events-none absolute flex aspect-square h-full content-center items-center justify-center"
  >
    <Icon name={icon} />
  </div>
  <input
    type="text"
    class="bg-highlight focus:bg-highlight-100 text-md h-11 w-full rounded-xl p-3 text-content outline-none placeholder:text-content-200"
    class:indent-8={icon}
    {id}
    bind:value
    placeholder={label}
  />
</div>
