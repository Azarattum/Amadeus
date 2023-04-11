<script lang="ts" context="module">
  const modules = import.meta.glob("../../stories/*.svelte", {
    eager: true,
  });
</script>

<script lang="ts">
  import { Portal } from "@amadeus-music/ui";
  import { page } from "$app/stores";

  $: ({ story } = $page.params);
  $: module = modules[`../../stories/${story}.svelte`] as any;
</script>

<Portal to="start" unique="light-switch">
  <input class="absolute appearance-none" id="light-switch" type="checkbox" />
</Portal>
<div class="contents">
  <svelte:component this={module?.default} />
</div>
