<script lang="ts">
  import { playlists, ready, search } from "$lib/data";
  import { Icon, Virtual } from "@amadeus-music/ui";
  import Card from "$lib/ui/Card.svelte";
  import { match } from "$lib/util";

  const prerender = 3;
  $: items = ready($playlists)
    ? [...$playlists, null].filter(match($search))
    : Array.from<undefined>({ length: prerender });
</script>

<Virtual
  key={(x) => x?.id}
  fixed={!!$search}
  columns="20rem"
  {prerender}
  let:item
  gap={32}
  sortable
  animate
  {items}
>
  {#if item}
    <Card href="/library/playlist#{item.id}" playlist={item} />
  {:else if item === null}
    <button
      class="p flex w-full cursor-pointer justify-center rounded-2xl p-4 text-highlight ring-4 ring-inset ring-highlight"
      on:click={() =>
        playlists.create({ title: Math.random().toString(36).slice(2) })}
    >
      <Icon name="plus" xxl />
    </button>
  {:else}
    <Card playlist />
  {/if}
</Virtual>
