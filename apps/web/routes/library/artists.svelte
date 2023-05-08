<script lang="ts">
  import { Virtual } from "@amadeus-music/ui";
  import { artists, ready } from "$lib/data";
  import Card from "$lib/ui/Card.svelte";

  const prerender = 3;
  $: items = ready($artists)
    ? $artists
    : Array.from<undefined>({ length: prerender });
</script>

<Virtual
  key={(x) => x?.id}
  columns="20rem"
  {prerender}
  let:item
  gap={32}
  animate
  {items}
>
  {#if item}
    <Card href="/library/artist#{item.id}" artist={item} />
  {:else}
    <Card artist />
  {/if}
</Virtual>
