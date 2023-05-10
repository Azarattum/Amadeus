<script lang="ts">
  import type { AlbumDetails } from "@amadeus-music/protocol";
  import { Header, Stack } from "@amadeus-music/ui";
  import Albums from "$lib/ui/Albums.svelte";

  export let local: AlbumDetails[];
  export let remote: AlbumDetails[] | undefined;
</script>

<Stack p grow gap="lg">
  {#if local.length}
    <div>
      <Header sm>Library</Header>
      <Albums albums={local} />
    </div>
  {/if}
  <div>
    <Header sm>Search</Header>
    <Albums albums={remote} href="/explore" on:end />
  </div>
</Stack>
