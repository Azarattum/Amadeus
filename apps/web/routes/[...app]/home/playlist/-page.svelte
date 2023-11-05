<script lang="ts">
  import type { Track } from "@amadeus-music/protocol";
  import Collection from "$lib/ui/Collection.svelte";
  import { Icon, Button } from "@amadeus-music/ui";
  import { library, feed } from "$lib/data";
  import { page } from "$app/stores";

  $: info = $feed.find((x) => x.id === +$page.url.hash.slice(1));
  let selected = new Set<Track>();

  function purge() {
    library.purge(
      [...selected].map((x) => x.entry).filter((x): x is number => !!x)
    );
    selected.clear();
    selected = selected;
  }
</script>

<Collection of={info} style="playlist" bind:selected fixed>
  <Icon name="last" slot="action" />
  <Button air stretch on:click={purge}><Icon name="trash" /></Button>
</Collection>

<svelte:head>
  <title>{info ? `${info.title} - ` : ""}Amadeus</title>
</svelte:head>
