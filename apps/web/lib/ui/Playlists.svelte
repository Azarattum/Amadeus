<script lang="ts">
  import type { PlaylistCollection } from "@amadeus-music/protocol";
  import { Icon, Virtual } from "@amadeus-music/ui";
  import type { EditEvent } from "./Tracks.svelte";
  import { createEventDispatcher } from "svelte";
  import Card from "$lib/ui/Card.svelte";
  import { match } from "$lib/util";
  import { ready } from "$lib/data";

  const dispatch = createEventDispatcher<{
    rearrange: { id: number; after: number | undefined };
    create: void;
  }>();

  export let playlists: PlaylistCollection[] = [];
  export let expandable = false;
  export let editable = false;
  export let filter = "";

  function edit({ detail }: EditEvent<PlaylistCollection | undefined | null>) {
    if (!detail.item || detail.action !== "rearrange") return;
    dispatch("rearrange", {
      id: detail.item.id,
      after: items[detail.index - 1]?.id,
    });
  }

  const prerender = 3;
  $: items = ready(playlists)
    ? (expandable ? [...playlists, null] : playlists).filter(match(filter))
    : Array.from<undefined>({ length: prerender });
</script>

<Virtual
  sortable={editable}
  key={(x) => x?.id}
  fixed={!!filter}
  columns="20rem"
  on:edit={edit}
  {prerender}
  let:item
  gap={16}
  animate
  {items}
>
  {#if item}
    <Card href="/library/playlist#{item.id}" playlist={item} />
  {:else if item === null}
    <button
      class="p flex w-full cursor-pointer justify-center rounded-2xl p-4 text-highlight ring-4 ring-inset ring-highlight"
      on:click={() => dispatch("create")}
    >
      <Icon name="plus" xxl />
    </button>
  {:else}
    <Card playlist />
  {/if}
</Virtual>
