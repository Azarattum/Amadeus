<script lang="ts">
  import PlaybackActions from "$lib/ui/PlaybackActions.svelte";
  import { Header, Button, Icon } from "@amadeus-music/ui";
  import { playlists, playback, library } from "$lib/data";
  import type { Track } from "@amadeus-music/protocol";
  import Tracks from "$lib/ui/Tracks.svelte";

  export let local: Track[];
  export let remote: Track[] | undefined;

  let selected = new Set<Track>();

  function save(tracks: Set<Track> | Track[]) {
    library.push([...tracks], $playlists[0].id);
    if (tracks == selected) {
      selected.clear();
      selected = selected;
    }
  }
</script>

{#if local.length}
  <div class="pt-4">
    <Header indent sm>Library</Header>
    <Tracks
      fixed
      tracks={local}
      on:action={({ detail }) => playback.push([detail], "last")}
      let:selected
    >
      <PlaybackActions {selected} />
      <Icon of="last" slot="action" />
    </Tracks>
  </div>
{/if}
<div class="pt-4">
  <Header indent sm>Search</Header>
  <Tracks
    fixed
    tracks={remote}
    on:action={({ detail }) => save([detail])}
    let:selected
    on:end
  >
    <Icon of="save" slot="action" />
    <PlaybackActions {selected} />
    <Button air on:click={() => save(selected)}>
      <Icon of="save" />
    </Button>
  </Tracks>
</div>
