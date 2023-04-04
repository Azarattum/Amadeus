<script>
  import { uuid } from "../../internal/util";
  import Icon from "./Icon.svelte";

  export let checked = false;
  export let iconLeft = "";
  export let iconRight = "";
  export let label = "";
  export let target = "";

  const id = target || uuid();
</script>

<label
  class="group flex w-max cursor-pointer select-none items-center gap-2 p-[6px] text-content-200"
  for={id}
>
  {#if label}
    <span>{label}</span>
  {/if}
  <Icon name={iconLeft} />
  <div class="relative">
    {#if !target}
      <input
        type="checkbox"
        class="peer pointer-events-none absolute h-full w-full appearance-none rounded-2xl outline-2 outline-primary-600 focus-visible:outline"
        {id}
        bind:checked
      />
    {/if}
    <div
      class="block w-[51px] cursor-pointer rounded-2xl bg-highlight p-0.5 shadow-inner after:block after:h-7 after:w-7 after:origin-left after:rounded-full after:bg-white after:shadow-sm after:transition-transform group-active:after:scale-x-110 peer-active:after:scale-x-110 {target ===
      'light-switch'
        ? 'outline-2 outline-offset-2 outline-primary-600 dark-focus:outline dark:bg-primary-600 dark:after:origin-right dark:after:translate-x-2/3'
        : 'peer-checked:bg-primary-600 peer-checked:after:origin-right peer-checked:after:translate-x-2/3'}"
    />
  </div>
  <Icon name={iconRight} />
</label>
