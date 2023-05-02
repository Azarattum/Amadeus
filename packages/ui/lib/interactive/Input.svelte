<script lang="ts">
  import { Icon, Button } from "../../component";
  import { getContext } from "svelte";

  export let placeholder = "";
  export let stretch = false;
  export let value = "";

  const panel = !!getContext("panel");
</script>

<label
  class="relative flex cursor-text touch-manipulation items-center gap-3 px-3 text-content-200
  {panel
    ? 'rounded-lg focus-within:bg-content/5 hover:bg-content/5'
    : 'rounded-xl bg-highlight focus-within:bg-highlight-100 hover:bg-highlight-100'}
  "
  class:w-full={stretch}
>
  <slot />
  <input
    type="text"
    class="h-11 w-full touch-manipulation bg-transparent py-3 text-md text-content outline-none placeholder:text-content-200"
    bind:value
    {placeholder}
  />
  <div
    class="opacity-0 transition-opacity"
    class:pointer-events-none={!value}
    class:opacity-100={value}
  >
    <Button disabled={!value} air on:click={() => (value = "")}>
      <Icon sm name="close" />
    </Button>
  </div>
</label>
