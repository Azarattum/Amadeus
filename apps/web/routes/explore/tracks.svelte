<script lang="ts">
  import { Header, Button, Icon } from "@amadeus-music/ui";
  import type { Track } from "@amadeus-music/protocol";
  import { library, playlists } from "$lib/data";
  import Tracks from "$lib/ui/Tracks.svelte";

  export let local: Track[];
  export let remote: Track[] | undefined;

  let selected = new Set<Track>();

  function save(tracks: Track[] | Set<Track>) {
    library.push([...tracks], $playlists[0].id);
    if (tracks == selected) {
      selected.clear();
      selected = selected;
    }
  }
</script>

{#if local.length}
  <div class="pt-4">
    <Header sm indent>Library</Header>
    <Tracks fixed tracks={local}><Icon name="last" slot="action" /></Tracks>
  </div>
{/if}
<div class="pt-4">
  <Header sm indent>Search</Header>
  <Tracks
    fixed
    on:end
    bind:selected
    tracks={remote}
    on:action={({ detail }) => save([detail])}
  >
    <Icon name="save" slot="action" />
    <Button air stretch on:click={() => save(selected)}>
      <Icon name="save" />
    </Button>
  </Tracks>
</div>
