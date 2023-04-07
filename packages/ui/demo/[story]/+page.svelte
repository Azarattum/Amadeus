<script lang="ts" context="module">
  const modules = import.meta.glob("../../stories/*.svelte", {
    eager: true,
  });
</script>

<script lang="ts">
  import { page } from "$app/stores";

  $: ({ story } = $page.params);
  $: module = modules[`../../stories/${story}.svelte`] as any;
</script>

<input type="checkbox" class="hidden" id="light-switch" />
<main class="contents">
  <svelte:component this={module?.default} />
</main>
