<script lang="ts">
  import { type EditEvent, Button, Icon } from "@amadeus-music/ui";
  import type { Track } from "@amadeus-music/protocol";
  import Collection from "$lib/ui/Collection.svelte";
  import { playlists, library } from "$lib/data";
  import { page } from "$app/stores";

  export let title = "";

  $: info = $playlists.find((x) => x.id === +$page.url.hash.slice(1));
  $: title = info?.title || "";

  let selected = new Set<Track>();

  function edit({ detail: { action, after, item } }: EditEvent<Track>) {
    if (!item.entry) return;
    if (action === "rearrange") library.rearrange(item.entry, after?.entry);
  }

  function purge() {
    library.purge(
      [...selected].map((x) => x.entry).filter((x): x is number => !!x),
    );
    selected.clear();
    selected = selected;
  }
</script>

<Collection of={info} style="playlist" on:edit={edit} bind:selected>
  <Icon of="last" slot="action" />
  <Button air on:click={purge}><Icon of="trash" /></Button>
</Collection>
