<script lang="ts">
  import type { CollectionType, Collection } from "@amadeus-music/protocol";
  import { Header, Stack } from "@amadeus-music/ui";
  import { Media } from "$lib/ui";

  export let of: `${CollectionType}s`;
  export let local: Collection[];
  export let remote: Collection[] | undefined;
</script>

<Stack class="gap-4 p-4">
  {#if local.length}
    <div>
      <Header sm>Library</Header>
      <Media.Overview {...{ [of]: local }} />
    </div>
  {/if}
  <div>
    <Header sm>Search</Header>
    <Media.Overview {...{ [of]: remote ?? true }} href="/explore" on:end />
  </div>
</Stack>
