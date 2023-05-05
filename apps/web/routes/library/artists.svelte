<script lang="ts">
  import { Virtual } from "@amadeus-music/ui";
  import Card from "$lib/ui/Card.svelte";
  import { artists } from "$lib/data";
</script>

<Virtual
  key={(x) => x.id}
  items={$artists}
  columns="20rem"
  let:item
  gap={32}
  animate
>
  <Card href="/library/artist#{item.id}" artist={item} />
</Virtual>
<!-- Loading State -->
{#if !$artists.length}
  <div
    class="grid grid-cols-[repeat(auto-fill,minmax(min(100%,20rem),1fr))] gap-8"
  >
    {#each Array.from({ length: 3 }) as _}
      <Card artist />
    {/each}
  </div>
{/if}
