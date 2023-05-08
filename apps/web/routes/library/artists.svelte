<script lang="ts">
  import { artists, ready, search } from "$lib/data";
  import { Virtual } from "@amadeus-music/ui";
  import Card from "$lib/ui/Card.svelte";
  import { match } from "$lib/util";

  const prerender = 3;
  $: items = ready($artists)
    ? $artists.filter(match($search))
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
