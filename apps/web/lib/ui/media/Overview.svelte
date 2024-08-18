<script lang="ts">
  import type {
    Collection,
    Playlist,
    Artist,
    Album,
  } from "@amadeus-music/protocol";
  import { type EditEvent, Virtual, Icon } from "@amadeus-music/ui";
  import type { Either } from "@amadeus-music/ui/internal/types";
  import { nully } from "@amadeus-music/util/string";
  import { createEventDispatcher } from "svelte";
  import { match } from "$lib/util/search";
  import { which } from "$lib/util/props";
  import Unit from "./Summary.svelte";
  import { ready } from "$lib/data";

  type $$Props = {
    aliases?: Record<string, string>;
    expandable?: boolean;
    prerender?: number;
    editable?: boolean;
    filter?: string;
    href?: string;
  } & Either<{
    playlists: (Playlist | undefined)[] | true;
    artists: (Artist | undefined)[] | true;
    albums: (Album | undefined)[] | true;
  }>;

  const dispatch = createEventDispatcher<{
    rearrange: { after: number | undefined; id: number };
    create: void;
  }>();

  export let playlists: (Playlist | undefined)[] | true | undefined = undefined;
  export let artists: (Artist | undefined)[] | true | undefined = undefined;
  export let albums: (Album | undefined)[] | true | undefined = undefined;
  export let aliases: Record<string, string> = {};
  export let expandable = false;
  export let href = "/library";
  export let editable = false;
  export let prerender = 3;
  export let filter = "";

  $: [type, media] = which({
    playlist: playlists,
    artist: artists,
    album: albums,
  });

  $: matcher = match(filter);
  $: items =
    media && ready(media)
      ? (expandable ? [...media, null] : media).filter(matcher)
      : Array.from<undefined>({ length: prerender });

  function edit({ detail }: EditEvent<Collection | undefined | null>) {
    if (!detail.item || detail.action !== "rearrange") return;
    dispatch("rearrange", { after: detail.after?.id, id: detail.item.id });
  }
</script>

<Virtual
  animate
  sortable={editable && !filter}
  key={(x) => x?.id}
  columns="20rem"
  {prerender}
  gap={16}
  {items}
  on:edit={edit}
  let:item
  on:end
>
  {#if item}
    <Unit
      href={nully`${href}/${aliases[item.id] ?? nully`${type}#${item.id}`}`}
      {...type && { [type]: item }}
    />
  {:else if item === null}
    <button
      class="p flex w-full cursor-pointer justify-center rounded-2xl p-4 text-highlight ring-4 ring-inset ring-highlight focus-visible:outline-none focus-visible:ring-primary-600"
      on:click={() => dispatch("create")}
    >
      <Icon of="plus" xxl />
    </button>
  {:else}
    <Unit {...type && { [type]: true }} />
  {/if}
</Virtual>
