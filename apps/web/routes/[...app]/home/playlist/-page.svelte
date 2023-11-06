<script lang="ts">
  import type { Track } from "@amadeus-music/protocol";
  import Collection from "$lib/ui/Collection.svelte";
  import { Button, Icon } from "@amadeus-music/ui";
  import { library, feed } from "$lib/data";

  export let id: number;
  $: info = $feed.find((x) => x.id === id);
  let selected = new Set<Track>();

  function purge() {
    library.purge(
      [...selected].map((x) => x.entry).filter((x): x is number => !!x),
    );
    selected.clear();
    selected = selected;
  }
</script>

<Collection of={info} fixed style="playlist" bind:selected>
  <Icon of="last" slot="action" />
  <Button air on:click={purge}><Icon of="trash" /></Button>
</Collection>

<svelte:head>
  <title>{info ? `${info.title} - ` : ""}Amadeus</title>
</svelte:head>
