<script lang="ts">
  import { capitalize } from "@amadeus-music/util/string";
  import { page } from "$app/stores";

  $: type = $page.url.hash.slice(1);
</script>

<svelte:head>
  <title>{type ? capitalize(type) + " - " : ""}Amadeus</title>
</svelte:head>
