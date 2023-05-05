<script lang="ts">
  import type { EditEvent } from "$lib/ui/Tracks.svelte";
  import { Icon, Button } from "@amadeus-music/ui";
  import Playlist from "$lib/ui/Playlist.svelte";
  import { library, playlists } from "$lib/data";
  import { page } from "$app/stores";

  $: info = $playlists.find((x) => x.id === +$page.url.hash.slice(1));
  $: tracks = info?.tracks.filter((x) => x.id) || [];

  let selected = new Set<(typeof tracks)[number]>();

  function edit({
    detail: { action, index, item },
  }: EditEvent<(typeof tracks)[number]>) {
    if (action === "rearrange") {
      library.rearrange(item.entry, tracks[index - 1]?.entry);
    }
  }

  function purge() {
    library.purge([...selected].map((x) => x.entry));
    selected.clear();
    selected = selected;
  }
</script>

<Playlist {info} {tracks} bind:selected on:edit={edit}>
  <Icon name="last" slot="action" />
  <Button air stretch on:click={purge}><Icon name="trash" /></Button>
</Playlist>
