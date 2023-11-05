<script lang="ts">
  import Collection from "$lib/ui/Collection.svelte";
  import { artists, extra } from "$lib/data";
  import { Icon } from "@amadeus-music/ui";
  import { page } from "$app/stores";

  $: info = $artists.find((x) => x.id === +$page.url.hash.slice(1));
  $: $extra = info ? [info.title, "person"] : null;
</script>

<Collection of={info} style="artist">
  <Icon name="last" slot="action" />
</Collection>

<svelte:head>
  <title>{info ? `${info.title} - ` : ""}Amadeus</title>
</svelte:head>
