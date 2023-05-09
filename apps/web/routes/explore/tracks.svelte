<script lang="ts">
  import type { TrackDetails } from "@amadeus-music/protocol";
  import { Header, Button, Icon } from "@amadeus-music/ui";
  import { library, playlists } from "$lib/data";
  import Tracks from "$lib/ui/Tracks.svelte";

  export let local: TrackDetails[];
  export let remote: TrackDetails[] | undefined;

  let selected = new Set<TrackDetails>();

  function save(tracks: TrackDetails[] | Set<TrackDetails>) {
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
