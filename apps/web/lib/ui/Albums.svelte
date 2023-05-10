<script lang="ts">
  import type { AlbumDetails } from "@amadeus-music/protocol";
  import { Virtual } from "@amadeus-music/ui";
  import Card from "$lib/ui/Card.svelte";
  import { ready } from "$lib/data";
  import { match } from "$lib/util";

  export let albums: (AlbumDetails | undefined)[] | undefined = undefined;
  export let href = "/library";
  export let filter = "";

  const prerender = 3;
  $: items =
    albums && ready(albums)
      ? albums.filter(match(filter))
      : Array.from<undefined>({ length: prerender });
</script>

<Virtual
  key={(x) => x?.id}
  columns="20rem"
  {prerender}
  let:item
  gap={16}
  animate
  {items}
  on:end
>
  {#if item}
    <Card href="{href}/album#{item.id}" album={item} />
  {:else}
    <Card album />
  {/if}
</Virtual>
