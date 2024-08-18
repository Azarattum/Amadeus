<script lang="ts">
  import type { CollectionType, Collection } from "@amadeus-music/protocol";
  import { Header, Stack } from "@amadeus-music/ui";
  import { Media } from "$lib/ui";

  export let style: CollectionType;
  export let local: Collection[];
  export let remote: Collection[] | undefined;
</script>

<Stack class="gap-4 p-4">
  {#if local.length}
    <div>
      <Header sm>Library</Header>
      <Media.Overview of={local} {style} />
    </div>
  {/if}
  <div>
    <Header sm>Search</Header>
    <Media.Overview of={remote} href="/explore" {style} on:end />
  </div>
</Stack>
