<script lang="ts">
  import { library, playlist, playlists, target } from "$lib/data";
  import type { TrackEntry } from "@amadeus-music/protocol";
  import type { EditEvent } from "$lib/ui/Tracks.svelte";
  import { Icon, Button } from "@amadeus-music/ui";
  import Playlist from "$lib/ui/Playlist.svelte";
  import { page } from "$app/stores";
  import { onDestroy } from "svelte";

  $: $target = +$page.url.hash.slice(1) || 0;
  $: info = $playlist[0]
    ? $playlist[0]
    : $playlists.find(({ id }) => id === $target);

  let selected = new Set<TrackEntry>();

  function edit({ detail: { action, index, item } }: EditEvent<TrackEntry>) {
    if (!info) return;
    if (action === "rearrange") {
      library.rearrange(item.entry, info.tracks[index - 1]?.entry);
    }
  }

  function purge() {
    library.purge([...selected].map((x) => x.entry));
    selected.clear();
    selected = selected;
  }

  onDestroy(() => playlist.set([]));
</script>

<Playlist {info} bind:selected on:edit={edit}>
  <Icon name="last" slot="action" />
  <Button air stretch on:click={purge}><Icon name="trash" /></Button>
</Playlist>

<svelte:head>
  <title>{info ? `${info.title} - ` : ""}Amadeus</title>
</svelte:head>
