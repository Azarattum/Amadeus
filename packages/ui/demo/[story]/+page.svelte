<script lang="ts">
  import { Spinner } from "@amadeus-music/ui";
  import { page } from "$app/stores";

  $: ({ story } = $page.params);
  $: module = import(`../../stories/${story}.svelte`).catch(() => null);
</script>

<input type="checkbox" class="hidden" id="light-switch" />
<main class="contents">
  {#await module}
    <div class="flex h-screen items-center justify-center p-4">
      <Spinner />
    </div>
  {:then component}
    {#if component}
      <svelte:component this={component.default} />
    {:else}
      <div class="p-4 text-center text-red-500">Not Found!</div>
    {/if}
  {/await}
</main>
