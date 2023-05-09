<script lang="ts">
  import type { ArtistDetails } from "@amadeus-music/protocol";
  import { Header, Stack } from "@amadeus-music/ui";
  import Artists from "$lib/ui/Artists.svelte";

  export let local: ArtistDetails[];
  export let remote: ArtistDetails[] | undefined;
</script>

<Stack p grow gap="lg">
  {#if local.length}
    <div>
      <Header sm>Library</Header>
      <Artists artists={local} />
    </div>
  {/if}
  <div>
    <Header sm>Search</Header>
    <Artists artists={remote} on:end />
  </div>
</Stack>
