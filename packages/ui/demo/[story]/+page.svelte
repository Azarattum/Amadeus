<script context="module" lang="ts">
  const modules = import.meta.glob("../../stories/*.svelte", {
    eager: true,
  });
</script>

<script lang="ts">
  import { Portal, Layout } from "@amadeus-music/ui";
  import { page } from "$app/stores";

  $: ({ story } = $page.params);
  $: module = modules[`../../stories/${story}.svelte`] as any;
</script>

<Layout>
  <svelte:component this={module?.default} />
  <Portal to="root" unique="light-switch">
    <input class="absolute appearance-none" id="light-switch" type="checkbox" />
  </Portal>
</Layout>
