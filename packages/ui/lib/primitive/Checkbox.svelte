<script>
  import Icon from "./Icon.svelte";

  export let checked = false;
  export let iconLeft = "";
  export let iconRight = "";

  const id = Math.random().toString();
</script>

<div class="flex w-max items-center gap-2 text-content-300">
  <input type="checkbox" class="peer hidden" {id} bind:checked />
  {#if iconLeft}
    <Icon name={iconLeft} />
  {/if}
  <label
    for={id}
    class="surface-200 block w-[51px] cursor-pointer rounded-2xl p-0.5
      after:block after:h-7
      after:w-7 after:rounded-full after:bg-white after:shadow-sm after:transition-transform peer-checked:bg-primary-600 peer-checked:after:translate-x-2/3
      "
  />
  {#if iconRight}
    <Icon name={iconRight} />
  {/if}
</div>
