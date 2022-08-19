<script lang="ts">
  import { Spinner } from "$lib/primitive";
  import { page } from "$app/stores";

  $: ({ story } = $page.params);
  $: module = import(`../../stories/${story}.svelte`).catch(() => null);
</script>

{#await module}
  <div class="flex justify-center p-4">
    <Spinner />
  </div>
{:then component}
  {#if component}
    <svelte:component this={component.default} />
  {:else}
    <div class="text-center p-4 text-red-500">Not Found!</div>
  {/if}
{/await}
