<script lang="ts">
  import {
    Header,
    Topbar,
    Spacer,
    Stack,
    Morph,
    Words,
    Image,
    Icon,
    Text,
  } from "@amadeus-music/ui";
  import type {
    CollectionType,
    Collection,
    Track,
  } from "@amadeus-music/protocol";
  import { capitalize, nully } from "@amadeus-music/util/string";
  import PlaybackActions from "./PlaybackActions.svelte";
  import FallbackCover from "./FallbackCover.svelte";
  import { format } from "@amadeus-music/util/time";
  import { playback, search } from "$lib/data";
  import Tracks from "$lib/ui/Tracks.svelte";
  import ImageGrid from "./ImageGrid.svelte";
  import { match } from "$lib/util";

  export let fixed = false;
  export let style: CollectionType;
  export let href: string | undefined = undefined;
  export let of: Collection | undefined = undefined;
  export let tracks: Track[] | undefined = undefined;

  const unique = <T,>(x: T[]) => [...new Set(x)];

  $: filtered = (tracks || of?.collection?.tracks)?.filter(match($search));
  $: details = of
    ? unique(
        "artists" in of
          ? of.artists.map((x) => x.title)
          : "sources" in of
            ? of?.sources
                .map((x: string) => capitalize(x.split("/")[0]))
                .filter((x): x is string => !!x)
            : [],
      ).join(", ")
    : "Loading";
</script>

<Topbar title={of?.title || ""}>
  <Stack
    x
    class={`place-items-center gap-4 ${style !== "playlist" ? "p-4" : "pb-4"}`}
  >
    {#if (!of || (of && "arts" in of)) && style !== "playlist"}
      <Morph key="thumb-{style}-{of?.id}">
        <ImageGrid
          class="{style === 'artist' ? 'rounded-full' : 'rounded-2xl'} z-30"
          {href}
          let:size
        >
          <Image
            thumbnail={of && (of.thumbnails?.[0] || "")}
            src={of && (of.arts?.[0] || "")}
            {size}
          >
            <FallbackCover of={style} xl id={of?.id} />
          </Image>
        </ImageGrid>
      </Morph>
    {:else if of && filtered?.length}
      <div
        class="pointer-events-none absolute left-4 top-[137px] z-10 flex flex-col gap-2 rounded-2xl lg:top-[170px]"
      >
        {#each filtered?.slice(0, 4) || [] as { album, id }, i}
          <Morph key={`thumb-${style}-${of?.id}-${i}`} class="!block">
            <Image
              thumbnail={album.thumbnails?.[0] || ""}
              src={album.arts?.[0] || ""}
              class="hidden"
            >
              <FallbackCover of="track" {id} />
            </Image>
          </Morph>
        {/each}
      </div>
    {/if}
    <Stack class="z-20 grow-0 gap-2">
      <Morph container key="heading-{style}-{of?.id}">
        <Header
          indent={style === "playlist"}
          xl={style === "playlist"}
          loading={!of}
        >
          <!-- This div is needed for the container morph -->
          <div>
            <Morph key="title-{style}-{of?.id}">
              <Words from={of?.title} />
            </Morph>
          </div>
        </Header>
      </Morph>
      <Morph key={`meta-${style}-${of?.id}`}>
        <Stack x class="max-w-max gap-4 {style === 'playlist' ? 'ml-4' : ''}">
          {#if of?.collection}
            <Text secondary>
              <Icon of="note" sm />
              {of.collection.size}
            </Text>
            <Text secondary>
              <Icon of="clock" sm />
              {format(of.collection.duration)}
            </Text>
            {#if "remote" in of && of.remote}
              <Spacer />
              <Text secondary><Icon of="share" sm /> {of.remote}</Text>
            {/if}
          {:else}
            <Text secondary indent={style === "playlist"} loading={!of}>
              {#if style === "artist"}
                <Icon of="globe" sm />
              {/if}
              {details}
            </Text>
          {/if}
        </Stack>
      </Morph>
    </Stack>
  </Stack>
</Topbar>
<!-- /// TODO: albums -->

<Morph
  loosely
  class={style === "playlist"
    ? "[&_[draggable='true']:nth-child(-n+4)_.rounded]:invisible"
    : ""}
  key={nully`${style}-${of?.id}`}
>
  <Tracks
    fixed={fixed || (style === "playlist" ? !!$search : true)}
    tracks={filtered}
    on:action={({ detail }) => playback.push([detail], "last")}
    let:selected
    on:click
    on:edit
    on:end
  >
    <!-- /// TODO: support other quick actions -->
    <Icon of="last" slot="action" />
    <PlaybackActions {selected} />
    <slot {selected} />
  </Tracks>
</Morph>
