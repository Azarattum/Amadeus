<script lang="ts">
  import Collection from "$lib/ui/Collection.svelte";
  import { Icon } from "@amadeus-music/ui";
  import { artists } from "$lib/data";
  import { page } from "$app/stores";

  $: info = $artists.find((x) => x.id === +$page.url.hash.slice(1));
</script>

<Collection of={info} style="artist">
  <Icon of="last" slot="action" />
</Collection>

<svelte:head>
  <title>{info ? `${info.title} - ` : ""}Amadeus</title>
</svelte:head>
