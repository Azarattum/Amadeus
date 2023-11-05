<script lang="ts">
  import type { Collection, CollectionType } from "@amadeus-music/protocol";
  import { Header, Stack } from "@amadeus-music/ui";
  import Overview from "$lib/ui/Overview.svelte";

  export let style: CollectionType;
  export let local: Collection[];
  export let remote: Collection[] | undefined;
</script>

<Stack class="gap-4 p-4">
  {#if local.length}
    <div>
      <Header sm>Library</Header>
      <Overview {style} of={local} />
    </div>
  {/if}
  <div>
    <Header sm>Search</Header>
    <Overview {style} of={remote} href="/explore" on:end />
  </div>
</Stack>
