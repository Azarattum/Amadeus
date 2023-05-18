<script lang="ts">
  import { Icon, Button, type EditEvent } from "@amadeus-music/ui";
  import { extra, library, playlists } from "$lib/data";
  import type { Track } from "@amadeus-music/protocol";
  import Collection from "$lib/ui/Collection.svelte";
  import { page } from "$app/stores";

  $: info = $playlists.find((x) => x.id === +$page.url.hash.slice(1));
  $: $extra = info ? [info.title, "disk"] : null;

  let selected = new Set<Track>();

  function edit({ detail: { action, after, item } }: EditEvent<Track>) {
    if (!item.entry) return;
    if (action === "rearrange") library.rearrange(item.entry, after?.entry);
  }

  function purge() {
    library.purge(
      [...selected].map((x) => x.entry).filter((x): x is number => !!x)
    );
    selected.clear();
    selected = selected;
  }
</script>

<Collection of={info} style="playlist" bind:selected on:edit={edit}>
  <Icon name="last" slot="action" />
  <Button air stretch on:click={purge}><Icon name="trash" /></Button>
</Collection>

<svelte:head>
  <title>{info ? `${info.title} - ` : ""}Amadeus</title>
</svelte:head>
