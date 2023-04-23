<script lang="ts">
  import { Icon, Button } from "../../component";

  export let placeholder = "";
  export let value = "";
</script>

<label
  class="relative flex cursor-text touch-manipulation items-center gap-3 rounded-xl bg-highlight px-3 text-content-200 focus-within:bg-highlight-100"
>
  <slot />
  <input
    type="text"
    class="h-11 w-full touch-manipulation bg-transparent py-3 text-md text-content outline-none placeholder:text-content-200"
    bind:value
    {placeholder}
  />
  <div class="opacity-0 transition-opacity" class:opacity-100={value}>
    <Button disabled={!value} air on:click={() => (value = "")}>
      <Icon sm name="close" />
    </Button>
  </div>
</label>
