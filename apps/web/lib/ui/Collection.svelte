<script lang="ts">
  import type {
    CollectionType,
    Collection,
    Track,
  } from "@amadeus-music/protocol";
  import { Header, Topbar, Spacer, Stack, Icon, Text } from "@amadeus-music/ui";
  import { capitalize } from "@amadeus-music/util/string";
  import PlaybackActions from "./PlaybackActions.svelte";
  import { format } from "@amadeus-music/util/time";
  import { playback, search } from "$lib/data";
  import Tracks from "$lib/ui/Tracks.svelte";
  import Avatar from "./Avatar.svelte";
  import { match } from "$lib/util";

  export let fixed = false;
  export let style: CollectionType;
  export let of: Collection | undefined = undefined;
  export let tracks: Track[] | undefined = undefined;

  const unique = <T,>(x: T[]) => [...new Set(x)];

  $: filtered = (tracks || of?.collection?.tracks)?.filter(match($search));
  $: href =
    of?.collection && style !== "playlist"
      ? `/explore/${style}#${of?.id}`
      : undefined;
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

<Stack class={style === "playlist" ? "gap-4" : ""}>
  <Topbar title={of?.title || ""}>
    <Stack
      x
      class={`place-items-center gap-4 ${style !== "playlist" ? "p-4" : ""}`}
    >
      {#if style !== "playlist"}
        <Avatar {of} round={style === "artist"} {href} />
      {/if}
      <Stack class="grow-0 gap-2">
        <Header
          indent={style === "playlist"}
          xl={style === "playlist"}
          loading={!of}>{of?.title}</Header
        >
        <Stack x class="gap-4">
          {#if of?.collection}
            <Text secondary indent={style === "playlist"}>
              <Icon of="note" sm />
              {of.collection.size}
            </Text>
            <Text secondary indent={style === "playlist"}>
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
      </Stack>
    </Stack>
  </Topbar>
  <!-- /// TODO: albums -->

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
</Stack>
