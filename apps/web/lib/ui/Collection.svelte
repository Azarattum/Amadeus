<script lang="ts">
  import {
    Header,
    Topbar,
    Spacer,
    Stack,
    Morph,
    Words,
    Icon,
    Text,
  } from "@amadeus-music/ui";
  import type {
    CollectionType,
    Collection,
    Track,
  } from "@amadeus-music/protocol";
  import { capitalize } from "@amadeus-music/util/string";
  import PlaybackActions from "./PlaybackActions.svelte";
  import { format } from "@amadeus-music/util/time";
  import { playback, search } from "$lib/data";
  import Tracks from "$lib/ui/Tracks.svelte";
  import { cubicInOut } from "svelte/easing";
  import { fade } from "svelte/transition";
  import Avatar from "./Avatar.svelte";
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
    {#if style !== "playlist"}
      <Morph key="avatar-{style}-{of?.id}">
        <Avatar {of} round={style === "artist"} class="z-30" {href} />
      </Morph>
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

<div transition:fade={{ easing: cubicInOut, duration: 300 }}>
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
</div>
