<script lang="ts">
  import { Virtual } from "@amadeus-music/ui";
  import Card from "$lib/ui/Card.svelte";
  import { playlists } from "$lib/data";
</script>

<Virtual
  items={$playlists}
  key={(x) => x.id}
  let:item
  columns="20rem"
  gap={32}
  sortable
>
  <Card href="/library/playlist#{item.id}" playlist={item} />
</Virtual>
<!-- Loading State -->
{#if !$playlists.length}
  <div
    class="grid grid-cols-[repeat(auto-fill,minmax(min(100%,20rem),1fr))] gap-8"
  >
    {#each Array.from({ length: 3 }) as _}
      <Card playlist />
    {/each}
  </div>
{/if}
