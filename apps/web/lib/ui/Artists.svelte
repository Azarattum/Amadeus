<script lang="ts">
  import type { ArtistDetails } from "@amadeus-music/protocol";
  import { Virtual } from "@amadeus-music/ui";
  import Card from "$lib/ui/Card.svelte";
  import { ready } from "$lib/data";
  import { match } from "$lib/util";

  export let artists: (ArtistDetails | undefined)[] | undefined = undefined;
  export let filter = "";

  const prerender = 3;
  $: items =
    artists && ready(artists)
      ? artists.filter(match(filter))
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
  on:end
>
  {#if item}
    <Card href="/library/artist#{item.id}" artist={item} />
  {:else}
    <Card artist />
  {/if}
</Virtual>
